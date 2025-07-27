import { supabase } from './SupaLegend'
import { LoginResult, RegisterResult, UserData, User } from '@/types'
import { createUser, getUserByEmail } from './SupaLegend'
import { v4 as uuidv4 } from 'uuid'
import { Database } from './database.types'

type UserRow = Database['public']['Tables']['users']['Row']

// Fonction pour hasher les mots de passe (à remplacer par bcrypt plus tard)
function hashPassword(password: string): string {
  return btoa(password + "salt_mycompanion_2025");
}

// Fonction pour vérifier le hash du mot de passe
function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

// Fonction de connexion avec Supabase
export async function loginWithSupabase(
  email: string,
  password: string,
): Promise<LoginResult> {
  try {
    console.log('🔐 Attempting login with Supabase for:', email)
    
    // Rechercher l'utilisateur dans la table users
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('deleted', false)
      .limit(1)

    if (error) {
      console.error('❌ Supabase query error:', error)
      return { success: false, error: "Erreur de base de données" }
    }

    if (!users || users.length === 0) {
      console.log('❌ User not found:', email)
      return { success: false, error: "Email ou mot de passe incorrect" }
    }

    const user = users[0]
    
    // Vérifier le mot de passe
    if (!user.password_hash || !verifyPassword(password, user.password_hash)) {
      console.log('❌ Invalid password for:', email)
      return { success: false, error: "Email ou mot de passe incorrect" }
    }

    console.log('✅ Login successful for:', email)
    
    // Retourner l'utilisateur sans le hash du mot de passe
    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || undefined,
        callSettings: user.call_settings as any || undefined,
        notificationSettings: user.notification_settings as any || undefined,
        selectedContact: user.selected_contact as any || undefined,
      }
    }
  } catch (error) {
    console.error('❌ Login error:', error)
    return { success: false, error: "Erreur de connexion" }
  }
}

// Fonction d'inscription avec Supabase
export async function registerWithSupabase(userData: UserData): Promise<RegisterResult> {
  try {
    console.log('🔐 Attempting registration with Supabase for:', userData.email)
    console.log('🔐 User data:', { ...userData, password: '[HIDDEN]' })
    
    // Vérifier si l'utilisateur existe déjà
    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', userData.email)
      .eq('deleted', false)
      .limit(1)

    if (checkError) {
      console.error('❌ Supabase check error:', checkError)
      return { success: false, error: "Erreur de base de données" }
    }

    if (existingUsers && existingUsers.length > 0) {
      console.log('❌ User already exists:', userData.email)
      return { success: false, error: "Un compte avec cet email existe déjà" }
    }

    // Créer le nouvel utilisateur
    const userId = uuidv4()
    const hashedPassword = hashPassword(userData.password)
    
    console.log('🔐 Creating user with ID:', userId)
    console.log('🔐 Hashed password length:', hashedPassword.length)
    
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: userId,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        password_hash: hashedPassword,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

    if (insertError) {
      console.error('❌ Supabase insert error:', insertError)
      return { success: false, error: "Erreur lors de la création du compte" }
    }

    console.log('✅ Registration successful for:', userData.email)
    return { success: true }
  } catch (error) {
    console.error('❌ Registration error:', error)
    return { success: false, error: "Erreur lors de l'inscription" }
  }
}

// Fonction pour changer le mot de passe
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Récupérer l'utilisateur actuel
    const { data: users, error } = await supabase
      .from('users')
      .select('password_hash')
      .eq('id', userId)
      .eq('deleted', false)
      .limit(1)

    if (error || !users || users.length === 0) {
      return { success: false, error: "Utilisateur non trouvé" }
    }

    const user = users[0]
    
    // Vérifier l'ancien mot de passe
    if (!user.password_hash || !verifyPassword(currentPassword, user.password_hash)) {
      return { success: false, error: "Mot de passe actuel incorrect" }
    }

    // Mettre à jour avec le nouveau mot de passe
    const newHashedPassword = hashPassword(newPassword)
    const { error: updateError } = await supabase
      .from('users')
      .update({
        password_hash: newHashedPassword,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (updateError) {
      return { success: false, error: "Erreur lors de la mise à jour" }
    }

    return { success: true }
  } catch (error) {
    console.error('❌ Change password error:', error)
    return { success: false, error: "Erreur lors du changement de mot de passe" }
  }
}

// Fonction pour supprimer un compte
export async function deleteAccount(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        deleted: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (error) {
      return { success: false, error: "Erreur lors de la suppression" }
    }

    return { success: true }
  } catch (error) {
    console.error('❌ Delete account error:', error)
    return { success: false, error: "Erreur lors de la suppression du compte" }
  }
}

// Fonction pour récupérer un utilisateur par ID
export async function getUserById(userId: string): Promise<User | null> {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .eq('deleted', false)
      .limit(1)

    if (error || !users || users.length === 0) {
      return null
    }

    const user = users[0]
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || undefined,
      callSettings: user.call_settings as any || undefined,
      notificationSettings: user.notification_settings as any || undefined,
      selectedContact: user.selected_contact as any || undefined,
    }
  } catch (error) {
    console.error('❌ Get user error:', error)
    return null
  }
} 