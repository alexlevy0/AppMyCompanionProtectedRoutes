# Synchronisation Legend-State avec Supabase

Ce document explique comment configurer et utiliser la synchronisation Legend-State avec Supabase dans l'application MyCompanion.

## Configuration

### 1. Variables d'environnement

Créez un fichier `.env.local` à la racine du projet avec vos clés Supabase :

```env
EXPO_PUBLIC_SUPABASE_URL=votre_url_supabase
EXPO_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anonyme_supabase
```

### 2. Base de données Supabase

Exécutez le script de migration SQL dans votre projet Supabase :

```sql
-- Le fichier supabase/migrations/001_create_users_table.sql contient le script complet
```

Ou utilisez la CLI Supabase :

```bash
# Installer Supabase CLI
npm install -g supabase

# Initialiser le projet
supabase init

# Lier à votre projet Supabase
supabase link --project-ref votre_project_ref

# Appliquer les migrations
supabase db push
```

### 3. Génération des types TypeScript

```bash
# Générer les types depuis Supabase
supabase gen types typescript --project-id votre_project_id > src/utils/database.types.ts
```

## Architecture

### Fichiers principaux

- `src/utils/SupaLegend.ts` : Configuration Legend-State et Supabase
- `src/utils/authStoreLegend.ts` : Nouveau authStore avec synchronisation
- `supabase/migrations/001_create_users_table.sql` : Schéma de base de données

### Structure des données

La table `users` contient :
- `id` : UUID unique
- `name` : Nom de l'utilisateur
- `email` : Email unique
- `phone` : Numéro de téléphone (optionnel)
- `call_settings` : Paramètres d'appel (JSONB)
- `notification_settings` : Paramètres de notification (JSONB)
- `selected_contact` : Contact sélectionné (JSONB)
- `created_at` / `updated_at` : Timestamps automatiques
- `deleted` : Soft delete

## Utilisation

### Migration depuis l'ancien authStore

1. Remplacez les imports :
```typescript
// Avant
import { useAuthStore } from "@/utils/authStore";

// Après
import { useAuthStoreObserver } from "@/utils/authStoreLegend";
```

2. Utilisez le nouveau hook :
```typescript
const { user, updateNotificationSettings } = useAuthStoreObserver();
```

### Fonctionnalités

- **Synchronisation automatique** : Les données sont synchronisées en temps réel
- **Mode hors ligne** : Les modifications sont sauvegardées localement et synchronisées quand la connexion revient
- **Persistance locale** : Utilise AsyncStorage pour la persistance locale
- **Gestion des conflits** : Legend-State gère automatiquement les conflits de synchronisation

### Exemples d'utilisation

```typescript
// Mise à jour des paramètres de notification
const { updateNotificationSettings } = useAuthStoreObserver();

updateNotificationSettings({
  lowMood: true,
  missedCalls: false,
  newTopics: true,
});

// Mise à jour des paramètres d'appel
const { updateCallSettings } = useAuthStoreObserver();

updateCallSettings({
  timezone: 'Europe/Paris',
  schedules: {
    monday: { name: 'Lundi', enabled: true, timeSlot: '9:00-12:00' },
    // ...
  },
});
```

## Avantages

1. **Performance** : Legend-State est optimisé pour les performances React
2. **Simplicité** : API simple et intuitive
3. **Robustesse** : Gestion automatique des erreurs et retry
4. **Temps réel** : Synchronisation en temps réel avec Supabase
5. **Hors ligne** : Fonctionne même sans connexion internet

## Dépannage

### Erreurs courantes

1. **Variables d'environnement manquantes** : Vérifiez que `.env.local` est correctement configuré
2. **Permissions Supabase** : Assurez-vous que les politiques RLS sont configurées
3. **Types TypeScript** : Régénérez les types si le schéma change

### Logs de débogage

Les logs de synchronisation sont automatiquement affichés dans la console :

```typescript
// Activer les logs détaillés
authState$.onChange(({ value }) => {
  console.log('Auth state changed:', value);
});
```

## Migration complète

Pour migrer complètement vers Legend-State :

1. Mettez à jour tous les composants pour utiliser `useAuthStoreObserver`
2. Testez la synchronisation avec Supabase
3. Supprimez l'ancien `authStore.ts` une fois la migration terminée
4. Mettez à jour la documentation

## Support

Pour plus d'informations :
- [Documentation Legend-State](https://legendapp.com/open-source/legend-state/)
- [Documentation Supabase](https://supabase.com/docs)
- [Guide de migration](https://legendapp.com/open-source/legend-state/docs/migration) 