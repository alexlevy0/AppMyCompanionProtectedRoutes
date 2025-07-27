import React, { useRef, useEffect } from 'react';
import { View, TouchableOpacity, Animated } from 'react-native';
import { AppText } from '@/components/AppText';
import { Ionicons } from '@expo/vector-icons';
import * as AC from '@bacons/apple-colors';
import { BlurView } from 'expo-blur';

interface ChatHeaderProps {
  title: string;
  subtitle?: string;
  onScrollToBottom?: () => void;
  onMoreOptions?: () => void;
  showScrollButton?: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  title,
  subtitle = "En ligne",
  onScrollToBottom,
  onMoreOptions,
  showScrollButton = false,
}) => {
  const scrollButtonAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(scrollButtonAnim, {
      toValue: showScrollButton ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [showScrollButton]);

  return (
    <BlurView
      intensity={100}
      tint="light"
      className="absolute top-0 left-0 right-0 z-10"
      style={{
        paddingTop: 44, // Safe area top
      }}
    >
      <View 
        className="flex-row items-center justify-between px-4 py-3"
        style={{
          borderBottomWidth: 0.5,
          borderBottomColor: AC.separator,
        }}
      >
        {/* Left Section - Profile Info */}
        <View className="flex-row items-center flex-1">
          <View className="w-10 h-10 rounded-full mr-3 items-center justify-center"
            style={{ backgroundColor: AC.systemBlue }}
          >
            <AppText className="text-white font-semibold text-lg">
              {title.charAt(0).toUpperCase()}
            </AppText>
          </View>
          
          <View className="flex-1">
            <AppText className="text-lg font-semibold" color="primary">
              {title}
            </AppText>
            <View className="flex-row items-center">
              <View className="w-2 h-2 rounded-full mr-1"
                style={{ backgroundColor: AC.systemGreen }}
              />
              <AppText className="text-xs" color="secondary">
                {subtitle}
              </AppText>
            </View>
          </View>
        </View>

        {/* Right Section - Actions */}
        <View className="flex-row items-center space-x-2">
          {/* Scroll to Bottom Button */}
          <Animated.View
            style={{
              opacity: scrollButtonAnim,
              transform: [{
                scale: scrollButtonAnim,
              }],
            }}
          >
            {onScrollToBottom && (
              <TouchableOpacity
                className="p-2 rounded-full"
                onPress={onScrollToBottom}
                accessibilityLabel="Faire défiler vers le bas"
                style={{
                  backgroundColor: AC.systemBackground,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 3,
                  elevation: 2,
                }}
              >
                <View className="relative">
                  <Ionicons name="arrow-down" size={20} color={AC.systemBlue} />
                  <View className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
                    style={{ backgroundColor: AC.systemRed }}
                  />
                </View>
              </TouchableOpacity>
            )}
          </Animated.View>

          {/* Call Button */}
          <TouchableOpacity
            className="p-2"
            onPress={() => {
              // TODO: Implement call functionality
            }}
            accessibilityLabel="Appel vocal"
          >
            <Ionicons name="call" size={24} color={AC.systemBlue} />
          </TouchableOpacity>

          {/* Video Call Button */}
          <TouchableOpacity
            className="p-2"
            onPress={() => {
              // TODO: Implement video call functionality
            }}
            accessibilityLabel="Appel vidéo"
          >
            <Ionicons name="videocam" size={24} color={AC.systemBlue} />
          </TouchableOpacity>

          {/* More Options */}
          {onMoreOptions && (
            <TouchableOpacity
              className="p-2"
              onPress={onMoreOptions}
              accessibilityLabel="Plus d'options"
            >
              <Ionicons name="ellipsis-vertical" size={20} color={AC.systemBlue} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </BlurView>
  );
};