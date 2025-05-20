// Napier AI Widget
(function() {
  // Create widget styles
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

  class NapierVoiceChat {
    constructor(config) {
      this.config = config;
      this.isActive = false;
      this.mediaRecorder = null;
      this.audioChunks = [];
      this.proxyUrl = 'https://your-netlify-app.com/voice-chat';
    }

    async startSession() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.mediaRecorder = new MediaRecorder(stream);
        
        this.mediaRecorder.ondataavailable = async (event) => {
          if (event.data.size > 0) {
            this.audioChunks.push(event.data);
            await this.sendAudioChunk();
          }
        };
        
        this.mediaRecorder.start(1000);
        this.isActive = true;
        
        if (this.config.onConnect) {
          this.config.onConnect();
        }
      } catch (error) {
        console.error('Failed to start session:', error);
        if (this.config.onError) {
          this.config.onError(error);
        }
      }
    }

    async sendAudioChunk() {
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
      const formData = new FormData();
      formData.append('audio', audioBlob);
      
      try {
        const response = await fetch(this.proxyUrl, {
          method: 'POST',
          body: formData,
          headers: {
            'X-API-Key': this.config.apiKey
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to send audio');
        }
        
        const data = await response.json();
        if (this.config.onMessage) {
          this.config.onMessage(data);
        }
      } catch (error) {
        console.error('Failed to send audio:', error);
        if (this.config.onError) {
          this.config.onError(error);
        }
      }
      
      this.audioChunks = [];
    }

    async endSession() {
      if (this.mediaRecorder) {
        this.mediaRecorder.stop();
        this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
      }
      
      this.isActive = false;
      
      if (this.config.onDisconnect) {
        this.config.onDisconnect();
      }
    }
  }

  // Initialize widget
  function initWidget() {
    const script = document.currentScript;
    const apiKey = script.getAttribute('data-api-key');
    
    if (!apiKey) {
      console.error('Napier AI Widget: Missing required attribute (data-api-key)');
      return;
    }

    createWidgetStyles();
    
    const container = document.createElement('div');
    container.className = 'napier-widget-container';
    
    const button = document.createElement('div');
    button.className = 'napier-call-button';
    
    const buttonInner = document.createElement('div');
    buttonInner.className = 'napier-button-inner';
    buttonInner.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E2E8F0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>`;
    
    button.appendChild(buttonInner);
    container.appendChild(button);
    document.body.appendChild(container);
    
    const voiceChat = new NapierVoiceChat({
      apiKey,
      onConnect: () => {
        button.classList.add('napier-call-button-active');
        buttonInner.classList.add('napier-button-inner-active');
      },
      onDisconnect: () => {
        button.classList.remove('napier-call-button-active');
        buttonInner.classList.remove('napier-button-inner-active');
      },
      onError: (error) => {
        console.error('Voice chat error:', error);
        button.classList.remove('napier-call-button-active');
        buttonInner.classList.remove('napier-button-inner-active');
      }
    });
    
    button.addEventListener('click', async () => {
      if (!voiceChat.isActive) {
        await voiceChat.startSession();
      } else {
        await voiceChat.endSession();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }
})();