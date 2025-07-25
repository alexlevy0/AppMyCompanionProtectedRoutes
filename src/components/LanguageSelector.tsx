import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useI18n } from '@/utils/I18nContext';
import * as AC from '@bacons/apple-colors';

interface LanguageOption {
  code: 'fr' | 'en';
  name: string;
  nativeName: string;
}

const languages: LanguageOption[] = [
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'en', name: 'English', nativeName: 'English' },
];

export const LanguageSelector: React.FC = () => {
  const { locale, changeLanguage, t } = useI18n();

  return (
    <View style={{ padding: 0 }}>
     
      {languages.map((language) => (
        <TouchableOpacity
          key={language.code}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 8,
            paddingHorizontal: 8,
            backgroundColor: locale === language.code ? AC.systemBlue : 'transparent',
            borderRadius: 8,
            marginBottom: 8,
          }}
          onPress={() => changeLanguage(language.code)}
        >
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: 16,
              fontWeight: locale === language.code ? '600' : '400',
              color: locale === language.code ? '#FFFFFF' : AC.label,
            }}>
              {language.nativeName}
            </Text>
            <Text style={{
              fontSize: 14,
              color: locale === language.code ? '#FFFFFF' : AC.secondaryLabel,
            }}>
              {language.name}
            </Text>
          </View>
          
          {locale === language.code && (
            <Text style={{ color: '#FFFFFF', fontSize: 16 }}>✓</Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}; 