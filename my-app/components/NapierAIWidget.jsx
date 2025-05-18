import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * NapierAIWidget - React component for integrating the Napier AI Widget
 * 
 * @param {Object} props - Component props
 * @param {string} props.napierClientId - Your Napier Client ID for authentication
 * @param {string} props.proxyUrl - URL of your Napier proxy server
 * @param {string} props.theme - Widget theme ('dark' or 'light')
 * @param {string} props.position - Widget position ('bottom-right', 'bottom-left', 'top-right', 'top-left')
 * @param {string} props.size - Widget size ('default', 'compact', 'expanded')
 * @param {Object} props.style - Additional styles for the widget container
 * @param {Function} props.onConnect - Callback function called when the widget connects
 * @param {Function} props.onDisconnect - Callback function called when the widget disconnects
 * @param {Function} props.onToolExecute - Callback function called when a tool is executed
 */
const NapierAIWidget = ({
  napierClientId,
  proxyUrl = 'http://localhost:3000',
  theme = 'dark',
  position = 'bottom-right',
  size = 'default',
  style = {},
  onConnect,
  onDisconnect,
  onToolExecute
}) => {
  const widgetRef = useRef(null);
  const widgetInstanceRef = useRef(null);

  useEffect(() => {
    // Load the widget script
    const script = document.createElement('script');
    script.src = '/napier-widget.js'; // Update to your actual script path
    script.async = true;
    
    script.onload = () => {
      // Initialize the widget once the script is loaded
      if (typeof window.NapierWidget !== 'undefined' && widgetRef.current) {
        const config = {
          container: `#${widgetRef.current.id}`,
          napierClientId,
          proxyUrl,
          theme,
          position,
          size
        };
        
        widgetInstanceRef.current = new window.NapierWidget(config);
        
        // Set up event listeners if callbacks are provided
        if (onConnect && typeof onConnect === 'function') {
          widgetRef.current.addEventListener('napier:connect', onConnect);
        }
        
        if (onDisconnect && typeof onDisconnect === 'function') {
          widgetRef.current.addEventListener('napier:disconnect', onDisconnect);
        }
        
        if (onToolExecute && typeof onToolExecute === 'function') {
          widgetRef.current.addEventListener('napier:tool-execute', onToolExecute);
        }
      }
    };
    
    document.body.appendChild(script);
    
    // Cleanup function
    return () => {
      // Remove event listeners
      if (widgetRef.current) {
        if (onConnect) widgetRef.current.removeEventListener('napier:connect', onConnect);
        if (onDisconnect) widgetRef.current.removeEventListener('napier:disconnect', onDisconnect);
        if (onToolExecute) widgetRef.current.removeEventListener('napier:tool-execute', onToolExecute);
      }
      
      // Remove the script
      document.body.removeChild(script);
    };
  }, [napierClientId, proxyUrl, theme, position, size, onConnect, onDisconnect, onToolExecute]);

  // Update the widget configuration if props change
  useEffect(() => {
    if (widgetInstanceRef.current) {
      // In a real implementation, you'd want to provide a method to update configuration
      // This is a simplified example - you might need to destroy and recreate the widget
      // widgetInstanceRef.current.updateConfig({ theme, position, size });
    }
  }, [theme, position, size]);

  return (
    <div 
      id="napier-react-widget" 
      ref={widgetRef} 
      style={{ 
        width: '100%', 
        height: '100%',
        ...style 
      }} 
    />
  );
};

NapierAIWidget.propTypes = {
  napierClientId: PropTypes.string.isRequired,
  proxyUrl: PropTypes.string,
  theme: PropTypes.oneOf(['dark', 'light']),
  position: PropTypes.oneOf(['bottom-right', 'bottom-left', 'top-right', 'top-left']),
  size: PropTypes.oneOf(['default', 'compact', 'expanded']),
  style: PropTypes.object,
  onConnect: PropTypes.func,
  onDisconnect: PropTypes.func,
  onToolExecute: PropTypes.func
};

export default NapierAIWidget;