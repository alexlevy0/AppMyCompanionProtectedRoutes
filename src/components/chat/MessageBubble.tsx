import React, { memo, useEffect, useRef } from 'react';
import { View, Animated, TouchableOpacity, ActivityIndicator } from 'react-native';
import { AppText } from '@/components/AppText';
import { Ionicons } from '@expo/vector-icons';
import * as AC from '@bacons/apple-colors';
import { Message } from '@/types/chat';

interface MessageBubbleProps {
  message: Message;
  formatTime: (date: Date) => string;
  onRetry?: (messageId: string, text: string) => void;
}

export const MessageBubble = memo(({ 
  message, 
  formatTime,
  onRetry 
}: MessageBubbleProps) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 40,
        friction: 8,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleRetry = () => {
    if (onRetry && message.status === 'error') {
      onRetry(message.id, message.text);
    }
  };

  const getBubbleStyle = () => {
    const baseStyle = {
      transform: [{ scale: scaleAnim }],
      opacity: opacityAnim,
    };

    if (message.isUser) {
      return {
        ...baseStyle,
        backgroundColor: message.status === 'error' 
          ? AC.systemRed 
          : AC.systemBlue,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      };
    }

    return {
      ...baseStyle,
      backgroundColor: AC.secondarySystemGroupedBackground,
      borderColor: AC.separator,
      borderWidth: 1,
    };
  };

  const content = (
    <View
      className={`mb-3 ${message.isUser ? 'items-end' : 'items-start'}`}
      accessibilityLabel={`Message ${message.isUser ? 'envoyé' : 'reçu'}: ${message.text}`}
    >
      <Animated.View
        className={`max-w-[80%] px-4 py-3 rounded-2xl ${
          message.isUser ? 'rounded-br-md' : 'rounded-bl-md'
        }`}
        style={getBubbleStyle()}
      >
        <AppText
          className="text-sm leading-5"
          color={message.isUser ? "white" : "primary"}
          style={{ fontSize: 15, lineHeight: 20 }}
        >
          {message.text}
        </AppText>
        
        {message.isUser && message.status === 'sending' && (
          <View className="mt-2">
            <ActivityIndicator size="small" color="white" />
          </View>
        )}
        
        {message.isUser && message.status === 'error' && (
          <View className="flex-row items-center mt-2">
            <Ionicons name="alert-circle" size={14} color="white" />
            <AppText className="text-xs ml-1" color="white" style={{ opacity: 0.9 }}>
              Échec d'envoi • Appuyer pour réessayer
            </AppText>
          </View>
        )}
      </Animated.View>

      <View className="flex-row items-center mt-1 px-2">
        <AppText className="text-xs" color="secondary" style={{ opacity: 0.7 }}>
          {formatTime(message.timestamp)}
        </AppText>
        {message.isUser && message.status === 'sent' && (
          <View className="ml-1">
            <Ionicons name="checkmark-done" size={14} color={AC.systemGreen} />
          </View>
        )}
      </View>
    </View>
  );

  if (message.status === 'error' && onRetry) {
    return (
      <TouchableOpacity
        onPress={handleRetry}
        activeOpacity={0.8}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
});