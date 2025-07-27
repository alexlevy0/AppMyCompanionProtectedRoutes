import React from 'react'
import { View, Text } from 'react-native'
import { observer } from '@legendapp/state/react'
import { users$ } from '@/utils/SupaLegend'
import { AppText } from './AppText'

const SyncStatus = observer(() => {
  const users = users$.get()
  const userCount = users ? Object.keys(users).length : 0

  return (
    <View style={{ padding: 16, backgroundColor: '#f5f5f5', borderRadius: 8, margin: 16 }}>
      <AppText size="large" bold>
        Statut de synchronisation
      </AppText>
      <AppText size="medium" color="secondary">
        Utilisateurs synchronisés : {userCount}
      </AppText>
      <AppText size="small" color="tertiary">
        Les données sont synchronisées en temps réel avec Supabase
      </AppText>
    </View>
  )
})

export default SyncStatus 