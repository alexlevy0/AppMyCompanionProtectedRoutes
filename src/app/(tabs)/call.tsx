// @ts-nocheck
import { View, Alert } from "react-native";
import { AppText } from "@/components/AppText";
import { Button } from "@/components/Button";
import { useAuthStore } from "@/utils/authStore";
import * as Form from "@/components/ui/form";
import { Link } from "expo-router";
import { Text, Pressable } from "react-native";
import * as AC from "@bacons/apple-colors";
import { Rounded } from "@/components/ui/rounded";
import { Image } from "@/components/ui/img";
import { TripleItemTest } from "./index";
import React, { useEffect } from 'react'
import {
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Animated,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import useDuplexWs from '@/utils/useDuplexWs'


export default function SettingsScreen() {
  const { logOut, resetOnboarding } = useAuthStore();

  return (
    <View
      className="flex-1 p-4"
      style={{ backgroundColor: AC.systemGroupedBackground }}
    >
      <VoiceChat
        workspaceId="01K0CFGZHZRGWQRMD0FTHSB7DM"
        apiToken="4af8d7d96c1d157191f99450299fe903b7d289b83a96d3f0046bdeb6d73f9ac4"
      />
    </View>
  );
}



// Composant pour visualiser le niveau audio
function AudioLevelIndicator({ level, isActive }) {
  const animatedValue = React.useRef(new Animated.Value(0)).current

  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: level,
      duration: 100,
      useNativeDriver: false,
    }).start()
  }, [level])

  const width = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  })

  return (
    <View style={styles.audioLevelContainer}>
      <Animated.View
        style={[
          styles.audioLevelBar,
          {
            width,
            backgroundColor: isActive ? '#4CAF50' : '#ccc',
          },
        ]}
      />
    </View>
  )
}

