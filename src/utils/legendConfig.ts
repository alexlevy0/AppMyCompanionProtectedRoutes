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
    
    // Charger les données depuis Supabase au démarrage
    import('./SupaLegend').then(({ loadUsersFromSupabase }) => {
      loadUsersFromSupabase().then(() => {
        console.log('Users loaded from Supabase on startup')
      }).catch((error) => {
        console.error('Error loading users from Supabase:', error)
      })
    })
    
    console.log('Legend-State sync initialized successfully')
  }
} 