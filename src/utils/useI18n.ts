import { useState, useEffect, useCallback } from 'react';
import { getLocales } from 'expo-localization';
import i18n from './i18n';

export const useI18n = () => {
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
    // Forcer le re-render de tous les composants qui utilisent useI18n
    setRefreshKey(prev => prev + 1);
  }, []);

  // Fonction de traduction avec support pour les clés imbriquées
  const t = useCallback((key: string, params?: Record<string, any>) => {
    // Utiliser refreshKey pour forcer le re-render quand la langue change
    refreshKey;
    return i18n.t(key, params);
  }, [refreshKey]);

  return {
    t,
    locale: currentLocale,
    changeLanguage,
    isRTL: false, // Pour les langues RTL si nécessaire
  };
}; 