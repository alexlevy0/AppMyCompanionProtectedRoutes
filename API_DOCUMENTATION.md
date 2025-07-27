# MyCompanion API Documentation

## Table of Contents

1. [Overview](#overview)
2. [Type Definitions](#type-definitions)
3. [Authentication & State Management](#authentication--state-management)
4. [Internationalization (i18n)](#internationalization-i18n)
5. [UI Components](#ui-components)
6. [Utility Functions](#utility-functions)
7. [API Endpoints](#api-endpoints)
8. [App Structure](#app-structure)
9. [Examples & Usage Patterns](#examples--usage-patterns)

## Overview

MyCompanion is a React Native/Expo application designed to help families stay connected with their senior loved ones through daily calls and updates. The app features a bilingual interface (French/English), user authentication, contact management, and notification settings.

**Tech Stack:**
- React Native with Expo
- TypeScript
- Zustand for state management
- Expo Router for navigation
- NativeWind for styling
- i18n-js for internationalization

## Type Definitions

### Core Types

```typescript
// Time slot options for call scheduling
export type TimeSlot = "9:00-12:00" | "12:00-15:00" | "15:00-18:00";

// Daily schedule configuration
export type DaySchedule = {
  name: string;           // Day name
  enabled: boolean;       // Whether calls are enabled for this day
  timeSlot: TimeSlot;    // Preferred time slot
};

// Call settings for a user
export type CallSettings = {
  timezone: string;                            // User's timezone
  schedules: Record<string, DaySchedule>;     // Weekly schedule
};

// Notification preferences
export type NotificationSettings = {
  lowMood: boolean;      // Notify on low mood detection
  missedCalls: boolean;  // Notify on missed calls
  newTopics: boolean;    // Notify on new conversation topics
};

// Contact information
export type SelectedContact = {
  id: string;
  name: string;
  phoneNumbers?: Array<{
    id: string;
    number: string;
    label: string;
  }>;
  selectedPhoneNumber?: {
    id: string;
    number: string;
    label: string;
  };
};

// User profile
export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  callSettings?: CallSettings;
  notificationSettings?: NotificationSettings;
  selectedContact?: SelectedContact;
};

// Authentication results
export type LoginResult = {
  success: boolean;
  user?: User;
  error?: string;
};

export type RegisterResult = {
  success: boolean;
  error?: string;
};

// User registration data
export type UserData = {
  name: string;
  email: string;
  password: string;
  phone?: string;
};
```

## Authentication & State Management

### useAuthStore Hook

The main state management hook using Zustand for user authentication and app state.

```typescript
import { useAuthStore } from '@/utils/authStore';

// Hook usage
const {
  isLoggedIn,
  shouldCreateAccount,
  hasCompletedOnboarding,
  isVip,
  user,
  logIn,
  register,
  logOut,
  completeOnboarding,
  resetOnboarding,
  logInAsVip,
  updateCallSettings,
  updateNotificationSettings,
  updateSelectedContact,
  removeSelectedContact
} = useAuthStore();
```

#### State Properties

| Property | Type | Description |
|----------|------|-------------|
| `isLoggedIn` | `boolean` | Whether user is authenticated |
| `shouldCreateAccount` | `boolean` | Whether to show account creation flow |
| `hasCompletedOnboarding` | `boolean` | Whether user has completed onboarding |
| `isVip` | `boolean` | Whether user has VIP status |
| `user` | `User \| null` | Current user data |
| `_hasHydrated` | `boolean` | Internal hydration state |

#### Actions

**Authentication Actions:**

```typescript
// Login user
const result = await logIn("user@example.com", "password");
if (result.success) {
  console.log("User logged in:", result.user);
} else {
  console.error("Login failed:", result.error);
}

// Register new user
const registerResult = await register({
  name: "John Doe",
  email: "john@example.com",
  password: "securePassword",
  phone: "+1234567890" // optional
});

// Logout user
logOut();

// Login as VIP (demo mode)
logInAsVip();
```

**Onboarding Actions:**

```typescript
// Complete onboarding flow
completeOnboarding();

// Reset onboarding (for testing)
resetOnboarding();
```

**Settings Actions:**

```typescript
// Update call settings
updateCallSettings({
  timezone: "America/New_York",
  schedules: {
    monday: { name: "Monday", enabled: true, timeSlot: "9:00-12:00" },
    tuesday: { name: "Tuesday", enabled: false, timeSlot: "12:00-15:00" }
  }
});

// Update notification settings
updateNotificationSettings({
  lowMood: true,
  missedCalls: true,
  newTopics: false
});

// Update selected contact
updateSelectedContact({
  id: "contact_123",
  name: "Mom",
  selectedPhoneNumber: {
    id: "phone_456",
    number: "+1234567890",
    label: "Mobile"
  }
});

// Remove selected contact
removeSelectedContact();
```

### Utility Functions

```typescript
// Generate unique user ID
export function generateUserId(): string;

// Hash password for secure storage
export function hashPassword(password: string): string;
```

## Internationalization (i18n)

### useI18n Hook

Hook for managing translations and language switching.

```typescript
import { useI18n } from '@/utils/useI18n';

const MyComponent = () => {
  const { t, locale, changeLanguage } = useI18n();
  
  return (
    <View>
      <Text>{t('welcome')}</Text>
      <Button 
        title={t('switchLanguage')} 
        onPress={() => changeLanguage(locale === 'en' ? 'fr' : 'en')}
      />
    </View>
  );
};
```

#### API

| Method | Type | Description |
|--------|------|-------------|
| `t(key, params?)` | `(key: string, params?: Record<string, any>) => string` | Translate text by key |
| `locale` | `'fr' \| 'en'` | Current language code |
| `changeLanguage` | `(locale: 'fr' \| 'en') => void` | Switch language |
| `isRTL` | `boolean` | Whether current language is right-to-left |

#### Available Translation Keys

**Navigation:**
- `home`, `chats`, `settings`, `vip`

**Authentication:**
- `connection`, `registration`, `email`, `password`, `signIn`, `signUp`, `signOut`

**Common:**
- `success`, `cancel`, `save`, `delete`, `edit`, `confirm`

**Errors:**
- `pleaseFillAllFields`, `connectionFailed`, `anErrorOccurred`

### I18nProvider Context

Wrap your app with the I18nProvider for context-based translations:

```typescript
import { I18nProvider } from '@/utils/I18nContext';

export default function App() {
  return (
    <I18nProvider>
      <YourAppContent />
    </I18nProvider>
  );
}
```

## UI Components

### Core Components

#### Button Component

A customizable button with multiple themes and states.

```typescript
import { Button } from '@/components/Button';

// Basic usage
<Button title="Click me" onPress={handlePress} />

// With theme
<Button 
  title="Primary" 
  theme="primary" 
  onPress={handlePress} 
/>

// Disabled state
<Button 
  title="Loading..." 
  disabled={true} 
  onPress={handlePress} 
/>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | - | Button text (required) |
| `onPress` | `() => void` | - | Press handler |
| `theme` | `'primary' \| 'secondary' \| 'tertiary'` | `'primary'` | Visual theme |
| `disabled` | `boolean` | `false` | Disabled state |

**Themes:**
- `primary`: Blue background with white text
- `secondary`: White background with border
- `tertiary`: Transparent background

#### AppText Component

Enhanced text component with consistent styling and color management.

```typescript
import { AppText } from '@/components/AppText';

// Basic usage
<AppText>Hello World</AppText>

// With size and styling
<AppText 
  size="heading" 
  bold 
  color="systemBlue" 
  center
>
  Welcome
</AppText>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | - | Text content (required) |
| `size` | `'small' \| 'medium' \| 'large' \| 'heading'` | `'medium'` | Text size |
| `bold` | `boolean` | `false` | Bold font weight |
| `color` | `'primary' \| 'secondary' \| 'tertiary' \| 'label' \| 'systemBlue' \| 'white'` | `'primary'` | Text color |
| `center` | `boolean` | `false` | Center alignment |
| `className` | `string` | - | Additional CSS classes |

#### LanguageSelector Component

Component for language selection with native language names.

```typescript
import { LanguageSelector } from '@/components/LanguageSelector';

// Usage
<LanguageSelector />
```

**Features:**
- Displays available languages with native names
- Shows current selection with checkmark
- Automatically applies language changes
- Uses system colors for theming

### Layout Components

#### HeaderButton Component

Navigation header button with platform-specific styling.

```typescript
import { HeaderButton } from '@/components/ui/header';

<HeaderButton onPress={handlePress}>
  <Text>Done</Text>
</HeaderButton>
```

### Form Components

The app includes a comprehensive form system with platform-specific adaptations. Key components include:

- `Section`: Grouped form sections
- `Row`: Individual form rows
- `Group`: Form field groups
- `TextInput`: Enhanced text input
- `Switch`: Platform-specific switches
- `DateTimePicker`: Date/time selection

## Utility Functions

### Class Name Utilities

#### cn Function

Utility for merging Tailwind CSS classes with conflict resolution.

```typescript
import { cn } from '@/utils/cn';

// Merge classes
const className = cn(
  'bg-blue-500',
  'text-white',
  isActive && 'bg-blue-600',
  'hover:bg-blue-700'
);

// In components
<View className={cn('flex-1 p-4', customClassName)} />
```

### Authentication Utilities

#### login Function

Authenticate user with email and password.

```typescript
import { login } from '@/utils/login';

const result = await login('user@example.com', 'password');
if (result.success) {
  console.log('Login successful:', result.user);
} else {
  console.error('Login failed:', result.error);
}
```

#### register Function

Register new user account.

```typescript
import { register } from '@/utils/register';

const result = await register({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'securePassword123',
  phone: '+1234567890' // optional
});

if (result.success) {
  console.log('Registration successful');
} else {
  console.error('Registration failed:', result.error);
}
```

## API Endpoints

### Hello API

Simple example API endpoint for testing.

**Endpoint:** `GET /api/hello`

```typescript
// Response
{
  "hello": "world"
}
```

**Usage:**
```typescript
const response = await fetch('/api/hello');
const data = await response.json();
console.log(data.hello); // "world"
```

### External Authentication API

The app integrates with an external Google Apps Script for authentication.

**Base URL:** `https://script.google.com/macros/s/AKfycbxBlSRVwQfIyjDXoMBD3B0R7cmaHkBPv1IBOJS4nI3aX-lbEASF7hYyn8YPInBl1B8s/exec`

**Login Request:**
```typescript
POST /
Content-Type: text/plain;charset=utf-8

{
  "action": "login",
  "email": "user@example.com",
  "password": "hashedPassword"
}
```

**Register Request:**
```typescript
POST /
Content-Type: text/plain;charset=utf-8

{
  "action": "register",
  "name": "John Doe",
  "email": "john@example.com",
  "password": "hashedPassword",
  "phone": "+1234567890",
  "userId": "user_123456789_abc123",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

## App Structure

### Navigation Structure

The app uses Expo Router with the following structure:

```
app/
├── _layout.tsx              # Root layout with auth logic
├── (tabs)/                  # Tab navigation
│   ├── _layout.tsx         # Tab layout
│   ├── index.tsx           # Home screen
│   ├── chats.tsx           # Chat screen
│   ├── settings.tsx        # Settings screen
│   └── vip.tsx             # VIP screen
├── onboarding/             # Onboarding flow
│   ├── _layout.tsx
│   ├── index.tsx           # Welcome screen
│   └── final.tsx           # Completion screen
├── modal.tsx               # Modal screens
├── sign-in.tsx             # Login screen
├── create-account.tsx      # Registration screen
├── call-settings.tsx       # Call configuration
├── notifications-settings.tsx # Notification preferences
└── register-modal.tsx      # Registration modal
```

### Component Organization

```
components/
├── AppText.tsx             # Text component
├── Button.tsx              # Button component
├── LanguageSelector.tsx    # Language switcher
├── layout/                 # Layout components
│   ├── modal-navigator.tsx
│   ├── stack.tsx
│   └── tabs.tsx
└── ui/                     # UI primitives
    ├── form.tsx            # Form components
    ├── header.tsx          # Header components
    ├── icon-symbol.tsx     # Icon components
    └── ...
```

## Examples & Usage Patterns

### Complete Authentication Flow

```typescript
import React, { useState } from 'react';
import { View } from 'react-native';
import { useAuthStore } from '@/utils/authStore';
import { Button } from '@/components/Button';
import { AppText } from '@/components/AppText';
import { useI18n } from '@/utils/useI18n';

export function AuthExample() {
  const { logIn, register, isLoggedIn, user } = useAuthStore();
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const result = await logIn(email, password);
      if (!result.success) {
        alert(result.error);
      }
    } finally {
      setLoading(false);
    }
  };

  if (isLoggedIn) {
    return (
      <View>
        <AppText size="heading">
          {t('welcome')}, {user?.name}!
        </AppText>
      </View>
    );
  }

  return (
    <View>
      <AppText size="heading">{t('signIn')}</AppText>
      {/* TextInput components for email/password */}
      <Button 
        title={loading ? t('loading') : t('signIn')}
        onPress={handleLogin}
        disabled={loading}
      />
    </View>
  );
}
```

### Internationalization Setup

```typescript
import React from 'react';
import { View } from 'react-native';
import { I18nProvider } from '@/utils/I18nContext';
import { LanguageSelector } from '@/components/LanguageSelector';
import { AppText } from '@/components/AppText';
import { useI18n } from '@/utils/useI18n';

function MainContent() {
  const { t, locale } = useI18n();
  
  return (
    <View>
      <AppText size="heading">{t('settings')}</AppText>
      <AppText>{t('currentLanguage')}: {locale}</AppText>
      <LanguageSelector />
    </View>
  );
}

export function I18nExample() {
  return (
    <I18nProvider>
      <MainContent />
    </I18nProvider>
  );
}
```

### Settings Management

```typescript
import React from 'react';
import { View } from 'react-native';
import { useAuthStore } from '@/utils/authStore';
import { Button } from '@/components/Button';
import { AppText } from '@/components/AppText';

export function SettingsExample() {
  const { 
    user, 
    updateCallSettings, 
    updateNotificationSettings 
  } = useAuthStore();

  const handleUpdateCallSettings = () => {
    updateCallSettings({
      timezone: 'America/New_York',
      schedules: {
        monday: { 
          name: 'Monday', 
          enabled: true, 
          timeSlot: '9:00-12:00' 
        },
        tuesday: { 
          name: 'Tuesday', 
          enabled: false, 
          timeSlot: '12:00-15:00' 
        }
      }
    });
  };

  const handleUpdateNotifications = () => {
    updateNotificationSettings({
      lowMood: true,
      missedCalls: true,
      newTopics: false
    });
  };

  return (
    <View>
      <AppText size="heading">Settings</AppText>
      
      <AppText>Call Settings:</AppText>
      <AppText size="small">
        Timezone: {user?.callSettings?.timezone || 'Not set'}
      </AppText>
      <Button 
        title="Update Call Settings" 
        onPress={handleUpdateCallSettings} 
      />
      
      <AppText>Notifications:</AppText>
      <AppText size="small">
        Low Mood: {user?.notificationSettings?.lowMood ? 'On' : 'Off'}
      </AppText>
      <Button 
        title="Update Notifications" 
        onPress={handleUpdateNotifications} 
      />
    </View>
  );
}
```

### Custom Hook Pattern

```typescript
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/utils/authStore';

// Custom hook for managing user settings
export function useUserSettings() {
  const { user, updateCallSettings, updateNotificationSettings } = useAuthStore();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const saveCallSettings = (settings: CallSettings) => {
    updateCallSettings(settings);
    setHasUnsavedChanges(false);
  };

  const saveNotificationSettings = (settings: NotificationSettings) => {
    updateNotificationSettings(settings);
    setHasUnsavedChanges(false);
  };

  const markAsChanged = () => setHasUnsavedChanges(true);

  return {
    user,
    hasUnsavedChanges,
    saveCallSettings,
    saveNotificationSettings,
    markAsChanged,
    callSettings: user?.callSettings,
    notificationSettings: user?.notificationSettings
  };
}

// Usage
function SettingsScreen() {
  const { 
    hasUnsavedChanges, 
    saveCallSettings, 
    callSettings 
  } = useUserSettings();

  // Component implementation...
}
```

---

This documentation covers all the public APIs, components, and utilities in the MyCompanion app. For additional implementation details, refer to the source code in the `src/` directory.