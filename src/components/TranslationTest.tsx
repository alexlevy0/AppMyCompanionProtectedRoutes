import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useI18n } from '@/utils/I18nContext';
import * as AC from '@bacons/apple-colors';

export const TranslationTest: React.FC = () => {
  const { t, locale, changeLanguage } = useI18n();

  return (
    <View style={{ padding: 16, backgroundColor: AC.systemGroupedBackground }}>
      <Text style={{ 
        fontSize: 18, 
        fontWeight: '600', 
        marginBottom: 16,
        color: AC.label 
      }}>
        Test des traductions
      </Text>
      
      <Text style={{ 
        fontSize: 14, 
        marginBottom: 8,
        color: AC.secondaryLabel 
      }}>
        Langue actuelle: {locale}
      </Text>
      
      <Text style={{ 
        fontSize: 16, 
        marginBottom: 16,
        color: AC.label 
      }}>
        {t('appName')} - {t('appDescription')}
      </Text>
      
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TouchableOpacity
          style={{
            paddingVertical: 8,
            paddingHorizontal: 16,
            backgroundColor: locale === 'fr' ? AC.systemBlue : AC.systemGray4,
            borderRadius: 8,
          }}
          onPress={() => changeLanguage('fr')}
        >
          <Text style={{
            color: locale === 'fr' ? '#FFFFFF' : AC.label,
            fontWeight: locale === 'fr' ? '600' : '400',
          }}>
            Français
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={{
            paddingVertical: 8,
            paddingHorizontal: 16,
            backgroundColor: locale === 'en' ? AC.systemBlue : AC.systemGray4,
            borderRadius: 8,
          }}
          onPress={() => changeLanguage('en')}
        >
          <Text style={{
            color: locale === 'en' ? '#FFFFFF' : AC.label,
            fontWeight: locale === 'en' ? '600' : '400',
          }}>
            English
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}; 