function VoiceChat({ workspaceId, apiToken }) {
  const {
    isConnected,
    isLoading,
    isUserSpeaking,
    isModelSpeaking,
    conversation,
    sessionStats,
    validationResult,
    isMicMuted,
    audioLevel,
    startConversation,
    sendMessage,
    hangUp,
    toggleMute,
    onFunctionCalls,
  } = useDuplexWs({
    workspaceId,
    apiToken,
    onCallEnded: (totalPrice) => {
      console.log('Appel terminé, prix total:', totalPrice)
    }
  })

  // Enregistrer un handler pour les function calls
  useEffect(() => {
    onFunctionCalls((functionCalls) => {
      console.log('Function calls reçus:', functionCalls)
      // Traiter les function calls ici
    })
  }, [onFunctionCalls])

  const handleStart = async () => {
    await startConversation({
      // config: {
      //   // Votre configuration ici
      // },
      agentId: "01K0CFHFY3EBH839GW6G08NEK6",
      sessionMode: 'vocal',
      isVadActive: true,
      isSttActive: true,
      isLlmActive: true,
      isTtsActive: true,
    })
  }

  const handleSendMessage = () => {
    sendMessage('Bonjour, comment allez-vous ?')
  }

  // Couleur du bouton principal selon l'état
  const getMainButtonStyle = () => {
    if (isLoading) return styles.buttonLoading
    if (isConnected) return styles.buttonConnected
    return styles.buttonPrimary
  }

  // Icône du bouton principal selon l'état
  const getMainButtonIcon = () => {
    if (isLoading) return 'hourglass'
    if (isConnected) return 'call'
    return 'call-outline'
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="mic" size={40} color="#007AFF" />
          <Text style={styles.title}>Voice Chat</Text>
        </View>
        
        {/* États avec icônes */}
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View style={styles.statusItem}>
              <Ionicons 
                name={isConnected ? 'wifi' : 'wifi-outline'} 
                size={24} 
                color={isConnected ? '#4CAF50' : '#ccc'} 
              />
              <Text style={styles.statusLabel}>Connecté</Text>
            </View>
            
            <View style={styles.statusItem}>
              <Ionicons 
                name={isUserSpeaking ? 'mic' : 'mic-off'} 
                size={24} 
                color={isUserSpeaking ? '#4CAF50' : '#ccc'} 
              />
              <Text style={styles.statusLabel}>Vous parlez</Text>
            </View>
            
            <View style={styles.statusItem}>
              <Ionicons 
                name={isModelSpeaking ? 'volume-high' : 'volume-mute'} 
                size={24} 
                color={isModelSpeaking ? '#2196F3' : '#ccc'} 
              />
              <Text style={styles.statusLabel}>IA parle</Text>
            </View>
          </View>

          {/* Indicateur de niveau audio */}
          {isConnected && !isMicMuted && (
            <View style={styles.audioSection}>
              <Text style={styles.audioLabel}>Niveau audio :</Text>
              <AudioLevelIndicator level={audioLevel} isActive={!isMicMuted} />
            </View>
          )}
        </View>

        {/* Boutons de contrôle principaux */}
        <View style={styles.mainControls}>
          <TouchableOpacity
            style={[styles.mainButton, getMainButtonStyle()]}
            onPress={isConnected ? hangUp : handleStart}
            disabled={isLoading}
          >
            <Ionicons 
              name={getMainButtonIcon()} 
              size={32} 
              color="#fff" 
            />
            <Text style={styles.mainButtonText}>
              {isLoading ? 'Connexion...' : (isConnected ? 'Raccrocher' : 'Démarrer')}
            </Text>
          </TouchableOpacity>

          {isConnected && (
            <View style={styles.secondaryControls}>
              <TouchableOpacity
                style={[styles.circleButton, isMicMuted && styles.mutedButton]}
                onPress={toggleMute}
              >
                <Ionicons 
                  name={isMicMuted ? 'mic-off' : 'mic'} 
                  size={24} 
                  color="#fff" 
                />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.circleButton}
                onPress={handleSendMessage}
              >
                <Ionicons name="send" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Conversation */}
        <View style={styles.conversationCard}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="chatbubbles" size={20} /> Conversation
          </Text>
          <ScrollView style={styles.conversationScroll} nestedScrollEnabled>
            {conversation.map((msg, index) => (
              <View 
                key={index} 
                style={[
                  styles.messageContainer,
                  msg.role === 'user' ? styles.userMessage : styles.assistantMessage
                ]}
              >
                <View style={[
                  styles.messageBubble,
                  msg.role === 'user' ? styles.userBubble : styles.assistantBubble
                ]}>
                  <Text style={[
                    styles.messageRole,
                    msg.role === 'user' && styles.userRole
                  ]}>
                    {msg.role === 'user' ? 'Vous' : 'Assistant'}
                  </Text>
                  <Text style={[
                    styles.messageContent,
                    msg.role === 'user' && styles.userContent
                  ]}>{msg.content}</Text>
                </View>
              </View>
            ))}
            {conversation.length === 0 && (
              <View style={styles.emptyConversation}>
                <Ionicons name="chatbox-outline" size={48} color="#ddd" />
                <Text style={styles.emptyText}>
                  Appuyez sur "Démarrer" pour commencer
                </Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Statistiques */}
        {sessionStats && (
          <View style={styles.statsCard}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="stats-chart" size={20} /> Statistiques
            </Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Durée</Text>
                <Text style={styles.statValue}>
                  {Math.round(sessionStats.duration || 0)}s
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Messages</Text>
                <Text style={styles.statValue}>
                  {sessionStats.messageCount || 0}
                </Text>
              </View>
              {sessionStats.sessionTotalPrice && (
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Coût</Text>
                  <Text style={styles.statValue}>
                    ${sessionStats.sessionTotalPrice.toFixed(4)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Indicateur de chargement overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Connexion en cours...</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#333',
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statusItem: {
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  audioSection: {
    marginTop: 20,
  },
  audioLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  audioLevelContainer: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  audioLevelBar: {
    height: '100%',
    borderRadius: 4,
  },
  mainControls: {
    marginBottom: 20,
  },
  mainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 30,
    marginBottom: 16,
  },
  buttonPrimary: {
    backgroundColor: '#007AFF',
  },
  buttonConnected: {
    backgroundColor: '#FF3B30',
  },
  buttonLoading: {
    backgroundColor: '#ccc',
  },
  mainButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  circleButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  mutedButton: {
    backgroundColor: '#FF9500',
  },
  conversationCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  conversationScroll: {
    maxHeight: 300,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  messageContainer: {
    marginVertical: 4,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  assistantMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    padding: 12,
    maxWidth: '80%',
  },
  userBubble: {
    backgroundColor: '#007AFF',
  },
  assistantBubble: {
    backgroundColor: '#f0f0f0',
  },
  messageRole: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  userRole: {
    color: '#fff',
  },
  messageContent: {
    fontSize: 14,
    color: '#333',
  },
  userContent: {
    color: '#fff',
  },
  emptyConversation: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#999',
    marginTop: 12,
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#333',
  },
})

