import React from 'react';
import { View, Text } from 'react-native';
import { useI18n } from '@/utils/I18nContext';
import * as AC from '@bacons/apple-colors';

export const DaysOfWeekTest: React.FC = () => {
  const { t, locale } = useI18n();

  const daysOfWeek = [
    t('monday'),
    t('tuesday'),
    t('wednesday'),
    t('thursday'),
    t('friday'),
    t('saturday'),
    t('sunday'),
  ];

  return (
    <View style={{ padding: 16, backgroundColor: AC.systemGroupedBackground }}>
      <Text style={{ 
        fontSize: 16, 
        fontWeight: '600', 
        marginBottom: 12,
        color: AC.label 
      }}>
        Jours de la semaine ({locale}):
      </Text>
      
      {daysOfWeek.map((day, index) => (
        <Text 
          key={index}
          style={{ 
            fontSize: 14, 
            marginBottom: 4,
            color: AC.secondaryLabel 
          }}
        >
          {index + 1}. {day}
        </Text>
      ))}
    </View>
  );
}; 