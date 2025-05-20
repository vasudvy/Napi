import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Menu, Settings, Users, Key, Bot, LogOut } from 'lucide-react-native';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const menuItems = [
  { icon: Users, label: 'Agents', path: '/dashboard/agents' },
  { icon: Key, label: 'API Keys', path: '/dashboard/api-keys' },
  { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.sidebar}>
        <View style={styles.sidebarHeader}>
          <Bot size={32} color="#E2E8F0" />
          <Text style={styles.logoText}>Napier AI</Text>
        </View>

        <ScrollView style={styles.menuItems}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <TouchableOpacity
                key={item.path}
                style={[styles.menuItem, isActive && styles.menuItemActive]}
                onPress={() => navigate(item.path)}
              >
                <Icon size={24} color={isActive ? '#3B82F6' : '#94A3B8'} />
                <Text style={[styles.menuItemText, isActive && styles.menuItemTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
          <LogOut size={24} color="#EF4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#0F172A',
  },
  sidebar: {
    width: 250,
    backgroundColor: '#1E293B',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 24,
  },
  logoText: {
    color: '#E2E8F0',
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  menuItems: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  menuItemActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  menuItemText: {
    color: '#94A3B8',
    fontSize: 16,
    marginLeft: 12,
  },
  menuItemTextActive: {
    color: '#3B82F6',
    fontWeight: 'bold',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    marginTop: 16,
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 16,
    marginLeft: 12,
  },
  content: {
    flex: 1,
    padding: 24,
  },
});