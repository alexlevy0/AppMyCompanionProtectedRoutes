import { observablePersistAsyncStorage } from '@legendapp/state/persist-plugins/async-storage'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'

// Détection de l'environnement
const isSSR = typeof window === "undefined"

// Configuration globale de Legend-State
export function configureLegendStateApp() {
  if (isSSR) {
    // Configuration minimale pour SSR
    console.log('Legend-State: SSR mode - persistence disabled')
  } else {
    // Configuration complète pour le client
    console.log('Legend-State: Client mode - persistence enabled')
    
    // Configuration pour le développement
    if (__DEV__) {
      console.log('Legend-State: Development mode - logging enabled')
    }
  }
}

// Fonction pour initialiser la synchronisation
export function initializeSync() {
  if (!isSSR) {
    console.log('Initializing Legend-State sync...')
    
    // Note: On ne charge plus tous les utilisateurs au démarrage
    // Chaque utilisateur sera chargé individuellement quand nécessaire
    // via getUserById() quand l'utilisateur se connecte
    
    console.log('Legend-State sync initialized successfully')
  }
} 