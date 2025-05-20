import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Copy, Key, Trash2 } from 'lucide-react-native';
import { useSupabase } from '../hooks/useSupabase';

interface ApiKey {
  id: string;
  key: string;
  created_at: string;
  last_used: string | null;
}

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const { supabase } = useSupabase();

  useEffect(() => {
    fetchApiKeys();
  }, []);

  async function fetchApiKeys() {
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching API keys:', error);
      return;
    }

    setApiKeys(data || []);
  }

  async function generateApiKey() {
    const { data, error } = await supabase
      .functions.invoke('generate-api-key');

    if (error) {
      console.error('Error generating API key:', error);
      return;
    }

    setApiKeys([data, ...apiKeys]);
  }

  async function deleteApiKey(id: string) {
    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting API key:', error);
      return;
    }

    setApiKeys(apiKeys.filter(key => key.id !== id));
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>API Keys</Text>
        <TouchableOpacity
          style={styles.generateButton}
          onPress={generateApiKey}
        >
          <Key size={20} color="#fff" />
          <Text style={styles.generateButtonText}>Generate New Key</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.keyList}>
        {apiKeys.map((apiKey) => (
          <View key={apiKey.id} style={styles.keyCard}>
            <View style={styles.keyInfo}>
              <Text style={styles.keyValue}>{apiKey.key}</Text>
              <Text style={styles.keyMeta}>
                Created: {new Date(apiKey.created_at).toLocaleDateString()}
                {apiKey.last_used && ` • Last used: ${new Date(apiKey.last_used).toLocaleDateString()}`}
              </Text>
            </View>
            <View style={styles.keyActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.copyButton]}
                onPress={() => copyToClipboard(apiKey.key)}
              >
                <Copy size={20} color="#3B82F6" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => deleteApiKey(apiKey.id)}
              >
                <Trash2 size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.embedCodeContainer}>
        <Text style={styles.embedCodeTitle}>Widget Embed Code</Text>
        <View style={styles.embedCode}>
          <Text style={styles.embedCodeText}>
            {`<script src="https://yourapp.com/widget.js" data-api-key="YOUR_API_KEY" data-agent-id="YOUR_AGENT_ID"></script>`}
          </Text>
          <TouchableOpacity
            style={styles.copyButton}
            onPress={() => copyToClipboard(`<script src="https://yourapp.com/widget.js" data-api-key="YOUR_API_KEY" data-agent-id="YOUR_AGENT_ID"></script>`)}
          >
            <Copy size={20} color="#3B82F6" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E2E8F0',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
  },
  keyList: {
    flex: 1,
  },
  keyCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  keyInfo: {
    flex: 1,
  },
  keyValue: {
    fontSize: 16,
    fontFamily: 'monospace',
    color: '#E2E8F0',
    marginBottom: 4,
  },
  keyMeta: {
    fontSize: 14,
    color: '#94A3B8',
  },
  keyActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
  },
  copyButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  embedCodeContainer: {
    marginTop: 24,
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 8,
  },
  embedCodeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E2E8F0',
    marginBottom: 12,
  },
  embedCode: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 8,
  },
  embedCodeText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#E2E8F0',
  },
});