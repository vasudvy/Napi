'use dom';

import { useConversation } from '@11labs/react';
import { Mic } from 'lucide-react-native';
import { useCallback } from 'react';
import { View, Pressable, StyleSheet, Text } from 'react-native';
import { Platform } from 'react-native';

import tools from '../utils/tools';

async function requestMicrophonePermission() {
  try {
    await navigator.mediaDevices.getUserMedia({ audio: true });
    return true;
  } catch (error) {
    console.log(error);
    console.error('Microphone permission denied');
    return false;
  }
}

export default function ConvAiDOMComponent({
  platform,
  get_battery_level,
  change_brightness,
  flash_screen,
}: {
  dom?: import('expo/dom').DOMProps;
  platform: string;
  get_battery_level: typeof tools.get_battery_level;
  change_brightness: typeof tools.change_brightness;
  flash_screen: typeof tools.flash_screen;
}) {
  const isWeb = Platform.OS === 'web';

  const conversation = useConversation({
    onConnect: () => console.log('Connected'),
    onDisconnect: () => console.log('Disconnected'),
    onMessage: (message) => {
      console.log(message);
    },
    onError: (error) => console.error('Error:', error),
  });
  
  const startConversation = useCallback(async () => {
    try {
      // Request microphone permission
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        alert('No permission');
        return;
      }

      // Prepare client tools based on platform
      const clientTools = {
        get_battery_level,
        change_brightness,
        flash_screen,
      };

      // Add browser tools if on web platform
      if (isWeb) {
        Object.assign(clientTools, {
          open_new_tab: tools.open_new_tab,
          click_element: tools.click_element,
          type_text: tools.type_text,
          get_current_url: tools.get_current_url,
          scroll_to: tools.scroll_to,
          get_element_text: tools.get_element_text,
        });
      }

      // Start the conversation with your agent
      await conversation.startSession({
        agentId: 'agent_01jvg9443reddrc38gye4jhfvr', // Replace with your agent ID
        dynamicVariables: {
          platform,
          isWeb,
        },
        clientTools,
      });
    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  }, [conversation, isWeb]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  return (
    <View>
      <Pressable
        style={[styles.callButton, conversation.status === 'connected' && styles.callButtonActive]}
        onPress={conversation.status === 'disconnected' ? startConversation : stopConversation}
      >
        <View
          style={[
            styles.buttonInner,
            conversation.status === 'connected' && styles.buttonInnerActive,
          ]}
        >
          <Mic size={32} color="#E2E8F0" strokeWidth={1.5} style={styles.buttonIcon} />
        </View>
      </Pressable>
      {isWeb && (
        <Text style={styles.webLabel}>
          Web DOM Tools Enabled
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  callButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  callButtonActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  buttonInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 5,
  },
  buttonInnerActive: {
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
  },
  buttonIcon: {
    transform: [{ translateY: 2 }],
  },
  webLabel: {
    color: '#4ADE80',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 16,
  },
});