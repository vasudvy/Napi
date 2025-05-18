/**
 * Napier AI Proxy Server
 * Acts as an intermediary between the Napier Widget and Elevenlabs API
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

// Initialize Express application
const app = express();
const port = process.env.PORT || 3000;

// Setup middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configure multer for handling audio file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Store active connections
const activeConnections = new Map();

// Elevenlabs API configuration
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';
const ELEVENLABS_AGENT_ID = 'agent_01jvg9443reddrc38gye4jhfvr'; // Using the provided agent ID

/**
 * Route to connect to the Napier AI service
 */
app.post('/api/connect', async (req, res) => {
  try {
    const { napierClientId } = req.body;
    
    if (!napierClientId) {
      return res.status(400).json({ error: 'Napier Client ID is required' });
    }
    
    // Store connection with client ID
    if (!activeConnections.has(napierClientId)) {
      activeConnections.set(napierClientId, {
        connected: true,
        tools: {},
        sessionId: generateSessionId()
      });
    }
    
    console.log(`Client ${napierClientId} connected`);
    
    return res.json({
      success: true,
      message: 'Connected to Napier AI service',
      sessionId: activeConnections.get(napierClientId).sessionId
    });
  } catch (error) {
    console.error('Error connecting to Napier AI:', error);
    return res.status(500).json({ error: 'Failed to connect to Napier AI service' });
  }
});

/**
 * Route to disconnect from the Napier AI service
 */
app.post('/api/disconnect', (req, res) => {
  try {
    const { napierClientId } = req.body;
    
    if (!napierClientId) {
      return res.status(400).json({ error: 'Napier Client ID is required' });
    }
    
    if (activeConnections.has(napierClientId)) {
      activeConnections.delete(napierClientId);
      console.log(`Client ${napierClientId} disconnected`);
    }
    
    return res.json({
      success: true,
      message: 'Disconnected from Napier AI service'
    });
  } catch (error) {
    console.error('Error disconnecting from Napier AI:', error);
    return res.status(500).json({ error: 'Failed to disconnect from Napier AI service' });
  }
});

/**
 * Route to process audio and interact with Elevenlabs API
 */
app.post('/api/process-audio', upload.single('audio'), async (req, res) => {
  try {
    const { napierClientId } = req.body;
    
    if (!napierClientId) {
      return res.status(400).json({ error: 'Napier Client ID is required' });
    }
    
    if (!activeConnections.has(napierClientId)) {
      return res.status(400).json({ error: 'Not connected to Napier AI service' });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'Audio file is required' });
    }
    
    const audioFilePath = req.file.path;
    const connection = activeConnections.get(napierClientId);
    
    // Upload audio to Elevenlabs and initiate conversation
    const formData = new FormData();
    formData.append('audio', fs.createReadStream(audioFilePath));
    
    // Make API call to Elevenlabs
    const elevenLabsResponse = await axios.post(
      `${ELEVENLABS_API_URL}/conversation`, 
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        params: {
          agent_id: ELEVENLABS_AGENT_ID,
          session_id: connection.sessionId,
        }
      }
    );
    
    // Clean up the uploaded file
    fs.unlinkSync(audioFilePath);
    
    return res.json({
      success: true,
      message: 'Audio processed successfully',
      response: elevenLabsResponse.data
    });
    
  } catch (error) {
    console.error('Error processing audio:', error);
    return res.status(500).json({ error: 'Failed to process audio' });
  }
});

/**
 * Route to execute a client tool
 */
app.post('/api/execute-tool', async (req, res) => {
  try {
    const { napierClientId, tool, data } = req.body;
    
    if (!napierClientId) {
      return res.status(400).json({ error: 'Napier Client ID is required' });
    }
    
    if (!activeConnections.has(napierClientId)) {
      return res.status(400).json({ error: 'Not connected to Napier AI service' });
    }
    
    if (!tool) {
      return res.status(400).json({ error: 'Tool name is required' });
    }
    
    let result;
    
    // Simulate tool execution
    switch (tool) {
      case 'battery':
        result = await simulateBatteryLevel();
        break;
      case 'brightness':
        result = await simulateChangeBrightness(data.brightness);
        break;
      case 'flash':
        result = await simulateFlashScreen();
        break;
      default:
        return res.status(400).json({ error: `Unknown tool: ${tool}` });
    }
    
    return res.json({
      success: true,
      message: `Tool ${tool} executed successfully`,
      result
    });
    
  } catch (error) {
    console.error(`Error executing tool:`, error);
    return res.status(500).json({ error: 'Failed to execute tool' });
  }
});

/**
 * WebSocket server for real-time communication
 */
const server = app.listen(port, () => {
  console.log(`Napier AI Proxy Server running on port ${port}`);
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Received message:', data);
      
      // Handle different message types
      if (data.type === 'register') {
        // Register this WebSocket with a client ID
        ws.napierClientId = data.napierClientId;
        ws.send(JSON.stringify({ type: 'registered', success: true }));
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  });
  
  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });
});

// Helper functions
function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

async function simulateBatteryLevel() {
  // Simulate getting battery level
  const batteryLevel = Math.random().toFixed(2);
  return { batteryLevel };
}

async function simulateChangeBrightness(brightness) {
  // Simulate changing brightness
  return { brightness };
}

async function simulateFlashScreen() {
  // Simulate flashing screen
  return { success: true };
}

// Export for testing
module.exports = app;