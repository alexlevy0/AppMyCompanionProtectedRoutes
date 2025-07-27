import { create } from 'zustand';
import { Message } from '@/types/chat';

interface ChatStore {
  // State
  messages: Message[];
  currentChatId: string | null;
  isConnected: boolean;
  
  // Actions
  addMessage: (message: Message) => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  deleteMessage: (messageId: string) => void;
  clearMessages: () => void;
  setMessages: (messages: Message[]) => void;
  setCurrentChat: (chatId: string | null) => void;
  setConnectionStatus: (isConnected: boolean) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  // Initial state
  messages: [],
  currentChatId: null,
  isConnected: true,
  
  // Actions
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
    
  updateMessage: (messageId, updates) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === messageId ? { ...msg, ...updates } : msg
      ),
    })),
    
  deleteMessage: (messageId) =>
    set((state) => ({
      messages: state.messages.filter((msg) => msg.id !== messageId),
    })),
    
  clearMessages: () =>
    set(() => ({
      messages: [],
    })),
    
  setMessages: (messages) =>
    set(() => ({
      messages,
    })),
    
  setCurrentChat: (chatId) =>
    set(() => ({
      currentChatId: chatId,
    })),
    
  setConnectionStatus: (isConnected) =>
    set(() => ({
      isConnected,
    })),
}));