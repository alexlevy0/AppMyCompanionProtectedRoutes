import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getLocales } from 'expo-localization';
import i18n from './i18n';

interface I18nContextType {
  t: (key: string, params?: Record<string, any>) => string;
  locale: string;
  changeLanguage: (locale: 'fr' | 'en') => void;
  isRTL: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLocale, setCurrentLocale] = useState(i18n.locale);
  const [refreshKey, setRefreshKey] = useState(0);

  // Détecter la langue du système au démarrage
  useEffect(() => {
    const deviceLocale = getLocales()[0].languageCode;
    if (deviceLocale && ['fr', 'en'].includes(deviceLocale)) {
      i18n.locale = deviceLocale;
      setCurrentLocale(deviceLocale);
    }
  }, []);

  // Fonction pour changer de langue avec rafraîchissement forcé
  const changeLanguage = useCallback((locale: 'fr' | 'en') => {
    i18n.locale = locale;
    setCurrentLocale(locale);
    // Forcer le re-render de tous les composants
    setRefreshKey(prev => prev + 1);
  }, []);

  // Fonction de traduction
  const t = useCallback((key: string, params?: Record<string, any>) => {
    // Utiliser refreshKey pour forcer le re-render quand la langue change
    refreshKey;
    return i18n.t(key, params);
  }, [refreshKey]);

  const contextValue: I18nContextType = {
    t,
    locale: currentLocale,
    changeLanguage,
    isRTL: false,
  };

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}; 