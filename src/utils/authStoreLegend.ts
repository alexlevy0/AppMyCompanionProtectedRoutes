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
  getUserByIdSync,
} from './SupaLegend'
import React from 'react'

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

  updateCallSettings: async (settings: CallSettings) => {
    const currentUserId = authState$.currentUserId.get()
    if (currentUserId) {
      await updateUserCallSettings(currentUserId, settings)
    }
  },

  updateNotificationSettings: async (settings: NotificationSettings) => {
    const currentUserId = authState$.currentUserId.get()
    if (currentUserId) {
      await updateUserNotificationSettings(currentUserId, settings)
    }
  },

  updateSelectedContact: async (contact: SelectedContact) => {
    console.log('🔍 updateSelectedContact called with:', contact)
    const currentUserId = authState$.currentUserId.get()
    console.log('🔍 Current user ID:', currentUserId)
    if (currentUserId) {
      await updateUserSelectedContact(currentUserId, contact)
    } else {
      console.warn('⚠️ No current user ID found')
    }
  },

  removeSelectedContact: async () => {
    const currentUserId = authState$.currentUserId.get()
    if (currentUserId) {
      await updateUserSelectedContact(currentUserId, undefined)
    }
  },
}

// Fonction pour mapper un utilisateur Supabase vers un utilisateur de l'app
function mapSupabaseUserToAppUser(supabaseUser: any): User {
  console.log('🔄 Mapping Supabase user to app user:', {
    id: supabaseUser.id,
    call_settings: supabaseUser.call_settings,
    notification_settings: supabaseUser.notification_settings,
    selected_contact: supabaseUser.selected_contact
  });
  
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
  const currentUser = currentUserId ? getUserByIdSync(currentUserId) : null
  const user = currentUser ? mapSupabaseUserToAppUser(currentUser) : null
  
  return {
    ...state,
    user,
    ...authActions,
  }
}

// Hook observer pour les composants React
export const useAuthStoreObserver = () => {
  const [user, setUser] = React.useState<any>(null)
  const [isLoadingUser, setIsLoadingUser] = React.useState(false)
  
  // Obtenir l'ID de l'utilisateur actuel
  const currentUserId = authState$.currentUserId.get()
  
  // Charger l'utilisateur de manière asynchrone
  React.useEffect(() => {
    const loadUser = async () => {
      if (currentUserId) {
        setIsLoadingUser(true)
        
        try {
          // D'abord essayer de récupérer depuis l'observable local
          const localUser = getUserByIdSync(currentUserId)
          
          if (localUser) {
            setUser(localUser)
            setIsLoadingUser(false)
          } else {
            // Si pas dans l'observable local, charger depuis Supabase
            const supabaseUser = await getUserById(currentUserId)
            setUser(supabaseUser)
            setIsLoadingUser(false)
          }
        } catch (error) {
          console.error('Error loading user:', error)
          setIsLoadingUser(false)
        }
      } else {
        setUser(null)
        setIsLoadingUser(false)
      }
    }
    
    loadUser()
  }, [currentUserId])
  
  // Écouter les changements de l'observable users$ pour l'utilisateur actuel
  React.useEffect(() => {
    if (currentUserId) {
      // Créer un observateur pour l'utilisateur spécifique
      const unsubscribe = users$[currentUserId].onChange(({ value }) => {
        console.log('🔄 User updated in observable, updating UI:', value)
        setUser(value)
      })
      
      return unsubscribe
    }
  }, [currentUserId])
  
  // Retourner directement les observables pour que Legend-State puisse les observer
  return {
    // Observables pour déclencher les re-renders
    get isLoggedIn() { return authState$.isLoggedIn.get() },
    get shouldCreateAccount() { return authState$.shouldCreateAccount.get() },
    get hasCompletedOnboarding() { return authState$.hasCompletedOnboarding.get() },
    get isVip() { return authState$.isVip.get() },
    get _hasHydrated() { return authState$._hasHydrated.get() },
    get currentUserId() { return authState$.currentUserId.get() },
    
    // Obtenir l'utilisateur actuel
    get user() {
      return user ? mapSupabaseUserToAppUser(user) : null
    },
    
    // État de chargement
    get isLoadingUser() { return isLoadingUser },
    
    // Actions
    ...authActions,
  }
}

// Configuration de la persistance
if (!isSSR) {
  // Charger l'état depuis AsyncStorage au démarrage
  const loadAuthState = async () => {
    try {
      const savedState = await AsyncStorage.getItem('auth-state')
      if (savedState) {
        const parsedState = JSON.parse(savedState)
        authState$.set(parsedState)
        console.log('Auth state loaded from storage:', parsedState)
      }
    } catch (error) {
      console.error('Error loading auth state:', error)
    }
  }
  
  loadAuthState()

  // Sauvegarder l'état à chaque changement
  authState$.onChange(({ value }) => {
    const saveAuthState = async () => {
      try {
        await AsyncStorage.setItem('auth-state', JSON.stringify(value))
        console.log('Auth state saved to storage:', value)
      } catch (error) {
        console.error('Error saving auth state:', error)
      }
    }
    
    saveAuthState()
  })
  
  console.log('Auth state persistence configured')
} 