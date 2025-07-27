import React, { useRef, useState, useCallback, useEffect } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  Animated,
  Keyboard,
  Platform,
  LayoutAnimation
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as AC from '@bacons/apple-colors';
import { AppText } from '@/components/AppText';

interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  isSending: boolean;
  placeholder?: string;
  maxLength?: number;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChangeText,
  onSend,
  isSending,
  placeholder = "Tapez votre message...",
  maxLength = 1000,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const buttonRotation = useRef(new Animated.Value(0)).current;

  const canSend = value.trim().length > 0 && !isSending;

  useEffect(() => {
    // Animate button when sending state changes
    Animated.timing(buttonRotation, {
      toValue: isSending ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isSending]);

  const handleSend = useCallback(() => {
    if (canSend) {
      // Animate button press
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      onSend();
    }
  }, [canSend, onSend]);

  const handleFocus = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsFocused(true);
  };

  const handleBlur = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsFocused(false);
  };

  const rotateInterpolation = buttonRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View 
      className="px-4 py-3" 
      style={{ 
        backgroundColor: AC.systemBackground,
        borderTopWidth: 1,
        borderTopColor: AC.separator,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 5,
      }}
    >
      <View className="flex-row items-end space-x-3">
        {/* Additional Actions */}
        <TouchableOpacity
          className="pb-2"
          onPress={() => {
            // TODO: Implement attachment functionality
          }}
          accessibilityLabel="Ajouter une pièce jointe"
        >
          <Ionicons 
            name="add-circle-outline" 
            size={28} 
            color={AC.systemBlue} 
          />
        </TouchableOpacity>

        {/* Input Field */}
        <View className="flex-1">
          <View
            style={{
              backgroundColor: isFocused 
                ? AC.tertiarySystemGroupedBackground 
                : AC.secondarySystemGroupedBackground,
              borderRadius: 20,
              borderWidth: isFocused ? 2 : 0,
              borderColor: isFocused ? AC.systemBlue : 'transparent',
              paddingHorizontal: 16,
              paddingVertical: Platform.OS === 'ios' ? 10 : 8,
              minHeight: 40,
              maxHeight: 120,
            }}
          >
            <TextInput
              ref={inputRef}
              value={value}
              onChangeText={onChangeText}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder={placeholder}
              placeholderTextColor={AC.tertiaryLabel}
              multiline
              maxLength={maxLength}
              textAlignVertical="center"
              style={{
                color: AC.label,
                fontSize: 16,
                lineHeight: 20,
                paddingTop: 0,
                paddingBottom: 0,
              }}
              accessibilityLabel="Champ de saisie du message"
              accessibilityHint="Tapez votre message ici"
            />
          </View>
          
          {/* Character Counter */}
          {value.length > maxLength * 0.8 && (
            <Animated.View
              entering={{ opacity: 0 }}
              className="absolute right-2 -top-6"
            >
              <AppText 
                className="text-xs" 
                color={value.length >= maxLength ? "destructive" : "tertiary"}
              >
                {value.length}/{maxLength}
              </AppText>
            </Animated.View>
          )}
        </View>

        {/* Send Button */}
        <Animated.View
          style={{
            transform: [
              { scale: scaleAnim },
              { rotate: rotateInterpolation }
            ],
          }}
        >
          <TouchableOpacity
            onPress={handleSend}
            disabled={!canSend}
            className="rounded-full items-center justify-center"
            style={{
              width: 40,
              height: 40,
              backgroundColor: canSend 
                ? AC.systemBlue 
                : AC.tertiarySystemGroupedBackground,
              marginBottom: 4,
              shadowColor: canSend ? AC.systemBlue : '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: canSend ? 0.3 : 0.1,
              shadowRadius: 4,
              elevation: canSend ? 3 : 1,
            }}
            accessibilityLabel="Envoyer le message"
            accessibilityState={{ disabled: !canSend }}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons
                name="send"
                size={20}
                color={canSend ? "white" : AC.tertiaryLabel}
                style={{
                  marginLeft: 2,
                  marginBottom: 2,
                }}
              />
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};