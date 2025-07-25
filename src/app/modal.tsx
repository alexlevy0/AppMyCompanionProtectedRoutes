import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { AppText } from "@/components/AppText";
import * as Contacts from 'expo-contacts';
import * as AC from '@bacons/apple-colors';
import { useAuthStore } from '@/utils/authStore';
import { useI18n } from '@/utils/I18nContext';
import { SelectedContact } from '@/types';

export default function ModalScreenScreen() {
  const { t } = useI18n();
  const { user, updateSelectedContact } = useAuthStore();
  const [contacts, setContacts] = useState<SelectedContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<SelectedContact | null>(null);

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
            }));
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

  const handleSelectContact = (contact: SelectedContact) => {
    if (contact.phoneNumbers && contact.phoneNumbers.length > 0) {
      // Si plusieurs numéros, demander à l'utilisateur de choisir
      if (contact.phoneNumbers.length === 1) {
        selectContactWithPhone(contact, contact.phoneNumbers[0]);
      } else {
        showPhoneNumberSelector(contact);
      }
    }
  };

  const showPhoneNumberSelector = (contact: SelectedContact) => {
    if (!contact.phoneNumbers) return;

    const options = contact.phoneNumbers.map(phone => ({
      text: `${phone.label}: ${phone.number}`,
      onPress: () => selectContactWithPhone(contact, phone)
    }));

    Alert.alert(
      t('chooseNumber'),
      `${t('selectNumberFor')} ${contact.name}:`,
      options
    );
  };

  const selectContactWithPhone = (contact: SelectedContact, phoneNumber: { id: string; number: string; label: string }) => {
    const contactWithSelectedPhone = {
      ...contact,
      selectedPhoneNumber: phoneNumber
    };
    
    setSelectedContact(contactWithSelectedPhone);
    
    // Sauvegarder dans le store
    updateSelectedContact(contactWithSelectedPhone);
    
    Alert.alert(
      t('contactSelected'),
      `${contact.name} (${phoneNumber.number}) a été sélectionné.`,
      [
        {
          text: 'OK',
          onPress: () => {
            // Fermer le modal ou naviguer vers la page d'accueil
            // Vous pouvez ajouter une navigation ici si nécessaire
          }
        }
      ]
    );
  };

  const renderContact = ({ item }: { item: SelectedContact }) => (
    <TouchableOpacity
      style={{
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: AC.separator,
        backgroundColor: AC.systemBackground,
      }}
      onPress={() => handleSelectContact(item)}
    >
      <Text style={{ 
        fontSize: 16, 
        fontWeight: '600',
        color: AC.label,
        marginBottom: 4
      }}>
        {item.name}
      </Text>
      {item.phoneNumbers && item.phoneNumbers.length > 0 && (
        <Text style={{ 
          fontSize: 14,
          color: AC.secondaryLabel
        }}>
          {item.phoneNumbers.length} {item.phoneNumbers.length > 1 ? t('phoneNumbersPlural') : t('phoneNumbers')}
        </Text>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: AC.systemGroupedBackground
      }}>
        <ActivityIndicator size="large" color={AC.systemBlue} />
        <Text style={{ 
          marginTop: 16,
          color: AC.secondaryLabel
        }}>
          {t('loadingContacts')}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: AC.systemGroupedBackground
    }}>
      <View style={{
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: AC.separator,
        backgroundColor: AC.systemBackground,
      }}>
        <AppText center size="heading">
          {t('selectContact')}
        </AppText>
        <Text style={{ 
          textAlign: 'center',
          color: AC.secondaryLabel,
          fontSize: 14,
          marginTop: 8
        }}>
          {t('selectContactDescription')}
        </Text>
      </View>

      {contacts.length === 0 ? (
        <View style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center',
          padding: 20
        }}>
          <Text style={{ 
            fontSize: 16,
            color: AC.secondaryLabel,
            textAlign: 'center'
          }}>
            {t('noContactsFound')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={contacts}
          renderItem={renderContact}
          keyExtractor={(item) => item.id}
          style={{ flex: 1 }}
        />
      )}

      {selectedContact && (
        <View style={{
          padding: 16,
          backgroundColor: AC.systemBackground,
          borderTopWidth: 1,
          borderTopColor: AC.separator,
        }}>
          <Text style={{ 
            fontSize: 14,
            color: AC.secondaryLabel,
            marginBottom: 4
          }}>
            {t('selectedContact')}:
          </Text>
          <Text style={{ 
            fontSize: 16,
            fontWeight: '600',
            color: AC.label
          }}>
            {selectedContact.name}
          </Text>
          {selectedContact.selectedPhoneNumber && (
            <Text style={{ 
              fontSize: 14,
              color: AC.systemBlue
            }}>
              {selectedContact.selectedPhoneNumber.number}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}
