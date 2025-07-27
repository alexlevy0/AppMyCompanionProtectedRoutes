# Guide de démarrage rapide - Synchronisation Legend-State

## 🚀 Configuration en 5 minutes

### 1. Variables d'environnement

Créez un fichier `.env.local` à la racine du projet :

```bash
cp env.example .env.local
```

Remplissez avec vos clés Supabase :
```env
EXPO_PUBLIC_SUPABASE_URL=https://cjpjdhqdfypnrzpywtdh.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anonyme_ici
```

### 2. Obtenir votre clé anonyme Supabase

1. Allez sur [app.supabase.com](https://app.supabase.com)
2. Sélectionnez votre projet
3. Allez dans **Settings** > **API**
4. Copiez la **anon public** key

### 3. Tester la synchronisation

1. Démarrez l'application :
```bash
npm start
```

2. Connectez-vous à l'application
3. Allez dans **Test Sync** (nouvelle page ajoutée)
4. Testez les boutons de synchronisation

## ✅ Vérification

### Dans la console de l'application :
- Vous devriez voir des logs de synchronisation
- Les utilisateurs créés apparaissent dans Supabase

### Dans le dashboard Supabase :
- Allez dans **Table Editor**
- Vérifiez que la table `users` existe
- Vérifiez que les données sont synchronisées

## 🔧 Dépannage

### Erreur "Access token not provided"
```bash
bunx supabase login
```

### Erreur de connexion à Supabase
- Vérifiez que les variables d'environnement sont correctes
- Vérifiez que votre projet Supabase est actif

### Pas de synchronisation
- Vérifiez la console pour les erreurs
- Assurez-vous que la table `users` existe dans Supabase

## 📱 Utilisation

### Dans vos composants :
```typescript
import { useAuthStoreObserver } from '@/utils/authStoreLegend'

const { user, updateNotificationSettings } = useAuthStoreObserver()
```

### Synchronisation automatique :
- Les modifications sont automatiquement synchronisées
- Fonctionne même hors ligne (avec retry automatique)
- Les données sont persistées localement

## 🎯 Prochaines étapes

1. **Migrer progressivement** : Remplacez `useAuthStore` par `useAuthStoreObserver`
2. **Tester en profondeur** : Utilisez la page de test pour valider
3. **Configurer les politiques RLS** : Sécurisez vos données Supabase
4. **Optimiser** : Ajustez la configuration selon vos besoins

## 📞 Support

- [Documentation Legend-State](https://legendapp.com/open-source/legend-state/)
- [Documentation Supabase](https://supabase.com/docs)
- [Guide complet](LEGEND_STATE_SYNC.md) 