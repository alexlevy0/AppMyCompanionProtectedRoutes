import { 
  View, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  Alert,
  Keyboard,
  ActivityIndicator
} from "react-native";
import { AppText } from "@/components/AppText";
import { Button } from "@/components/Button";
import { useAuthStore } from "@/utils/authStore";
import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { Ionicons } from "@expo/vector-icons";
import * as AC from "@bacons/apple-colors";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error';
}

// Composant séparé pour un message individuel
const MessageBubble = ({ message, formatTime }: { message: Message; formatTime: (date: Date) => string }) => {
  return (
    <View
      className={`mb-3 ${message.isUser ? 'items-end' : 'items-start'}`}
      accessibilityLabel={`Message ${message.isUser ? 'envoyé' : 'reçu'}: ${message.text}`}
    >
      <View
        className={`max-w-[80%] px-4 py-3 rounded-2xl ${
          message.isUser
            ? 'rounded-br-md'
            : 'rounded-bl-md'
        }`}
        style={{
          backgroundColor: message.isUser ? AC.systemBlue : AC.secondarySystemGroupedBackground,
          borderColor: message.isUser ? undefined : AC.separator,
          borderWidth: message.isUser ? 0 : 1,
          opacity: message.status === 'sending' ? 0.7 : 1,
        }}
      >
        <AppText
          className="text-sm leading-5"
          color={message.isUser ? "white" : "primary"}
          selectable
        >
          {message.text}
        </AppText>
        {message.isUser && message.status === 'sending' && (
          <ActivityIndicator size="small" color={AC.white} style={{ marginTop: 4 }} />
        )}
        {message.isUser && message.status === 'error' && (
          <View className="flex-row items-center mt-1">
            <Ionicons name="alert-circle" size={12} color={AC.systemRed} />
            <AppText className="text-xs ml-1" color="white">Échec d'envoi</AppText>
          </View>
        )}
      </View>
      <View className="flex-row items-center mt-1">
        <AppText className="text-xs" color="secondary">
          {formatTime(message.timestamp)}
        </AppText>
        {message.isUser && message.status === 'sent' && (
          <Ionicons name="checkmark" size={12} color={AC.systemGreen} style={{ marginLeft: 4 }} />
        )}
      </View>
    </View>
  );
};

