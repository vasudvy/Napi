import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Plus, Trash2, Edit2 } from 'lucide-react-native';
import { useSupabase } from '../hooks/useSupabase';
import { Agent } from '../types';

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newAgent, setNewAgent] = useState({
    name: '',
    description: '',
    systemPrompt: '',
  });
  
  const { supabase } = useSupabase();

  useEffect(() => {
    fetchAgents();
  }, []);

  async function fetchAgents() {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching agents:', error);
      return;
    }

    setAgents(data || []);
  }

  async function createAgent() {
    const { data, error } = await supabase
      .from('agents')
      .insert([{
        name: newAgent.name,
        description: newAgent.description,
        system_prompt: newAgent.systemPrompt,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating agent:', error);
      return;
    }

    setAgents([data, ...agents]);
    setIsCreating(false);
    setNewAgent({ name: '', description: '', systemPrompt: '' });
  }

  async function deleteAgent(id: string) {
    const { error } = await supabase
      .from('agents')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting agent:', error);
      return;
    }

    setAgents(agents.filter(agent => agent.id !== id));
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Agents</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setIsCreating(true)}
        >
          <Plus size={20} color="#fff" />
          <Text style={styles.createButtonText}>Create Agent</Text>
        </TouchableOpacity>
      </View>

      {isCreating && (
        <View style={styles.createForm}>
          <TextInput
            style={styles.input}
            placeholder="Agent Name"
            placeholderTextColor="#94A3B8"
            value={newAgent.name}
            onChangeText={(text) => setNewAgent({ ...newAgent, name: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Description"
            placeholderTextColor="#94A3B8"
            value={newAgent.description}
            onChangeText={(text) => setNewAgent({ ...newAgent, description: text })}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="System Prompt"
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={4}
            value={newAgent.systemPrompt}
            onChangeText={(text) => setNewAgent({ ...newAgent, systemPrompt: text })}
          />
          <View style={styles.formButtons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => setIsCreating(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={createAgent}
            >
              <Text style={styles.buttonText}>Create Agent</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView style={styles.agentList}>
        {agents.map((agent) => (
          <View key={agent.id} style={styles.agentCard}>
            <View style={styles.agentInfo}>
              <Text style={styles.agentName}>{agent.name}</Text>
              <Text style={styles.agentDescription}>{agent.description}</Text>
            </View>
            <View style={styles.agentActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={() => {/* Implement edit */}}
              >
                <Edit2 size={20} color="#3B82F6" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => deleteAgent(agent.id)}
              >
                <Trash2 size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
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
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
  },
  createForm: {
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#0F172A',
    color: '#E2E8F0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: '#334155',
  },
  saveButton: {
    backgroundColor: '#3B82F6',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  agentList: {
    flex: 1,
  },
  agentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  agentInfo: {
    flex: 1,
  },
  agentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E2E8F0',
    marginBottom: 4,
  },
  agentDescription: {
    fontSize: 14,
    color: '#94A3B8',
  },
  agentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
  },
  editButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
});