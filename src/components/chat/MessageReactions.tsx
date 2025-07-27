import React, { useState } from 'react';
import { View, TouchableOpacity, Animated } from 'react-native';
import { AppText } from '@/components/AppText';
import * as AC from '@bacons/apple-colors';

interface Reaction {
  emoji: string;
  count: number;
  userReacted: boolean;
}

interface MessageReactionsProps {
  messageId: string;
  reactions?: Reaction[];
  onReactionAdd?: (messageId: string, emoji: string) => void;
  onReactionRemove?: (messageId: string, emoji: string) => void;
}

const defaultReactions = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

export const MessageReactions: React.FC<MessageReactionsProps> = ({
  messageId,
  reactions = [],
  onReactionAdd,
  onReactionRemove,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const scaleAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: showPicker ? 1 : 0,
      useNativeDriver: true,
      tension: 40,
      friction: 8,
    }).start();
  }, [showPicker]);

  const handleReactionPress = (emoji: string, userReacted: boolean) => {
    if (userReacted && onReactionRemove) {
      onReactionRemove(messageId, emoji);
    } else if (!userReacted && onReactionAdd) {
      onReactionAdd(messageId, emoji);
    }
    setShowPicker(false);
  };

  return (
    <View className="mt-1">
      {/* Existing Reactions */}
      {reactions.length > 0 && (
        <View className="flex-row flex-wrap gap-1 mb-1">
          {reactions.map((reaction, index) => (
            <TouchableOpacity
              key={`${reaction.emoji}-${index}`}
              onPress={() => handleReactionPress(reaction.emoji, reaction.userReacted)}
              className="px-2 py-1 rounded-full flex-row items-center"
              style={{
                backgroundColor: reaction.userReacted 
                  ? AC.systemBlue + '20' 
                  : AC.tertiarySystemGroupedBackground,
                borderWidth: reaction.userReacted ? 1 : 0,
                borderColor: AC.systemBlue,
              }}
              activeOpacity={0.7}
            >
              <AppText className="text-sm">{reaction.emoji}</AppText>
              {reaction.count > 1 && (
                <AppText 
                  className="text-xs ml-1" 
                  color={reaction.userReacted ? "primary" : "secondary"}
                >
                  {reaction.count}
                </AppText>
              )}
            </TouchableOpacity>
          ))}
          
          {/* Add Reaction Button */}
          <TouchableOpacity
            onPress={() => setShowPicker(!showPicker)}
            className="px-2 py-1 rounded-full"
            style={{
              backgroundColor: AC.tertiarySystemGroupedBackground,
            }}
            activeOpacity={0.7}
          >
            <AppText className="text-sm">+</AppText>
          </TouchableOpacity>
        </View>
      )}

      {/* Reaction Picker */}
      {showPicker && (
        <Animated.View
          className="absolute bottom-full left-0 mb-2 p-2 rounded-2xl flex-row gap-2"
          style={{
            backgroundColor: AC.systemBackground,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 5,
            transform: [{ scale: scaleAnim }],
            opacity: scaleAnim,
          }}
        >
          {defaultReactions.map((emoji) => (
            <TouchableOpacity
              key={emoji}
              onPress={() => {
                if (onReactionAdd) {
                  onReactionAdd(messageId, emoji);
                }
                setShowPicker(false);
              }}
              className="w-10 h-10 items-center justify-center rounded-xl"
              style={{
                backgroundColor: AC.secondarySystemGroupedBackground,
              }}
              activeOpacity={0.7}
            >
              <AppText className="text-xl">{emoji}</AppText>
            </TouchableOpacity>
          ))}
        </Animated.View>
      )}
    </View>
  );
};