/**
 * Napier AI Widget
 * Embeddable widget that connects to Napier AI services through a proxy server
 */

class NapierWidget {
  constructor(config = {}) {
    this.config = {
      napierClientId: config.napierClientId || null,
      container: config.container || null,
      proxyUrl: config.proxyUrl || 'http://localhost:3000',
      theme: config.theme || 'dark',
      position: config.position || 'bottom-right',
      size: config.size || 'default',
      ...config
    };
    
    this.isConnected = false;
    this.isListening = false;
    this.audioContext = null;
    this.mediaRecorder = null;
    this.audioChunks = [];
    
    this.init();
  }
  
  init() {
    if (!this.config.container) {
      console.error('Napier Widget: No container element specified');
      return;
    }
    
    if (!this.config.napierClientId) {
      console.error('Napier Widget: No Napier Client ID provided');
      return;
    }
    
    this.render();
    this.attachEventListeners();
    this.setupAudio();
  }
  
  render() {
    const container = document.querySelector(this.config.container);
    if (!container) {
      console.error(`Napier Widget: Container element "${this.config.container}" not found`);
      return;
    }
    
    const widgetHTML = `
      <div class="napier-widget ${this.config.theme} ${this.config.position} ${this.config.size}">
        <div class="napier-button ${this.isListening ? 'active' : ''}">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mic-icon">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
            <line x1="12" x2="12" y1="19" y2="22"></line>
          </svg>
        </div>
        <div class="napier-status">${this.isConnected ? 'Connected' : 'Disconnected'}</div>
        <div class="napier-tools">
          <div class="napier-tool-item" data-tool="battery">Get Battery</div>
          <div class="napier-tool-item" data-tool="brightness">Change Brightness</div>
          <div class="napier-tool-item" data-tool="flash">Flash Screen</div>
        </div>
        <div class="napier-response"></div>
      </div>
    `;
    
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .napier-widget {
        position: fixed;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        align-items: center;
        border-radius: 16px;
        padding: 16px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        transition: all 0.3s ease;
        font-family: Inter, sans-serif;
      }
      
      .napier-widget.dark {
        background: linear-gradient(to bottom, #0F172A, #1E293B);
        color: #E2E8F0;
      }
      
      .napier-widget.light {
        background: linear-gradient(to bottom, #F8FAFC, #EFF6FF);
        color: #334155;
      }
      
      .napier-widget.bottom-right {
        bottom: 24px;
        right: 24px;
      }
      
      .napier-widget.bottom-left {
        bottom: 24px;
        left: 24px;
      }
      
      .napier-widget.top-right {
        top: 24px;
        right: 24px;
      }
      
      .napier-widget.top-left {
        top: 24px;
        left: 24px;
      }
      
      .napier-widget.default {
        width: 280px;
      }
      
      .napier-widget.compact {
        width: 200px;
      }
      
      .napier-widget.expanded {
        width: 350px;
      }
      
      .napier-button {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background-color: #3B82F6;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
        transition: all 0.3s ease;
        margin-bottom: 16px;
      }
      
      .napier-button.active {
        background-color: #EF4444;
        box-shadow: 0 0 20px rgba(239, 68, 68, 0.5);
      }
      
      .napier-button:hover {
        transform: scale(1.05);
      }
      
      .napier-status {
        font-size: 14px;
        margin-bottom: 12px;
        opacity: 0.8;
      }
      
      .napier-tools {
        display: flex;
        flex-direction: column;
        width: 100%;
        margin-top: 12px;
      }
      
      .napier-tool-item {
        padding: 10px;
        border-radius: 8px;
        margin-bottom: 8px;
        cursor: pointer;
        background-color: rgba(255, 255, 255, 0.1);
        transition: all 0.2s ease;
        text-align: center;
      }
      
      .napier-tool-item:hover {
        background-color: rgba(255, 255, 255, 0.2);
      }
      
      .napier-response {
        margin-top: 16px;
        padding: 10px;
        border-radius: 8px;
        background-color: rgba(255, 255, 255, 0.05);
        width: 100%;
        min-height: 40px;
        max-height: 150px;
        overflow-y: auto;
        word-break: break-word;
        display: none;
      }
      
      .mic-icon {
        color: white;
      }
    `;
    
    container.innerHTML = widgetHTML;
    document.head.appendChild(styleElement);
  }
  
  attachEventListeners() {
    const container = document.querySelector(this.config.container);
    if (!container) return;
    
    const micButton = container.querySelector('.napier-button');
    if (micButton) {
      micButton.addEventListener('click', () => this.toggleListening());
    }
    
    const toolItems = container.querySelectorAll('.napier-tool-item');
    toolItems.forEach(item => {
      item.addEventListener('click', (e) => {
        const tool = e.target.getAttribute('data-tool');
        this.executeTool(tool);
      });
    });
  }
  
  setupAudio() {
    // Initialize audio context
    try {
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();
    } catch (e) {
      console.error('Napier Widget: Web Audio API is not supported in this browser');
    }
  }
  
  async toggleListening() {
    if (this.isListening) {
      this.stopListening();
    } else {
      await this.startListening();
    }
  }
  
  async startListening() {
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];
      
      this.mediaRecorder.addEventListener('dataavailable', event => {
        this.audioChunks.push(event.data);
      });
      
      this.mediaRecorder.addEventListener('stop', () => {
        this.processAudio();
      });
      
      this.mediaRecorder.start();
      this.isListening = true;
      this.updateUI();
      
      // Connect to the Napier service through proxy
      await this.connectToService();
      
    } catch (error) {
      console.error('Napier Widget: Failed to start listening', error);
      this.showResponse('Error: Microphone permission denied.');
    }
  }
  
  stopListening() {
    if (this.mediaRecorder && this.isListening) {
      this.mediaRecorder.stop();
      this.isListening = false;
      this.updateUI();
      
      // Disconnect from service
      this.disconnectFromService();
    }
  }
  
  async processAudio() {
    const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
    
    // Create form data
    const formData = new FormData();
    formData.append('audio', audioBlob);
    formData.append('napierClientId', this.config.napierClientId);
    
    try {
      const response = await fetch(`${this.config.proxyUrl}/api/process-audio`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      const result = await response.json();
      this.showResponse(result.message || 'Processing complete');
      
    } catch (error) {
      console.error('Napier Widget: Failed to process audio', error);
      this.showResponse('Error: Could not process audio');
    }
  }
  
  async connectToService() {
    try {
      const response = await fetch(`${this.config.proxyUrl}/api/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          napierClientId: this.config.napierClientId,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      const result = await response.json();
      this.isConnected = true;
      this.updateUI();
      this.showResponse(result.message || 'Connected to Napier AI');
      
    } catch (error) {
      console.error('Napier Widget: Failed to connect to service', error);
      this.isConnected = false;
      this.updateUI();
      this.showResponse('Error: Could not connect to Napier AI service');
    }
  }
  
  async disconnectFromService() {
    try {
      const response = await fetch(`${this.config.proxyUrl}/api/disconnect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          napierClientId: this.config.napierClientId,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      this.isConnected = false;
      this.updateUI();
      
    } catch (error) {
      console.error('Napier Widget: Failed to disconnect from service', error);
    }
  }
  
  async executeTool(tool) {
    if (!this.isConnected) {
      this.showResponse('Please connect to Napier AI first');
      return;
    }
    
    try {
      let data = {};
      
      if (tool === 'brightness') {
        const brightness = prompt('Enter brightness level (0-1):', '0.5');
        if (brightness === null) return;
        data = { brightness: parseFloat(brightness) };
      }
      
      const response = await fetch(`${this.config.proxyUrl}/api/execute-tool`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          napierClientId: this.config.napierClientId,
          tool,
          data,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      const result = await response.json();
      this.showResponse(result.message || `Executed ${tool}`);
      
    } catch (error) {
      console.error(`Napier Widget: Failed to execute tool ${tool}`, error);
      this.showResponse(`Error: Could not execute ${tool}`);
    }
  }
  
  updateUI() {
    const container = document.querySelector(this.config.container);
    if (!container) return;
    
    const button = container.querySelector('.napier-button');
    const status = container.querySelector('.napier-status');
    
    if (button) {
      if (this.isListening) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    }
    
    if (status) {
      status.textContent = this.isConnected ? 'Connected' : 'Disconnected';
    }
  }
  
  showResponse(message) {
    const container = document.querySelector(this.config.container);
    if (!container) return;
    
    const responseElement = container.querySelector('.napier-response');
    if (responseElement) {
      responseElement.textContent = message;
      responseElement.style.display = 'block';
    }
  }
}

// Export the widget
if (typeof window !== 'undefined') {
  window.NapierWidget = NapierWidget;
}

// For module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NapierWidget;
}