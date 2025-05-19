// This file creates a self-contained widget that can be embedded on any webpage
// It uses the same core functionality from your existing app

(function() {
  // Create widget container and styles
  function createWidgetStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .napier-widget-container {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999;
      }
      
      .napier-call-button {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
      }
      
      .napier-call-button-active {
        background-color: rgba(239, 68, 68, 0.2);
      }
      
      .napier-button-inner {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: #3B82F6;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
        transition: all 0.3s ease;
      }
      
      .napier-button-inner-active {
        background-color: #EF4444;
        box-shadow: 0 0 20px rgba(239, 68, 68, 0.5);
      }
    `;
    document.head.appendChild(style);
  }

  // Create widget button
  function createWidgetButton() {
    const container = document.createElement('div');
    container.className = 'napier-widget-container';
    
    const button = document.createElement('div');
    button.className = 'napier-call-button';
    
    const buttonInner = document.createElement('div');
    buttonInner.className = 'napier-button-inner';
    
    // Add mic icon
    buttonInner.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E2E8F0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" x2="12" y1="19" y2="22"></line></svg>`;
    
    button.appendChild(buttonInner);
    container.appendChild(button);
    document.body.appendChild(container);
    
    return { button, buttonInner };
  }

  // Request microphone permission
  async function requestMicrophonePermission() {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      return false;
    }
  }

  // Battery level tool implementation
  async function getBatteryLevel() {
    try {
      if ('getBattery' in navigator) {
        const battery = await navigator.getBattery();
        return battery.level;
      } else {
        return 'Error: Device does not support retrieving the battery level.';
      }
    } catch (error) {
      console.error('Error getting battery level:', error);
      return 'Error: Could not retrieve battery level.';
    }
  }

  // Screen brightness tool implementation (web only supports some features)
  function changeBrightness({ brightness }) {
    console.log('Brightness change requested:', brightness);
    // Note: Web doesn't have direct access to system brightness
    // We could simulate brightness with an overlay
    return brightness;
  }

  // Flash screen implementation
  function flashScreen() {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = 'white';
    overlay.style.zIndex = '9998';
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 200ms ease-in-out';
    
    document.body.appendChild(overlay);
    
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
      
      setTimeout(() => {
        overlay.style.opacity = '0';
        setTimeout(() => {
          document.body.removeChild(overlay);
        }, 200);
      }, 200);
    });
    
    return 'Successfully flashed the screen.';
  }

  // Initialize widget
  function initWidget(config = {}) {
    // Apply default config
    const widgetConfig = {
      agentId: config.agentId || 'agent_01jvg9443reddrc38gye4jhfvr',
      position: config.position || 'bottom-right',
      ...config
    };
    
    // Create widget UI
    createWidgetStyles();
    const { button, buttonInner } = createWidgetButton();
    
    // Set widget position based on config
    const container = button.parentElement;
    if (widgetConfig.position === 'bottom-left') {
      container.style.right = 'auto';
      container.style.left = '20px';
    } else if (widgetConfig.position === 'top-right') {
      container.style.bottom = 'auto';
      container.style.top = '20px';
    } else if (widgetConfig.position === 'top-left') {
      container.style.bottom = 'auto';
      container.style.top = '20px';
      container.style.right = 'auto';
      container.style.left = '20px';
    }
    
    // Load 11labs script dynamically
    const script = document.createElement('script');
    script.src = 'https://cdn.11labs.ai/sdk/voice-chat.js';
    script.async = true;
    
    script.onload = function() {
      if (typeof ElevenLabsVoiceChat !== 'undefined') {
        const voiceChat = new ElevenLabsVoiceChat({
          apiKey: widgetConfig.apiKey || '',
          voiceId: widgetConfig.voiceId || '',
          onConnect: () => {
            console.log('Connected to voice chat');
            button.classList.add('napier-call-button-active');
            buttonInner.classList.add('napier-button-inner-active');
          },
          onDisconnect: () => {
            console.log('Disconnected from voice chat');
            button.classList.remove('napier-call-button-active');
            buttonInner.classList.remove('napier-button-inner-active');
          },
          onMessage: (message) => {
            console.log('Message received:', message);
          },
          onError: (error) => {
            console.error('Voice chat error:', error);
            button.classList.remove('napier-call-button-active');
            buttonInner.classList.remove('napier-button-inner-active');
          }
        });
        
        // Handle button click
        let active = false;
        button.addEventListener('click', async () => {
          if (!active) {
            // Request microphone permission
            const hasPermission = await requestMicrophonePermission();
            if (!hasPermission) {
              alert('Microphone permission is required for voice interaction.');
              return;
            }
            
            // Start session
            try {
              await voiceChat.startSession({
                agentId: widgetConfig.agentId,
                dynamicVariables: {
                  platform: 'web'
                },
                clientTools: {
                  get_battery_level: getBatteryLevel,
                  change_brightness: changeBrightness,
                  flash_screen: flashScreen
                }
              });
              active = true;
            } catch (error) {
              console.error('Failed to start voice chat session:', error);
            }
          } else {
            // End session
            try {
              await voiceChat.endSession();
              active = false;
            } catch (error) {
              console.error('Failed to end voice chat session:', error);
            }
          }
        });
      } else {
        console.error('ElevenLabsVoiceChat SDK not loaded properly');
      }
    };
    
    script.onerror = function() {
      console.error('Failed to load ElevenLabsVoiceChat SDK');
    };
    
    document.head.appendChild(script);
  }

  // Expose widget to global scope
  window.NapierAIWidget = {
    init: initWidget
  };
})();