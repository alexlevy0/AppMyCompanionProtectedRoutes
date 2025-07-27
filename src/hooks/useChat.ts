import { useState, useCallback, useRef, useEffect } from 'react';
import { ScrollView, Keyboard, Alert } from 'react-native';
import { Message } from '@/types/chat';
import { useI18n } from '@/utils/I18nContext';

export const useChat = () => {
  const { t } = useI18n();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Initialize default messages
  useEffect(() => {
    if (messages.length === 0) {
      const initialMessages: Message[] = [
        {
          id: "1",
          text: t('defaultMessages.greeting'),
          isUser: false,
          timestamp: new Date(Date.now() - 60000),
          status: 'sent',
        },
        {
          id: "2",
          text: t('defaultMessages.response'),
          isUser: true,
          timestamp: new Date(Date.now() - 45000),
          status: 'sent',
        },
        {
          id: "3",
          text: t('defaultMessages.followUp'),
          isUser: false,
          timestamp: new Date(Date.now() - 30000),
          status: 'sent',
        },
        {
          id: "4",
          text: t('defaultMessages.project'),
          isUser: true,
          timestamp: new Date(Date.now() - 15000),
          status: 'sent',
        },
      ];
      setMessages(initialMessages);
    }
  }, [t, messages.length]);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback((animated = true) => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated });
    }, 100);
  }, []);

  // Handle scroll events
  const handleScroll = useCallback((event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const isNearBottom = contentOffset.y + layoutMeasurement.height >= contentSize.height - 100;
    setShowScrollButton(!isNearBottom);
  }, []);

  // Scroll when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  // Simulate typing indicator
  const simulateTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    setIsTyping(true);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  }, []);

  // Send message
  const sendMessage = useCallback(async () => {
    if (!newMessage.trim() || isSending) return;

    const messageText = newMessage.trim();
    const tempId = Date.now().toString();
    
    // Add message with "sending" status
    const userMessage: Message = {
      id: tempId,
      text: messageText,
      isUser: true,
      timestamp: new Date(),
      status: 'sending',
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage("");
    setIsSending(true);
    Keyboard.dismiss();

    try {
      // Simulate sending
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mark as sent
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempId 
            ? { ...msg, status: 'sent' as const }
            : msg
        )
      );

      // Simulate auto-reply
      simulateTyping();
      setTimeout(() => {
        const replies = t('defaultMessages.autoReplies') as string[];
        const randomReply = replies[Math.floor(Math.random() * replies.length)];
        
        const reply: Message = {
          id: (Date.now() + 1).toString(),
          text: randomReply,
          isUser: false,
          timestamp: new Date(),
          status: 'sent',
        };
        setMessages(prev => [...prev, reply]);
        setIsTyping(false);
      }, 2500);

    } catch (error) {
      // Mark as error
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempId 
            ? { ...msg, status: 'error' as const }
            : msg
        )
      );
      
      Alert.alert(
        t('error'),
        t('sendingError'),
        [
          { text: t('retry'), onPress: () => retryMessage(tempId, messageText) },
          { text: t('cancel'), style: "cancel" }
        ]
      );
    } finally {
      setIsSending(false);
    }
  }, [newMessage, isSending, t, simulateTyping]);

  // Retry failed message
  const retryMessage = useCallback(async (messageId: string, text: string) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, status: 'sending' as const }
          : msg
      )
    );
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, status: 'sent' as const }
            : msg
        )
      );
    } catch (error) {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, status: 'error' as const }
            : msg
        )
      );
    }
  }, []);

  // Format timestamp
  const formatTime = useCallback((date: Date) => {
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    return date.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
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
  };
};