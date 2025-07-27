import { createClient } from '@supabase/supabase-js'
import { observable } from '@legendapp/state'
import { observablePersistAsyncStorage } from '@legendapp/state/persist-plugins/async-storage'
import AsyncStorage from '@react-native-async-storage/async-storage'
import 'react-native-get-random-values'
import { v4 as uuidv4 } from 'uuid'
import { User, CallSettings, NotificationSettings, SelectedContact } from '@/types'
import { Database } from './database.types'

const supabase = createClient<Database>(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
)

// Fonction pour générer des IDs
const generateId = () => uuidv4()

// Observable simple pour les utilisateurs (sans synchronisation complexe pour l'instant)
export const users$ = observable<Record<string, any>>({})

// Configuration de la persistance locale
// Note: La persistance sera configurée plus tard avec la bonne API

// Fonctions utilitaires pour manipuler les utilisateurs
export function createUser(userData: Omit<User, 'id'>) {
  const id = generateId()
  const userRecord = {
    id,
    name: userData.name,
    email: userData.email,
    phone: userData.phone,
    call_settings: userData.callSettings,
    notification_settings: userData.notificationSettings,
    selected_contact: userData.selectedContact,
  }
  
  // Ajouter à l'observable local
  users$[id].set(userRecord)
  
  // Synchroniser avec Supabase
  supabase.from('users').insert(userRecord).then(({ error }) => {
    if (error) {
      console.error('Error creating user in Supabase:', error)
    } else {
      console.log('User created in Supabase:', id)
    }
  })
  
  return id
}

export function updateUser(id: string, updates: Partial<User>) {
  const user = users$[id].get()
  if (user) {
    const updatedUser = {
      ...user,
      ...updates,
      call_settings: updates.callSettings,
      notification_settings: updates.notificationSettings,
      selected_contact: updates.selectedContact,
    }
    
    // Mettre à jour l'observable local
    users$[id].set(updatedUser)
    
    // Synchroniser avec Supabase
    supabase.from('users').update(updatedUser).eq('id', id).then(({ error }) => {
      if (error) {
        console.error('Error updating user in Supabase:', error)
      } else {
        console.log('User updated in Supabase:', id)
      }
    })
  }
}

export function updateUserCallSettings(id: string, settings: CallSettings) {
  const user = users$[id].get()
  if (user) {
    const updatedUser = { ...user, call_settings: settings }
    users$[id].set(updatedUser)
    
    supabase.from('users').update({ call_settings: settings }).eq('id', id).then(({ error }) => {
      if (error) {
        console.error('Error updating call settings in Supabase:', error)
      }
    })
  }
}

export function updateUserNotificationSettings(id: string, settings: NotificationSettings) {
  const user = users$[id].get()
  if (user) {
    const updatedUser = { ...user, notification_settings: settings }
    users$[id].set(updatedUser)
    
    supabase.from('users').update({ notification_settings: settings }).eq('id', id).then(({ error }) => {
      if (error) {
        console.error('Error updating notification settings in Supabase:', error)
      }
    })
  }
}

export function updateUserSelectedContact(id: string, contact: SelectedContact | undefined) {
  console.log('🔍 updateUserSelectedContact called with:', { id, contact })
  
  const user = users$[id].get()
  console.log('🔍 Current user in observable:', user)
  
  if (user) {
    const updatedUser = { ...user, selected_contact: contact }
    users$[id].set(updatedUser)
    console.log('🔍 Updated user in observable:', updatedUser)
    
    supabase.from('users').update({ selected_contact: contact }).eq('id', id).then(({ error, data }) => {
      if (error) {
        console.error('❌ Error updating selected contact in Supabase:', error)
      } else {
        console.log('✅ Selected contact updated in Supabase:', { id, contact, data })
      }
    })
  } else {
    console.warn('⚠️ User not found in observable for ID:', id)
    // Essayer de récupérer l'utilisateur depuis Supabase
    supabase.from('users').select('*').eq('id', id).single().then(({ data, error }) => {
      if (error) {
        console.error('❌ User not found in Supabase:', error)
      } else {
        console.log('✅ User found in Supabase, updating...', data)
        // Créer l'utilisateur dans l'observable local
        users$[id].set({ ...data, selected_contact: contact })
        // Mettre à jour dans Supabase
        supabase.from('users').update({ selected_contact: contact }).eq('id', id).then(({ error }) => {
          if (error) {
            console.error('❌ Error updating selected contact in Supabase:', error)
          } else {
            console.log('✅ Selected contact updated in Supabase after user fetch')
          }
        })
      }
    })
  }
}

export function deleteUser(id: string) {
  users$[id].delete()
  
  supabase.from('users').delete().eq('id', id).then(({ error }) => {
    if (error) {
      console.error('Error deleting user in Supabase:', error)
    }
  })
}

// Fonction pour obtenir un utilisateur par email
export function getUserByEmail(email: string) {
  const users = users$.get()
  if (!users) return null
  
  return Object.values(users).find(user => user.email === email) || null
}

// Fonction pour obtenir un utilisateur par ID
export function getUserById(id: string) {
  return users$[id].get()
}

// Fonction pour charger les utilisateurs depuis Supabase
export async function loadUsersFromSupabase() {
  const { data, error } = await supabase.from('users').select('*')
  
  if (error) {
    console.error('Error loading users from Supabase:', error)
    return
  }
  
  if (data) {
    const usersMap: Record<string, any> = {}
    data.forEach(user => {
      usersMap[user.id] = user
    })
    users$.set(usersMap)
    console.log('Users loaded from Supabase:', data.length)
  }
}

export { supabase } 