export default function ChatsScreen() {
  const { logOut, resetOnboarding } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Salut ! Comment ça va ?",
      isUser: false,
      timestamp: new Date(Date.now() - 60000),
      status: 'sent',
    },
    {
      id: "2",
      text: "Très bien merci ! Et toi ?",
      isUser: true,
      timestamp: new Date(Date.now() - 45000),
      status: 'sent',
    },
    {
      id: "3",
      text: "Parfait ! Tu veux qu'on discute de quelque chose en particulier aujourd'hui ? J'ai hâte d'entendre tes idées !",
      isUser: false,
      timestamp: new Date(Date.now() - 30000),
      status: 'sent',
    },
    {
      id: "4",
      text: "Oui, j'aimerais parler de notre projet !",
      isUser: true,
      timestamp: new Date(Date.now() - 15000),
      status: 'sent',
    },
  ]);
  
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const textInputRef = useRef<TextInput>(null);

  // Scroll automatique vers le bas
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  // Effet pour scroller quand de nouveaux messages arrivent
  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  // Simulation d'indicateur de frappe
  useEffect(() => {
    if (newMessage.length > 0 && !isTyping) {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 2000);
    }
  }, [newMessage, isTyping]);

  const sendMessage = useCallback(async () => {
    if (!newMessage.trim() || isSending) return;

    const messageText = newMessage.trim();
    const tempId = Date.now().toString();
    
    // Ajouter le message avec le statut "sending"
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

    // Fermer le clavier
    Keyboard.dismiss();

    try {
      // Simuler l'envoi du message
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Marquer le message comme envoyé
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempId 
            ? { ...msg, status: 'sent' as const }
            : msg
        )
      );

      // Simuler une réponse automatique
      setTimeout(() => {
        const replies = [
          "C'est très intéressant ! Peux-tu m'en dire plus ?",
          "Je comprends. Comment puis-je t'aider ?",
          "Excellente idée ! Continuons sur ce sujet.",
          "Merci pour ce partage. Que penses-tu de la suite ?",
          "C'est passionnant ! J'ai hâte d'en savoir plus."
        ];
        
        const randomReply = replies[Math.floor(Math.random() * replies.length)];
        
        const reply: Message = {
          id: (Date.now() + 1).toString(),
          text: randomReply,
          isUser: false,
          timestamp: new Date(),
          status: 'sent',
        };
        setMessages(prev => [...prev, reply]);
      }, 1500);

    } catch (error) {
      // Marquer le message comme en erreur
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempId 
            ? { ...msg, status: 'error' as const }
            : msg
        )
      );
      
      Alert.alert(
        "Erreur d'envoi",
        "Impossible d'envoyer le message. Vérifiez votre connexion.",
        [
          { text: "Réessayer", onPress: () => retryMessage(tempId, messageText) },
          { text: "Annuler", style: "cancel" }
        ]
      );
    } finally {
      setIsSending(false);
    }
  }, [newMessage, isSending]);

  const retryMessage = useCallback(async (messageId: string, text: string) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, status: 'sending' as const }
          : msg
      )
    );
    
    // Réessayer l'envoi
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

  const formatTime = useCallback((date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);

  // Mémoriser la liste des messages pour éviter les re-renders inutiles
  const messagesList = useMemo(() => {
    return messages.map((message) => (
      <MessageBubble 
        key={message.id} 
        message={message} 
        formatTime={formatTime}
      />
    ));
  }, [messages, formatTime]);

  const handleInputChange = useCallback((text: string) => {
    setNewMessage(text);
  }, []);

  const canSend = newMessage.trim().length > 0 && !isSending;

  return (
    <KeyboardAvoidingView 
      className="flex-1"
      style={{ backgroundColor: AC.systemGroupedBackground }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      {/* Header */}
      <View 
        className="border-b border-gray-200 px-4 py-3 flex-row items-center justify-between" 
        style={{ backgroundColor: AC.systemBackground }}
      >
        <AppText className="text-lg font-semibold flex-1 text-center" color="primary">
          Chat
        </AppText>
        <TouchableOpacity 
          className="p-2"
          onPress={() => scrollToBottom()}
          accessibilityLabel="Faire défiler vers le bas"
        >
          <Ionicons name="arrow-down" size={20} color={AC.systemBlue} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView 
        ref={scrollViewRef}
        className="flex-1 px-4 py-2"
        style={{ backgroundColor: AC.systemGroupedBackground }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        keyboardShouldPersistTaps="handled"
      >
        {messagesList}
        
        {/* Indicateur de frappe */}
        {isTyping && (
          <View className="items-start mb-3">
            <View
              className="px-4 py-3 rounded-2xl rounded-bl-md"
              style={{
                backgroundColor: AC.secondarySystemGroupedBackground,
                borderColor: AC.separator,
                borderWidth: 1,
              }}
            >
              <View className="flex-row items-center">
                <View className="flex-row space-x-1">
                  <View className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" />
                  <View className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <View className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: '0.4s' }} />
                </View>
                <AppText className="text-xs ml-2" color="secondary">
                  En train d'écrire...
                </AppText>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View 
        className="border-t px-4 py-3" 
        style={{ backgroundColor: AC.systemBackground, borderColor: AC.separator }}
      >
        <View className="flex-row items-end space-x-2">
          <View className="flex-1">
            <TextInput
              ref={textInputRef}
              className="rounded-3xl px-4 py-3 max-h-24"
              style={{ 
                backgroundColor: AC.secondarySystemGroupedBackground, 
                color: AC.label,
                fontSize: 16,
                lineHeight: 20,
              }}
              placeholder="Tapez votre message..."
              placeholderTextColor={AC.tertiaryLabel}
              value={newMessage}
              onChangeText={handleInputChange}
              multiline
              maxLength={1000}
              textAlignVertical="center"
              accessibilityLabel="Champ de saisie du message"
              accessibilityHint="Tapez votre message ici"
            />
            <AppText className="text-xs mt-1 text-right" color="tertiary">
              {newMessage.length}/1000
            </AppText>
          </View>
          
          <TouchableOpacity
            onPress={sendMessage}
            disabled={!canSend}
            className="w-12 h-12 rounded-full items-center justify-center mb-6"
            style={{ 
              backgroundColor: canSend ? AC.systemBlue : AC.tertiarySystemGroupedBackground 
            }}
            accessibilityLabel="Envoyer le message"
            accessibilityState={{ disabled: !canSend }}
          >
            {isSending ? (
              <ActivityIndicator size="small" color={AC.white} />
            ) : (
              <Ionicons
                name="send"
                size={20}
                color={canSend ? AC.white : AC.tertiaryLabel}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}