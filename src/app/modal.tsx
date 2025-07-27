import React, { useEffect, useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { AppText } from "@/components/AppText";
import * as Contacts from 'expo-contacts';
import * as AC from '@bacons/apple-colors';
import { useAuthStoreObserver } from '@/utils/authStoreLegend';
import { useI18n } from '@/utils/I18nContext';
import { SelectedContact } from '@/types';
import Animated, { 
  FadeIn, 
  FadeOut,
  SlideInDown,
  SlideOutDown,
  withSpring,
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Helper functions
const getInitials = (name: string) => {
  const words = name.split(' ');
  if (words.length >= 2) {
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const getColorForInitial = (initial: string) => {
  const colors = [
    AC.systemRed,
    AC.systemBlue,
    AC.systemGreen,
    AC.systemOrange,
    AC.systemPurple,
    AC.systemPink,
    AC.systemYellow,
    AC.systemIndigo,
    AC.systemTeal
  ];
  const index = initial.charCodeAt(0) % colors.length;
  return colors[index];
};

// ContactItem component moved outside
const ContactItem = ({ 
  item, 
  index, 
  isSelected, 
  onSelectContact 
}: { 
  item: SelectedContact; 
  index: number;
  isSelected: boolean;
  onSelectContact: (contact: SelectedContact) => void;
}) => {
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const initials = getInitials(item.name);
  const avatarColor = getColorForInitial(initials[0]);

  return (
    <Animated.View
      entering={FadeIn.delay(index * 50).springify()}
      style={animatedStyle}
    >
      <Pressable
        onPressIn={() => {
          scale.value = withSpring(0.98);
        }}
        onPressOut={() => {
          scale.value = withSpring(1);
        }}
        onPress={() => onSelectContact(item)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 16,
          marginHorizontal: 16,
          marginVertical: 4,
          backgroundColor: isSelected ? String(AC.systemBlue) + '15' : AC.systemBackground,
          borderRadius: 12,
          borderWidth: isSelected ? 2 : 1,
          borderColor: isSelected ? AC.systemBlue : String(AC.separator) + '30',
        }}
      >
        {/* Avatar */}
        <View
          style={{
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: avatarColor,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 16,
          }}
        >
          <Text style={{ 
            color: 'white', 
            fontSize: 18, 
            fontWeight: '600' 
          }}>
            {initials}
          </Text>
        </View>

        {/* Contact Info */}
        <View style={{ flex: 1 }}>
          <Text style={{ 
            fontSize: 16, 
            fontWeight: '600',
            color: AC.label,
            marginBottom: 4
          }}>
            {item.name}
          </Text>
          {item.phoneNumbers && item.phoneNumbers.length > 0 && (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons 
                name="call-outline" 
                size={14} 
                color={AC.secondaryLabel} 
                style={{ marginRight: 4 }}
              />
              <Text style={{ 
                fontSize: 14,
                color: AC.secondaryLabel
              }}>
                {item.phoneNumbers.length} {item.phoneNumbers.length > 1 ? 'numéros' : 'numéro'}
              </Text>
            </View>
          )}
        </View>

        {/* Selected Indicator */}
        {isSelected && (
          <Animated.View
            entering={FadeIn.springify()}
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: AC.systemBlue,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Ionicons name="checkmark" size={16} color="white" />
          </Animated.View>
        )}
      </Pressable>
    </Animated.View>
  );
};

export default function ModalScreenScreen() {
  const { t } = useI18n();
  const { user, updateSelectedContact } = useAuthStoreObserver();
  const [contacts, setContacts] = useState<SelectedContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<SelectedContact | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPhoneSelector, setShowPhoneSelector] = useState(false);
  const [pendingContact, setPendingContact] = useState<SelectedContact | null>(null);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({
          fields: [
            Contacts.Fields.Name,
            Contacts.Fields.PhoneNumbers,
          ],
        });

        if (data.length > 0) {
          // Filtrer les contacts qui ont des numéros de téléphone et convertir en SelectedContact
          const contactsWithPhone = data
            .filter(contact => 
              contact.phoneNumbers && contact.phoneNumbers.length > 0 && contact.id
            )
            .map(contact => ({
              id: contact.id!,
              name: contact.name || 'Sans nom',
              phoneNumbers: contact.phoneNumbers?.map(phone => ({
                id: phone.id || '',
                number: phone.number || '',
                label: phone.label || 'mobile'
              }))
            }))
            .sort((a, b) => a.name.localeCompare(b.name));
          setContacts(contactsWithPhone);
        }
      } else {
        Alert.alert(
          t('permissionDenied'),
          t('contactsPermissionRequired')
        );
      }
    } catch (error) {
      console.error('Erreur lors du chargement des contacts:', error);
      Alert.alert(t('error'), t('cannotLoadContacts'));
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return contacts;
    
    const query = searchQuery.toLowerCase();
    return contacts.filter(contact => 
      contact.name.toLowerCase().includes(query) ||
      contact.phoneNumbers?.some(phone => 
        phone.number.includes(query)
      )
    );
  }, [contacts, searchQuery]);

  const handleSelectContact = (contact: SelectedContact) => {
    if (contact.phoneNumbers && contact.phoneNumbers.length > 0) {
      if (contact.phoneNumbers.length === 1) {
        selectContactWithPhone(contact, contact.phoneNumbers[0]);
      } else {
        setPendingContact(contact);
        setShowPhoneSelector(true);
      }
    }
  };

  const selectContactWithPhone = (contact: SelectedContact, phoneNumber: { id: string; number: string; label: string }) => {
    const contactWithSelectedPhone = {
      ...contact,
      selectedPhoneNumber: phoneNumber
    };
    
    setSelectedContact(contactWithSelectedPhone);
    updateSelectedContact(contactWithSelectedPhone);
    setShowPhoneSelector(false);
    setPendingContact(null);
    
    // Afficher une confirmation stylée
    setTimeout(() => {
      Alert.alert(
        t('contactSelected'),
        `${contact.name} (${phoneNumber.number}) a été sélectionné.`,
        [{ text: 'OK' }]
      );
    }, 300);
  };

  if (loading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: AC.systemGroupedBackground
      }}>
        <Animated.View
          entering={FadeIn}
          style={{
            backgroundColor: AC.systemBackground,
            padding: 32,
            borderRadius: 20,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.1,
            shadowRadius: 20,
            elevation: 10,
          }}
        >
          <ActivityIndicator size="large" color={AC.systemBlue} />
          <Text style={{ 
            marginTop: 16,
            color: AC.label,
            fontSize: 16,
            fontWeight: '500'
          }}>
            {t('loadingContacts')}
          </Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={{ 
        flex: 1, 
        backgroundColor: AC.systemGroupedBackground
      }}>
        {/* Header */}
        <Animated.View
          entering={SlideInDown.springify()}
          style={{
            paddingTop: 16,
            paddingHorizontal: 16,
            paddingBottom: 8,
            backgroundColor: AC.systemBackground,
            borderBottomWidth: 1,
            borderBottomColor: String(AC.separator) + '30',
          }}
        >
          <View style={{ marginBottom: 8 }}>
            <AppText center size="heading">
              {t('selectContact')}
            </AppText>
          </View>
          <Text style={{ 
            textAlign: 'center',
            color: AC.secondaryLabel,
            fontSize: 14,
            marginBottom: 16
          }}>
            {t('selectContactDescription')}
          </Text>

          {/* Search Bar */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: AC.systemGray6,
            borderRadius: 10,
            paddingHorizontal: 12,
            marginBottom: 8,
          }}>
            <Ionicons name="search" size={20} color={AC.secondaryLabel} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Rechercher un contact..."
              placeholderTextColor={AC.tertiaryLabel}
              style={{
                flex: 1,
                paddingVertical: 12,
                paddingHorizontal: 8,
                fontSize: 16,
                color: AC.label,
              }}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={AC.secondaryLabel} />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        {/* Contacts List */}
        {filteredContacts.length === 0 ? (
          <Animated.View
            entering={FadeIn}
            style={{ 
              flex: 1, 
              justifyContent: 'center', 
              alignItems: 'center',
              padding: 20
            }}
          >
            <View style={{
              backgroundColor: AC.systemBackground,
              padding: 32,
              borderRadius: 20,
              alignItems: 'center',
            }}>
              <Ionicons 
                name={searchQuery ? "search" : "people-outline"} 
                size={64} 
                color={AC.tertiaryLabel} 
              />
              <Text style={{ 
                fontSize: 16,
                color: AC.secondaryLabel,
                textAlign: 'center',
                marginTop: 16
              }}>
                {searchQuery ? 'Aucun contact trouvé' : t('noContactsFound')}
              </Text>
            </View>
          </Animated.View>
        ) : (
          <FlatList
            data={filteredContacts}
            renderItem={({ item, index }) => (
              <ContactItem
                item={item}
                index={index}
                isSelected={selectedContact?.id === item.id}
                onSelectContact={handleSelectContact}
              />
            )}
            keyExtractor={(item) => item.id}
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingVertical: 8 }}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Selected Contact Footer */}
        {selectedContact && (
          <Animated.View
            entering={SlideInDown.springify()}
            exiting={SlideOutDown.springify()}
            style={{
              padding: 16,
              backgroundColor: AC.systemBackground,
              borderTopWidth: 1,
              borderTopColor: String(AC.separator) + '30',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flex: 1, marginRight: 16 }}>
              <Text style={{ 
                fontSize: 12,
                color: AC.secondaryLabel,
                marginBottom: 4,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}>
                {t('selectedContact')}
              </Text>
              <Text style={{ 
                fontSize: 16,
                fontWeight: '600',
                color: AC.label
              }}>
                {selectedContact.name}
              </Text>
              {selectedContact.selectedPhoneNumber && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                  <Ionicons name="call" size={14} color={AC.systemBlue} />
                  <Text style={{ 
                    fontSize: 14,
                    color: AC.systemBlue,
                    marginLeft: 4,
                  }}>
                    {selectedContact.selectedPhoneNumber.number}
                  </Text>
                </View>
              )}
            </View>
            <View style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: AC.systemGreen,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Ionicons name="checkmark" size={24} color="white" />
            </View>
          </Animated.View>
        )}

        {/* Phone Number Selector Modal */}
        {showPhoneSelector && pendingContact && (
          <>
            <Animated.View
              entering={FadeIn}
              exiting={FadeOut}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
              }}
            >
              <Pressable 
                style={{ flex: 1 }}
                onPress={() => {
                  setShowPhoneSelector(false);
                  setPendingContact(null);
                }}
              />
            </Animated.View>
            
            <Animated.View
              entering={SlideInDown.springify()}
              exiting={SlideOutDown.springify()}
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: AC.systemBackground,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                paddingTop: 8,
                paddingBottom: 34,
                maxHeight: '80%',
              }}
            >
              {/* Handle */}
              <View style={{
                width: 36,
                height: 5,
                backgroundColor: AC.tertiaryLabel,
                borderRadius: 3,
                alignSelf: 'center',
                marginBottom: 16,
              }} />

              <Text style={{
                fontSize: 20,
                fontWeight: '600',
                color: AC.label,
                textAlign: 'center',
                marginBottom: 8,
                paddingHorizontal: 16,
              }}>
                {t('chooseNumber')}
              </Text>
              
              <Text style={{
                fontSize: 16,
                color: AC.secondaryLabel,
                textAlign: 'center',
                marginBottom: 20,
                paddingHorizontal: 16,
              }}>
                {pendingContact.name}
              </Text>

              <ScrollView style={{ maxHeight: 300 }}>
                {pendingContact.phoneNumbers?.map((phone, index) => (
                  <TouchableOpacity
                    key={phone.id}
                    onPress={() => selectContactWithPhone(pendingContact, phone)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 16,
                      paddingHorizontal: 20,
                      borderBottomWidth: index < pendingContact.phoneNumbers!.length - 1 ? 1 : 0,
                      borderBottomColor: String(AC.separator) + '30',
                    }}
                  >
                    <View style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: String(AC.systemBlue) + '20',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 16,
                    }}>
                      <Ionicons name="call" size={20} color={AC.systemBlue} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontSize: 16,
                        color: AC.label,
                        fontWeight: '500',
                      }}>
                        {phone.number}
                      </Text>
                      <Text style={{
                        fontSize: 14,
                        color: AC.secondaryLabel,
                        marginTop: 2,
                      }}>
                        {phone.label}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={AC.tertiaryLabel} />
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity
                onPress={() => {
                  setShowPhoneSelector(false);
                  setPendingContact(null);
                }}
                style={{
                  marginTop: 16,
                  marginHorizontal: 20,
                  paddingVertical: 14,
                  backgroundColor: AC.systemGray5,
                  borderRadius: 10,
                  alignItems: 'center',
                }}
              >
                <Text style={{
                  fontSize: 16,
                  color: AC.label,
                  fontWeight: '500',
                }}>
                  Annuler
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
