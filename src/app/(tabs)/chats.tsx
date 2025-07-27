import React, { useMemo } from 'react';
import { 
  View, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  SafeAreaView,
} from "react-native";
import * as AC from "@bacons/apple-colors";

// Custom components
import { MessageBubble } from '@/components/chat/MessageBubble';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { ChatInput } from '@/components/chat/ChatInput';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { EmptyState } from '@/components/chat/EmptyState';
import { AppText } from '@/components/AppText';

// Custom hook
import { useChat } from '@/hooks/useChat';

export default function ChatsScreen() {
  const {
    messages,
    newMessage,
    isTyping,
    isSending,
    showScrollButton,
    scrollViewRef,
    setNewMessage,
    sendMessage,
    retryMessage,
    formatTime,
    scrollToBottom,
    handleScroll,
  } = useChat();

  // Memoize message list for performance
  const messagesList = useMemo(() => {
    return messages.map((message) => (
      <MessageBubble 
        key={message.id} 
        message={message} 
        formatTime={formatTime}
        onRetry={retryMessage}
      />
    ));
  }, [messages, formatTime, retryMessage]);

  return (
    <SafeAreaView 
      className="flex-1"
      style={{ backgroundColor: AC.systemGroupedBackground }}
    >
      <KeyboardAvoidingView 
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {/* Modern Chat Header */}
        <ChatHeader
          title="Assistant"
          subtitle="Toujours disponible"
          onScrollToBottom={scrollToBottom}
          showScrollButton={showScrollButton}
          onMoreOptions={() => {
            // TODO: Implement more options menu
          }}
        />

        {/* Messages Container */}
        <ScrollView 
          ref={scrollViewRef}
          className="flex-1"
          style={{ 
            backgroundColor: AC.systemGroupedBackground,
            paddingTop: 120, // Account for header height
          }}
          contentContainerStyle={{ 
            paddingHorizontal: 16,
            paddingBottom: 20 
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {messages.length === 0 ? (
            <EmptyState 
              onStartConversation={() => {
                // Focus on input when starting conversation
                // This can be implemented with a ref to ChatInput
              }}
            />
          ) : (
            <>
              {/* Date Separator */}
              <View className="items-center my-4">
                <View 
                  className="px-3 py-1 rounded-full"
                  style={{ 
                    backgroundColor: AC.tertiarySystemGroupedBackground 
                  }}
                >
                  <AppText className="text-xs" color="secondary">
                    Aujourd'hui
                  </AppText>
                </View>
              </View>

              {/* Messages */}
              {messagesList}
              
              {/* Typing Indicator */}
              {isTyping && <TypingIndicator />}
            </>
          )}
        </ScrollView>

        {/* Modern Chat Input */}
        <ChatInput
          value={newMessage}
          onChangeText={setNewMessage}
          onSend={sendMessage}
          isSending={isSending}
          placeholder="Tapez votre message..."
          maxLength={1000}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}