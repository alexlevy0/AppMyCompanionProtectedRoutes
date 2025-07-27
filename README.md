# MyCompanion - Application avec synchronisation Legend-State

Application Expo avec synchronisation en temps réel utilisant Legend-State et Supabase.

## Fonctionnalités

- **Synchronisation en temps réel** avec Supabase
- **Mode hors ligne** avec persistance locale
- **Gestion d'état optimisée** avec Legend-State
- **Interface utilisateur moderne** avec NativeWind
- **Support multi-plateforme** (iOS, Android, Web)

## Technologies utilisées

- Expo Router
- Legend-State (état et synchronisation)
- Supabase (base de données et temps réel)
- NativeWind (styling)
- TypeScript
- ESLint & Prettier

## Configuration

### 1. Variables d'environnement

Copiez le fichier d'exemple et configurez vos clés Supabase :

```bash
cp env.example .env.local
```

Remplissez les variables dans `.env.local` :
```env
EXPO_PUBLIC_SUPABASE_URL=votre_url_supabase
EXPO_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anonyme_supabase
```

### 2. Base de données Supabase

Exécutez le script de migration SQL dans votre projet Supabase :
```sql
-- Voir le fichier supabase/migrations/001_create_users_table.sql
```

### 3. Installation des dépendances

```bash
npm install
```

### 4. Démarrage

```bash
npm start
```

## Architecture

### Fichiers principaux

- `src/utils/SupaLegend.ts` - Configuration Legend-State et Supabase
- `src/utils/authStoreLegend.ts` - AuthStore avec synchronisation
- `src/utils/legendConfig.ts` - Configuration globale Legend-State
- `supabase/migrations/` - Scripts de migration de base de données

### Composants

- `src/components/AppText.tsx` - Composant texte stylisé
- `src/components/Button.tsx` - Composant bouton
- `src/components/SyncStatus.tsx` - Statut de synchronisation
- `src/components/SyncTest.tsx` - Tests de synchronisation

## Synchronisation

L'application utilise Legend-State pour la synchronisation automatique avec Supabase :

- **Synchronisation en temps réel** des données utilisateur
- **Persistance locale** avec AsyncStorage
- **Mode hors ligne** avec retry automatique
- **Gestion des conflits** automatique

Voir `docs/LEGEND_STATE_SYNC.md` pour plus de détails.

## Développement

### Structure du projet

```
src/
├── app/                 # Pages Expo Router
├── components/          # Composants réutilisables
├── utils/              # Utilitaires et configuration
└── types/              # Types TypeScript

supabase/
└── migrations/         # Scripts de migration SQL

docs/                   # Documentation
```

### Tests de synchronisation

Utilisez le composant `SyncTest` pour tester la synchronisation :

```typescript
import { SyncTest } from '@/components/SyncTest'

// Dans votre composant
<SyncTest />
```

## Support

- [Documentation Legend-State](https://legendapp.com/open-source/legend-state/)
- [Documentation Supabase](https://supabase.com/docs)
- [Guide de synchronisation](docs/LEGEND_STATE_SYNC.md)
