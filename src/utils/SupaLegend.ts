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
export async function createUser(userData: Omit<User, 'id'>) {
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
  try {
    const { error } = await supabase.from('users').insert(userRecord)
    if (error) {
      console.error('Error creating user in Supabase:', error)
    } else {
      console.log('User created in Supabase:', id)
    }
  } catch (error) {
    console.error('Exception while creating user in Supabase:', error)
  }
  
  return id
}

export async function updateUser(id: string, updates: Partial<User>) {
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
    try {
      const { error } = await supabase.from('users').update(updatedUser).eq('id', id)
      if (error) {
        console.error('Error updating user in Supabase:', error)
      } else {
        console.log('User updated in Supabase:', id)
      }
    } catch (error) {
      console.error('Exception while updating user in Supabase:', error)
    }
  }
}

export async function updateUserCallSettings(id: string, settings: CallSettings) {
  const user = users$[id].get()
  if (user) {
    const updatedUser = { ...user, call_settings: settings }
    users$[id].set(updatedUser)
    
    try {
      const { error } = await supabase.from('users').update({ call_settings: settings }).eq('id', id)
      if (error) {
        console.error('Error updating call settings in Supabase:', error)
      }
    } catch (error) {
      console.error('Exception while updating call settings in Supabase:', error)
    }
  }
}

export async function updateUserNotificationSettings(id: string, settings: NotificationSettings) {
  const user = users$[id].get()
  if (user) {
    const updatedUser = { ...user, notification_settings: settings }
    users$[id].set(updatedUser)
    
    try {
      const { error } = await supabase.from('users').update({ notification_settings: settings }).eq('id', id)
      if (error) {
        console.error('Error updating notification settings in Supabase:', error)
      }
    } catch (error) {
      console.error('Exception while updating notification settings in Supabase:', error)
    }
  }
}

export async function updateUserSelectedContact(id: string, contact: SelectedContact | undefined) {
  console.log('🔍 updateUserSelectedContact called with:', { id, contact })
  
  const user = users$[id].get()
  console.log('🔍 Current user in observable:', user)
  
  if (user) {
    const updatedUser = { ...user, selected_contact: contact }
    users$[id].set(updatedUser)
    console.log('🔍 Updated user in observable:', updatedUser)
    
    // Utiliser null au lieu de undefined pour Supabase
    const supabaseContact = contact === undefined ? null : contact
    
    try {
      const { error, data } = await supabase.from('users').update({ selected_contact: supabaseContact }).eq('id', id)
      if (error) {
        console.error('❌ Error updating selected contact in Supabase:', error)
        return { success: false, error }
      } else {
        console.log('✅ Selected contact updated in Supabase:', { id, contact: supabaseContact, data })
        return { success: true, data }
      }
    } catch (error) {
      console.error('❌ Exception while updating selected contact in Supabase:', error)
      return { success: false, error }
    }
  } else {
    console.warn('⚠️ User not found in observable for ID:', id)
    // Essayer de récupérer l'utilisateur depuis Supabase
    try {
      const { data, error } = await supabase.from('users').select('*').eq('id', id).single()
      
      if (error) {
        console.error('❌ User not found in Supabase:', error)
        return { success: false, error }
      } else {
        console.log('✅ User found in Supabase, updating...', data)
        // Créer l'utilisateur dans l'observable local
        users$[id].set({ ...data, selected_contact: contact })
        // Mettre à jour dans Supabase
        const supabaseContact = contact === undefined ? null : contact
        
        const { error: updateError } = await supabase.from('users').update({ selected_contact: supabaseContact }).eq('id', id)
        if (updateError) {
          console.error('❌ Error updating selected contact in Supabase:', updateError)
          return { success: false, error: updateError }
        } else {
          console.log('✅ Selected contact updated in Supabase after user fetch')
          return { success: true }
        }
      }
    } catch (error) {
      console.error('❌ Exception while fetching/updating user from Supabase:', error)
      return { success: false, error }
    }
  }
}

export async function deleteUser(id: string) {
  users$[id].delete()
  
  try {
    const { error } = await supabase.from('users').delete().eq('id', id)
    if (error) {
      console.error('Error deleting user in Supabase:', error)
    }
  } catch (error) {
    console.error('Exception while deleting user in Supabase:', error)
  }
}

// Fonction pour obtenir un utilisateur par email
export function getUserByEmail(email: string) {
  const users = users$.get()
  if (!users) return null
  
  return Object.values(users).find(user => user.email === email) || null
}

// Fonction pour obtenir un utilisateur par ID
export async function getUserById(id: string) {
  // D'abord, essayer de récupérer depuis l'observable local
  const localUser = users$[id].get()
  
  if (localUser) {
    return localUser
  }
  
  // Si l'utilisateur n'est pas dans l'observable local, essayer de le récupérer depuis Supabase
  console.log('🔍 User not found in local observable, fetching from Supabase:', id)
  
  try {
    const { data, error } = await supabase.from('users').select('*').eq('id', id).single()
    
    if (error) {
      console.error('❌ Error fetching user from Supabase:', error)
      return null
    }
    
    if (data) {
      // Ajouter l'utilisateur à l'observable local
      users$[id].set(data)
      console.log('✅ User loaded from Supabase and added to local observable:', id)
      return data
    }
    
    return null
  } catch (error) {
    console.error('❌ Exception while fetching user from Supabase:', error)
    return null
  }
}

// Fonction synchrone pour obtenir un utilisateur par ID (pour la compatibilité)
export function getUserByIdSync(id: string) {
  return users$[id].get()
}

// Fonction pour charger les utilisateurs depuis Supabase
export async function loadUsersFromSupabase() {
  try {
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
  } catch (error) {
    console.error('Exception while loading users from Supabase:', error)
  }
}

export { supabase } 