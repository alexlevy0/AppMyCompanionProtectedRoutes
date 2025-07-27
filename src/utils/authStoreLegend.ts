import { observable } from '@legendapp/state'
import { observer } from '@legendapp/state/react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { observablePersistAsyncStorage } from '@legendapp/state/persist-plugins/async-storage'
import { Platform } from 'react-native'
import { loginWithSupabase } from './supabaseAuth'
import { registerWithSupabase } from './supabaseAuth'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from './SupaLegend'
import {
  UserData,
  UserState,
  CallSettings,
  NotificationSettings,
  SelectedContact,
  User,
  LoginResult,
  RegisterResult,
} from '@/types'
import {
  users$,
  createUser,
  updateUser,
  updateUserCallSettings,
  updateUserNotificationSettings,
  updateUserSelectedContact,
  getUserByEmail,
  getUserById,
} from './SupaLegend'

// Utility functions
export function hashPassword(password: string): string {
  return btoa(password + "salt_mycompanion_2025");
}

export function generateUserId(): string {
  // Utiliser uuid pour générer un UUID valide pour Supabase
  return uuidv4();
}

// Détection de l'environnement
const isSSR = typeof window === "undefined";
const isWeb = Platform.OS === "web";

// Configuration de la persistance adaptative
const persistConfig = {
  name: 'auth-store-legend',
  plugin: observablePersistAsyncStorage({
    AsyncStorage,
  }),
  skipHydration: isSSR,
}

// État principal de l'application avec Legend-State
export const authState$ = observable({
  isLoggedIn: false,
  shouldCreateAccount: false,
  hasCompletedOnboarding: false,
  isVip: false,
  _hasHydrated: true, // Pour Legend-State, on considère que c'est toujours hydraté
  currentUserId: null as string | null,
})

// Configuration de la persistance
authState$.onChange(({ value }) => {
  if (!isSSR) {
    console.log('Auth state changed:', value)
  }
})

// Fonctions d'authentification
export const authActions = {
  logIn: async (email: string, password: string): Promise<LoginResult> => {
    console.log('🔐 Attempting login with Supabase for:', email)
    const result = await loginWithSupabase(email, password)
    console.log('Login result from Supabase:', result)
    
    if (result.success && result.user) {
      // Mettre à jour l'état de connexion avec l'ID de Supabase
      authState$.assign({
        isLoggedIn: true,
        currentUserId: result.user.id,
      })
      console.log('Auth state updated with Supabase ID:', result.user.id)
      
      // Mettre à jour last_login dans Supabase
      try {
        await supabase
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', result.user.id)
      } catch (error) {
        console.warn('Failed to update last_login:', error)
      }
      
      return result
    }
    return result
  },

  register: async (userData: UserData): Promise<RegisterResult> => {
    console.log('🔐 Attempting registration with Supabase for:', userData.email)
    const result = await registerWithSupabase(userData)
    console.log('Registration result from Supabase:', result)
    
    if (result.success) {
      // L'utilisateur est maintenant créé dans Supabase
      // On peut se connecter automatiquement
      const loginResult = await loginWithSupabase(userData.email, userData.password)
      if (loginResult.success && loginResult.user) {
        authState$.assign({
          isLoggedIn: true,
          currentUserId: loginResult.user.id,
        })
        console.log('User registered and logged in with Supabase ID:', loginResult.user.id)
      }
    }
    return result
  },

  logInAsVip: () => {
    const vipUserId = uuidv4()
    authState$.assign({
      isVip: true,
      isLoggedIn: true,
      currentUserId: vipUserId,
    })
    console.log('VIP user logged in with UUID:', vipUserId)
  },

  logOut: () => {
    authState$.assign({
      isVip: false,
      isLoggedIn: false,
      currentUserId: null,
    })
    console.log('User logged out, state reset')
  },

  completeOnboarding: () => {
    authState$.hasCompletedOnboarding.set(true)
  },

  resetOnboarding: () => {
    authState$.hasCompletedOnboarding.set(false)
  },

  setHasHydrated: (value: boolean) => {
    authState$._hasHydrated.set(value)
  },

  updateCallSettings: (settings: CallSettings) => {
    const currentUserId = authState$.currentUserId.get()
    if (currentUserId) {
      updateUserCallSettings(currentUserId, settings)
    }
  },

  updateNotificationSettings: (settings: NotificationSettings) => {
    const currentUserId = authState$.currentUserId.get()
    if (currentUserId) {
      updateUserNotificationSettings(currentUserId, settings)
    }
  },

  updateSelectedContact: (contact: SelectedContact) => {
    console.log('🔍 updateSelectedContact called with:', contact)
    const currentUserId = authState$.currentUserId.get()
    console.log('🔍 Current user ID:', currentUserId)
    if (currentUserId) {
      updateUserSelectedContact(currentUserId, contact)
    } else {
      console.warn('⚠️ No current user ID found')
    }
  },

  removeSelectedContact: () => {
    const currentUserId = authState$.currentUserId.get()
    if (currentUserId) {
      updateUserSelectedContact(currentUserId, undefined)
    }
  },
}

// Fonction pour mapper un utilisateur Supabase vers un utilisateur de l'app
function mapSupabaseUserToAppUser(supabaseUser: any): User {
  return {
    id: supabaseUser.id,
    name: supabaseUser.name,
    email: supabaseUser.email,
    phone: supabaseUser.phone,
    callSettings: supabaseUser.call_settings,
    notificationSettings: supabaseUser.notification_settings,
    selectedContact: supabaseUser.selected_contact,
  }
}

// Hook pour utiliser l'authStore avec Legend-State
export function useAuthStore() {
  const state = authState$.get()
  const currentUserId = state.currentUserId
  
  // Obtenir l'utilisateur actuel depuis Supabase
  const currentUser = currentUserId ? getUserById(currentUserId) : null
  const user = currentUser ? mapSupabaseUserToAppUser(currentUser) : null
  
  return {
    ...state,
    user,
    ...authActions,
  }
}

// Hook observer pour les composants React
export const useAuthStoreObserver = () => {
  // Retourner directement les observables pour que Legend-State puisse les observer
  return {
    // Observables pour déclencher les re-renders
    get isLoggedIn() { return authState$.isLoggedIn.get() },
    get shouldCreateAccount() { return authState$.shouldCreateAccount.get() },
    get hasCompletedOnboarding() { return authState$.hasCompletedOnboarding.get() },
    get isVip() { return authState$.isVip.get() },
    get _hasHydrated() { return authState$._hasHydrated.get() },
    get currentUserId() { return authState$.currentUserId.get() },
    
    // Obtenir l'utilisateur actuel depuis Supabase
    get user() {
      const currentUserId = authState$.currentUserId.get()
      const currentUser = currentUserId ? getUserById(currentUserId) : null
      return currentUser ? mapSupabaseUserToAppUser(currentUser) : null
    },
    
    // Actions
    ...authActions,
  }
}

// Configuration de la persistance
if (!isSSR) {
  // Charger l'état depuis AsyncStorage au démarrage
  AsyncStorage.getItem('auth-state').then((savedState) => {
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState)
        authState$.set(parsedState)
        console.log('Auth state loaded from storage:', parsedState)
      } catch (error) {
        console.error('Error loading auth state:', error)
      }
    }
  })

  // Sauvegarder l'état à chaque changement
  authState$.onChange(({ value }) => {
    AsyncStorage.setItem('auth-state', JSON.stringify(value))
    console.log('Auth state saved to storage:', value)
  })
  
  console.log('Auth state persistence configured')
} 