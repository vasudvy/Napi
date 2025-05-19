import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Platform } from 'react-native';

import ConvAiDOMComponent from './components/ConvAI';
import tools from './utils/tools';

export default function App() {
  const isWeb = Platform.OS === 'web';
  
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#0F172A', '#1E293B']} style={StyleSheet.absoluteFill} />

      <View style={styles.topContent}>
        <Text style={styles.description}>
          Cross-platform Napier AI Application
        </Text>

        <View style={styles.toolsList}>
          <Text style={styles.toolsTitle}>Available Client Tools:</Text>
          
          {/* Device tools */}
          <Text style={styles.toolsSubtitle}>Device Tools:</Text>
          <View style={styles.toolItem}>
            <Text style={styles.toolText}>Get battery level</Text>
            <View style={styles.platformTags}>
              <Text style={styles.platformTag}>web</Text>
              <Text style={styles.platformTag}>ios</Text>
              <Text style={styles.platformTag}>android</Text>
            </View>
          </View>
          <View style={styles.toolItem}>
            <Text style={styles.toolText}>Change screen brightness</Text>
            <View style={styles.platformTags}>
              <Text style={styles.platformTag}>ios</Text>
              <Text style={styles.platformTag}>android</Text>
            </View>
          </View>
          <View style={styles.toolItem}>
            <Text style={styles.toolText}>Flash screen</Text>
            <View style={styles.platformTags}>
              <Text style={styles.platformTag}>ios</Text>
              <Text style={styles.platformTag}>android</Text>
            </View>
          </View>
          
          {/* Web browser tools */}
          {isWeb && (
            <>
              <Text style={[styles.toolsSubtitle, styles.webToolsHeader]}>Browser Tools:</Text>
              <View style={styles.toolItem}>
                <Text style={styles.toolText}>Open new tab</Text>
                <View style={styles.platformTags}>
                  <Text style={styles.webPlatformTag}>web</Text>
                </View>
              </View>
              <View style={styles.toolItem}>
                <Text style={styles.toolText}>Click element</Text>
                <View style={styles.platformTags}>
                  <Text style={styles.webPlatformTag}>web</Text>
                </View>
              </View>
              <View style={styles.toolItem}>
                <Text style={styles.toolText}>Type text</Text>
                <View style={styles.platformTags}>
                  <Text style={styles.webPlatformTag}>web</Text>
                </View>
              </View>
              <View style={styles.toolItem}>
                <Text style={styles.toolText}>Get current URL</Text>
                <View style={styles.platformTags}>
                  <Text style={styles.webPlatformTag}>web</Text>
                </View>
              </View>
              <View style={styles.toolItem}>
                <Text style={styles.toolText}>Scroll to position</Text>
                <View style={styles.platformTags}>
                  <Text style={styles.webPlatformTag}>web</Text>
                </View>
              </View>
              <View style={styles.toolItem}>
                <Text style={styles.toolText}>Get element text</Text>
                <View style={styles.platformTags}>
                  <Text style={styles.webPlatformTag}>web</Text>
                </View>
              </View>
            </>
          )}
        </View>
        
        <View style={styles.domComponentContainer}>
          <ConvAiDOMComponent
            dom={{ style: styles.domComponent }}
            platform={Platform.OS}
            get_battery_level={tools.get_battery_level}
            change_brightness={tools.change_brightness}
            flash_screen={tools.flash_screen}
          />
        </View>
      </View>
      <StatusBar style="light" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topContent: {
    paddingTop: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  description: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#E2E8F0',
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 24,
    marginBottom: 24,
  },
  toolsList: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    marginBottom: 24,
  },
  toolsTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#E2E8F0',
    marginBottom: 16,
  },
  toolsSubtitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#94A3B8',
    marginBottom: 12,
    marginTop: 4,
  },
  webToolsHeader: {
    marginTop: 16,
    color: '#4ADE80',
  },
  toolItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  toolText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#E2E8F0',
  },
  platformTags: {
    flexDirection: 'row',
    gap: 8,
  },
  platformTag: {
    fontSize: 12,
    color: '#94A3B8',
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
    fontFamily: 'Inter-Regular',
  },
  webPlatformTag: {
    fontSize: 12,
    color: '#4ADE80',
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
    fontFamily: 'Inter-Regular',
  },
  domComponentContainer: {
    width: 120,
    height: 150, // Increased to accommodate the label
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  domComponent: {
    width: 120,
    height: 150,
  },
});