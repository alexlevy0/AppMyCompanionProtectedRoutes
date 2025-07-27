# MyCompanion - Getting Started Guide

This guide will help you understand and use the MyCompanion application's APIs, components, and patterns effectively.

## Quick Start

### Prerequisites

- Node.js 18+ or Bun
- Expo CLI
- iOS Simulator or Android Emulator (for mobile development)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd mycompanion

# Install dependencies
bun install
# or
npm install

# Start the development server
bun start
# or
npm start
```

### Project Structure

```
src/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation
│   ├── onboarding/        # Onboarding flow
│   └── api/               # API routes
├── components/            # Reusable UI components
│   ├── ui/               # Low-level UI primitives
│   └── layout/           # Layout components
├── types/                # TypeScript type definitions
└── utils/                # Utility functions and stores
    ├── authStore.ts      # Authentication state
    ├── i18n.ts          # Internationalization
    └── useI18n.ts       # i18n hook
```

## Core Concepts

### 1. Authentication & State Management

MyCompanion uses Zustand for state management with persistent storage.

#### Basic Authentication Flow

```typescript
import { useAuthStore } from '@/utils/authStore';
import { useI18n } from '@/utils/useI18n';

function LoginExample() {
  const { logIn, isLoggedIn, user } = useAuthStore();
  const { t } = useI18n();

  const handleLogin = async () => {
    const result = await logIn('user@example.com', 'password');
    
    if (result.success) {
      // User is now logged in
      console.log('Welcome', result.user?.name);
    } else {
      // Handle login error
      alert(result.error);
    }
  };

  if (isLoggedIn) {
    return <Text>Welcome back, {user?.name}!</Text>;
  }

  return (
    <Button 
      title={t('signIn')} 
      onPress={handleLogin} 
    />
  );
}
```

#### User Registration

```typescript
function RegisterExample() {
  const { register } = useAuthStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });

  const handleRegister = async () => {
    const result = await register(formData);
    
    if (result.success) {
      // Registration successful, user is now logged in
      console.log('Registration successful');
    } else {
      alert(result.error);
    }
  };

  return (
    <View>
      {/* Form inputs */}
      <Button title="Register" onPress={handleRegister} />
    </View>
  );
}
```

### 2. Internationalization

The app supports French and English with automatic language detection.

#### Using Translations

```typescript
import { useI18n } from '@/utils/useI18n';

function MultilingualComponent() {
  const { t, locale, changeLanguage } = useI18n();

  return (
    <View>
      <AppText>{t('welcome')}</AppText>
      <AppText>{t('currentLanguage')}: {locale}</AppText>
      
      <Button 
        title={t('switchLanguage')}
        onPress={() => changeLanguage(locale === 'en' ? 'fr' : 'en')}
      />
    </View>
  );
}
```

#### Adding New Translations

Edit `src/utils/i18n.ts` to add new translation keys:

```typescript
const translations = {
  fr: {
    // Add French translations
    myNewKey: 'Mon nouveau texte',
    withParameter: 'Bonjour {{name}}'
  },
  en: {
    // Add English translations
    myNewKey: 'My new text',
    withParameter: 'Hello {{name}}'
  }
};
```

Use with parameters:

```typescript
const { t } = useI18n();
const greeting = t('withParameter', { name: 'John' });
```

### 3. Component Usage

#### Basic UI Components

```typescript
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';

function BasicExample() {
  return (
    <View>
      {/* Text with different sizes and colors */}
      <AppText size="heading" bold color="primary">
        Main Title
      </AppText>
      
      <AppText color="secondary">
        Subtitle or description
      </AppText>

      {/* Buttons with different themes */}
      <Button 
        title="Primary Action" 
        theme="primary"
        onPress={() => console.log('Primary pressed')}
      />
      
      <Button 
        title="Secondary Action" 
        theme="secondary"
        onPress={() => console.log('Secondary pressed')}
      />
    </View>
  );
}
```

#### Form Components

```typescript
import { Section, Row, Group } from '@/components/ui/form';

function SettingsForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [notifications, setNotifications] = useState(false);

  return (
    <Section>
      <Row>
        <AppText size="heading">Profile Settings</AppText>
      </Row>
      
      <Group>
        <Row>
          <AppText>Name</AppText>
          <TextInput 
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
          />
        </Row>
        
        <Row>
          <AppText>Email</AppText>
          <TextInput 
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
          />
        </Row>
      </Group>

      <Row>
        <AppText>Enable Notifications</AppText>
        <Switch 
          value={notifications}
          onValueChange={setNotifications}
        />
      </Row>
      
      <Row>
        <Button 
          title="Save Changes"
          onPress={handleSave}
        />
      </Row>
    </Section>
  );
}
```

## Common Patterns

### 1. Settings Management

```typescript
function UserSettingsScreen() {
  const { 
    user, 
    updateCallSettings, 
    updateNotificationSettings 
  } = useAuthStore();

  const handleCallSettingsUpdate = (timezone: string) => {
    updateCallSettings({
      timezone,
      schedules: {
        monday: { name: 'Monday', enabled: true, timeSlot: '9:00-12:00' },
        tuesday: { name: 'Tuesday', enabled: true, timeSlot: '9:00-12:00' },
        // ... other days
      }
    });
  };

  const handleNotificationUpdate = (settings: NotificationSettings) => {
    updateNotificationSettings(settings);
  };

  return (
    <Section>
      <Row>
        <AppText size="heading">Call Settings</AppText>
      </Row>
      
      <Row>
        <AppText>Timezone</AppText>
        <AppText color="secondary">
          {user?.callSettings?.timezone || 'Not set'}
        </AppText>
      </Row>

      <Row>
        <Button 
          title="Update Timezone"
          onPress={() => handleCallSettingsUpdate('America/New_York')}
        />
      </Row>

      <Row>
        <AppText size="heading">Notifications</AppText>
      </Row>

      <Row>
        <AppText>Low Mood Alerts</AppText>
        <Switch 
          value={user?.notificationSettings?.lowMood ?? false}
          onValueChange={(value) => 
            handleNotificationUpdate({
              ...user?.notificationSettings,
              lowMood: value
            } as NotificationSettings)
          }
        />
      </Row>
    </Section>
  );
}
```

### 2. Contact Management

```typescript
function ContactSelector() {
  const { user, updateSelectedContact, removeSelectedContact } = useAuthStore();
  const [contacts, setContacts] = useState<Contact[]>([]);

  const selectContact = (contact: Contact) => {
    const selectedContact: SelectedContact = {
      id: contact.id,
      name: contact.name,
      phoneNumbers: contact.phoneNumbers,
      selectedPhoneNumber: contact.phoneNumbers?.[0] // Default to first number
    };
    
    updateSelectedContact(selectedContact);
  };

  const clearContact = () => {
    removeSelectedContact();
  };

  return (
    <Section>
      <Row>
        <AppText size="heading">Emergency Contact</AppText>
      </Row>

      {user?.selectedContact ? (
        <Group>
          <Row>
            <AppText bold>{user.selectedContact.name}</AppText>
            <AppText color="secondary">
              {user.selectedContact.selectedPhoneNumber?.number}
            </AppText>
          </Row>
          <Row>
            <Button 
              title="Remove Contact"
              theme="secondary"
              onPress={clearContact}
            />
          </Row>
        </Group>
      ) : (
        <Row>
          <AppText color="secondary">No contact selected</AppText>
          <Button 
            title="Select Contact"
            onPress={() => {/* Open contact picker */}}
          />
        </Row>
      )}
    </Section>
  );
}
```

### 3. Language Switching

```typescript
function LanguageSettings() {
  const { locale } = useI18n();

  return (
    <Section>
      <Row>
        <AppText size="heading">Language Preferences</AppText>
      </Row>
      
      <Row>
        <AppText>Current Language: {locale === 'fr' ? 'Français' : 'English'}</AppText>
      </Row>
      
      <Row>
        <LanguageSelector />
      </Row>
    </Section>
  );
}
```

### 4. Loading States

```typescript
function LoadingExample() {
  const [loading, setLoading] = useState(false);
  const { t } = useI18n();

  const handleAction = async () => {
    setLoading(true);
    try {
      // Perform async operation
      await someAsyncOperation();
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <Button 
        title={loading ? t('loading') : t('submit')}
        disabled={loading}
        onPress={handleAction}
      />
      
      {loading && (
        <AppText color="secondary" center>
          {t('pleaseWait')}
        </AppText>
      )}
    </View>
  );
}
```

## Advanced Usage

### 1. Custom Hooks

Create reusable hooks for common functionality:

```typescript
// Custom hook for form validation
function useFormValidation(initialValues: any, validationRules: any) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    // Validation logic here
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const setValue = (field: string, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return { values, errors, setValue, validate };
}

// Usage
function LoginForm() {
  const { values, errors, setValue, validate } = useFormValidation(
    { email: '', password: '' },
    { email: 'required|email', password: 'required|min:6' }
  );

  const handleSubmit = () => {
    if (validate()) {
      // Submit form
    }
  };

  return (
    <Section>
      <Row>
        <TextInput 
          value={values.email}
          onChangeText={(text) => setValue('email', text)}
          placeholder="Email"
        />
        {errors.email && (
          <AppText color="red" size="small">{errors.email}</AppText>
        )}
      </Row>
      
      <Row>
        <Button title="Submit" onPress={handleSubmit} />
      </Row>
    </Section>
  );
}
```

### 2. Navigation Patterns

```typescript
import { router } from 'expo-router';

function NavigationExample() {
  const handleNavigateToSettings = () => {
    router.push('/settings');
  };

  const handleNavigateWithParams = () => {
    router.push({
      pathname: '/user/[id]',
      params: { id: '123' }
    });
  };

  const handleModal = () => {
    router.push('/modal');
  };

  return (
    <Section>
      <Row>
        <Button title="Go to Settings" onPress={handleNavigateToSettings} />
      </Row>
      <Row>
        <Button title="View User" onPress={handleNavigateWithParams} />
      </Row>
      <Row>
        <Button title="Open Modal" onPress={handleModal} />
      </Row>
    </Section>
  );
}
```

### 3. Error Handling

```typescript
function ErrorHandlingExample() {
  const [error, setError] = useState<string | null>(null);
  const { t } = useI18n();

  const handleApiCall = async () => {
    try {
      setError(null);
      const result = await someApiCall();
      // Handle success
    } catch (err) {
      setError(t('anErrorOccurred'));
      console.error('API Error:', err);
    }
  };

  return (
    <Section>
      {error && (
        <Row>
          <AppText color="red">{error}</AppText>
          <Button 
            title={t('retry')}
            theme="secondary"
            onPress={handleApiCall}
          />
        </Row>
      )}
      
      <Row>
        <Button title="Make API Call" onPress={handleApiCall} />
      </Row>
    </Section>
  );
}
```

## Testing Components

### Unit Testing Example

```typescript
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '@/components/Button';

describe('Button Component', () => {
  test('renders correctly', () => {
    const { getByText } = render(
      <Button title="Test Button" onPress={() => {}} />
    );
    
    expect(getByText('Test Button')).toBeTruthy();
  });

  test('calls onPress when pressed', () => {
    const mockPress = jest.fn();
    const { getByText } = render(
      <Button title="Test Button" onPress={mockPress} />
    );
    
    fireEvent.press(getByText('Test Button'));
    expect(mockPress).toHaveBeenCalled();
  });

  test('applies correct theme styles', () => {
    const { getByText } = render(
      <Button title="Primary" theme="primary" onPress={() => {}} />
    );
    
    const button = getByText('Primary').parent;
    // Test for primary theme styles
  });
});
```

## Performance Tips

1. **Use React.memo for expensive components:**
```typescript
const ExpensiveComponent = React.memo(function ExpensiveComponent({ data }) {
  // Expensive rendering logic
  return <View>{/* ... */}</View>;
});
```

2. **Optimize re-renders with useCallback:**
```typescript
function ParentComponent() {
  const handlePress = useCallback(() => {
    // Handle press logic
  }, []);

  return <Button title="Press me" onPress={handlePress} />;
}
```

3. **Use Zustand selectors to prevent unnecessary re-renders:**
```typescript
// Instead of using the entire store
const store = useAuthStore();

// Use specific selectors
const isLoggedIn = useAuthStore(state => state.isLoggedIn);
const userName = useAuthStore(state => state.user?.name);
```

## Troubleshooting

### Common Issues

1. **Android getScrollableNode errors:** The app includes fixes for these in the form components. If you encounter them in new components, use regular View/ScrollView instead of Animated versions.

2. **i18n not updating:** Make sure components are wrapped in `I18nProvider` and using the `useI18n` hook correctly.

3. **State not persisting:** Check that Zustand store is properly configured with persistence middleware.

4. **Styling issues:** Ensure you're using the `cn` utility for class merging and following the established design patterns.

### Getting Help

- Check the component reference documentation
- Look at existing screen implementations in `src/app/`
- Review the type definitions in `src/types/`
- Check console logs for detailed error messages

---

This guide covers the essential patterns and APIs for working with MyCompanion. For more specific implementation details, refer to the API documentation and component reference guides.