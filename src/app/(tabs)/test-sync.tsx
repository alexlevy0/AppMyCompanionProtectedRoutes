import React from 'react'
import { View, ScrollView } from 'react-native'
import SyncTest from '@/components/SyncTest'
import SyncStatus from '@/components/SyncStatus'
import { AppText } from '@/components/AppText'

export default function TestSyncScreen() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <View style={{ padding: 16 }}>
        <AppText size="heading" bold center>
          Test de synchronisation
        </AppText>
        
        <AppText size="medium" color="secondary" center>
          Testez la synchronisation Legend-State avec Supabase
        </AppText>
        
        <SyncStatus />
        <SyncTest />
      </View>
    </ScrollView>
  )
} 