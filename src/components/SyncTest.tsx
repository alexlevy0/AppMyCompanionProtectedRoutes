import React, { useState } from 'react'
import { View, TouchableOpacity } from 'react-native'
import { observer } from '@legendapp/state/react'
import { users$, createUser, updateUser } from '@/utils/SupaLegend'
import { useAuthStoreObserver } from '@/utils/authStoreLegend'
import { AppText } from './AppText'
import { Button } from './Button'

const SyncTest = observer(() => {
  const { user, updateNotificationSettings } = useAuthStoreObserver()
  const [testUserId, setTestUserId] = useState<string | null>(null)
  
  const users = users$.get()
  const userCount = users ? Object.keys(users).length : 0

  const handleCreateTestUser = () => {
    const userId = createUser({
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      phone: '+1234567890',
    })
    setTestUserId(userId)
    console.log('Test user created:', userId)
  }

  const handleUpdateTestUser = () => {
    if (testUserId) {
      updateUser(testUserId, {
        name: 'Updated Test User',
        phone: '+0987654321',
      })
      console.log('Test user updated:', testUserId)
    }
  }

  const handleUpdateNotificationSettings = () => {
    if (user) {
      updateNotificationSettings({
        lowMood: !user.notificationSettings?.lowMood,
        missedCalls: !user.notificationSettings?.missedCalls,
        newTopics: !user.notificationSettings?.newTopics,
      })
      console.log('Notification settings updated')
    }
  }

  return (
    <View style={{ padding: 16, backgroundColor: '#f0f0f0', borderRadius: 8, margin: 16 }}>
      <AppText size="large" bold>
        Test de synchronisation Legend-State
      </AppText>
      
      <AppText size="medium" color="secondary">
        Utilisateurs dans la base : {userCount}
      </AppText>
      
      {user && (
        <AppText size="small" color="tertiary">
          Utilisateur connecté : {user.name} ({user.email})
        </AppText>
      )}

      <View style={{ marginTop: 16, gap: 8 }}>
        <Button title="Créer un utilisateur de test" onPress={handleCreateTestUser} />
        
        {testUserId && (
          <Button title="Mettre à jour l'utilisateur de test" onPress={handleUpdateTestUser} />
        )}
        
        {user && (
          <Button title="Mettre à jour les notifications" onPress={handleUpdateNotificationSettings} />
        )}
      </View>

      <AppText size="small" color="tertiary" className="mt-4">
        Vérifiez la console pour voir les logs de synchronisation
      </AppText>
    </View>
  )
})

export default SyncTest 