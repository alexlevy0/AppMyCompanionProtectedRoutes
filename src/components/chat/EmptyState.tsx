import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { AppText } from '@/components/AppText';
import { Ionicons } from '@expo/vector-icons';
import * as AC from '@bacons/apple-colors';

interface EmptyStateProps {
  onStartConversation?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onStartConversation }) => {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <View 
        className="w-24 h-24 rounded-full items-center justify-center mb-6"
        style={{ 
          backgroundColor: AC.systemBlue + '20',
        }}
      >
        <Ionicons name="chatbubbles" size={48} color={AC.systemBlue} />
      </View>
      
      <AppText className="text-2xl font-semibold text-center mb-2" color="primary">
        Commencez une conversation
      </AppText>
      
      <AppText className="text-center mb-8" color="secondary">
        Envoyez votre premier message pour démarrer la discussion avec votre assistant
      </AppText>
      
      <View className="space-y-3 w-full">
        <SuggestionChip 
          icon="bulb" 
          text="Demandez-moi de l'aide pour votre projet"
          onPress={onStartConversation}
        />
        <SuggestionChip 
          icon="calendar" 
          text="Planifiez votre journée ensemble"
          onPress={onStartConversation}
        />
        <SuggestionChip 
          icon="rocket" 
          text="Explorez de nouvelles idées"
          onPress={onStartConversation}
        />
      </View>
    </View>
  );
};

interface SuggestionChipProps {
  icon: string;
  text: string;
  onPress?: () => void;
}

const SuggestionChip: React.FC<SuggestionChipProps> = ({ icon, text, onPress }) => {
  return (
    <TouchableOpacity
      className="flex-row items-center p-4 rounded-2xl"
      style={{ 
        backgroundColor: AC.secondarySystemGroupedBackground,
        borderWidth: 1,
        borderColor: AC.separator,
      }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View 
        className="w-10 h-10 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: AC.systemBlue + '15' }}
      >
        <Ionicons name={icon as any} size={20} color={AC.systemBlue} />
      </View>
      <AppText className="flex-1 text-sm" color="primary">
        {text}
      </AppText>
      <Ionicons name="chevron-forward" size={20} color={AC.tertiaryLabel} />
    </TouchableOpacity>
  );
};