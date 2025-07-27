# MyCompanion Component Reference

This document provides detailed reference information for all components in the MyCompanion application.

## Core UI Components

### Button Component

**Location:** `src/components/Button.tsx`

A versatile button component with multiple visual themes and states.

#### Interface

```typescript
type ButtonProps = {
  title: string;
  onPress?: () => void;
  theme?: "primary" | "secondary" | "tertiary";
  disabled?: boolean;
} & PressableProps;
```

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `title` | `string` | ✅ | - | Button text content |
| `onPress` | `() => void` | ❌ | `undefined` | Function called when button is pressed |
| `theme` | `"primary" \| "secondary" \| "tertiary"` | ❌ | `"primary"` | Visual theme variant |
| `disabled` | `boolean` | ❌ | `false` | Whether button is disabled |
| `...rest` | `PressableProps` | ❌ | - | Additional React Native Pressable props |

#### Themes

- **Primary:** Blue background (`#007AFF`) with white text
- **Secondary:** White background with gray border
- **Tertiary:** Transparent background with gray text

#### Examples

```typescript
import { Button } from '@/components/Button';

// Basic button
<Button title="Submit" onPress={() => console.log('Pressed')} />

// Secondary theme
<Button 
  title="Cancel" 
  theme="secondary" 
  onPress={handleCancel} 
/>

// Disabled state
<Button 
  title="Loading..." 
  disabled={true} 
  onPress={handleSubmit} 
/>

// With additional props
<Button 
  title="Custom" 
  onPress={handlePress}
  accessibilityLabel="Custom button"
  testID="custom-button"
/>
```

### AppText Component

**Location:** `src/components/AppText.tsx`

Enhanced text component with consistent styling and Apple design system colors.

#### Interface

```typescript
type AppTextProps = {
  children: React.ReactNode;
  size?: "small" | "medium" | "large" | "heading";
  bold?: boolean;
  color?: "primary" | "secondary" | "tertiary" | "label" | "systemBlue" | "white";
  center?: boolean;
  className?: string;
};
```

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `children` | `React.ReactNode` | ✅ | - | Text content to display |
| `size` | `"small" \| "medium" \| "large" \| "heading"` | ❌ | `"medium"` | Text size variant |
| `bold` | `boolean` | ❌ | `false` | Whether to use bold font weight |
| `color` | `"primary" \| "secondary" \| "tertiary" \| "label" \| "systemBlue" \| "white"` | ❌ | `"primary"` | Text color using Apple system colors |
| `center` | `boolean` | ❌ | `false` | Whether to center-align text |
| `className` | `string` | ❌ | - | Additional Tailwind CSS classes |

#### Color System

- **primary/label:** Standard text color
- **secondary:** Secondary text color (lighter)
- **tertiary:** Tertiary text color (lightest)
- **systemBlue:** Apple system blue color
- **white:** White text color

#### Examples

```typescript
import { AppText } from '@/components/AppText';

// Basic text
<AppText>Hello World</AppText>

// Heading with center alignment
<AppText size="heading" bold center>
  Welcome to MyCompanion
</AppText>

// Secondary color text
<AppText color="secondary" size="small">
  Last updated: 2 hours ago
</AppText>

// Custom styling
<AppText 
  color="systemBlue" 
  bold 
  className="mt-4"
>
  Learn More
</AppText>
```

### LanguageSelector Component

**Location:** `src/components/LanguageSelector.tsx`

Language selection component with native language names and visual feedback.

#### Interface

```typescript
interface LanguageOption {
  code: 'fr' | 'en';
  name: string;
  nativeName: string;
}

export const LanguageSelector: React.FC = () => { ... }
```

#### Features

- Displays French and English language options
- Shows native language names (Français, English)
- Visual indication of current selection
- Automatic language switching
- Uses Apple system colors

#### Examples

```typescript
import { LanguageSelector } from '@/components/LanguageSelector';

// Simple usage
<LanguageSelector />

// In a settings screen
<Section>
  <Row>
    <AppText>Language Preferences</AppText>
  </Row>
  <Row>
    <LanguageSelector />
  </Row>
</Section>
```

### Test Components

#### TranslationTest Component

**Location:** `src/components/TranslationTest.tsx`

Component for testing translation functionality with various text examples.

#### DaysOfWeekTest Component

**Location:** `src/components/DaysOfWeekTest.tsx`

Component for testing day-of-week translations and formatting.

## Layout Components

### Stack Component

**Location:** `src/components/layout/stack.tsx`

Stack navigator wrapper with consistent styling.

#### Features

- Platform-specific header styling
- Consistent navigation animations
- Integration with Expo Router

### Tabs Component

**Location:** `src/components/layout/tabs.tsx`

Tab navigator with custom styling and icons.

#### Features

- Custom tab bar styling
- Platform-specific adaptations
- Icon integration with IconSymbol component

### Modal Navigator

**Location:** `src/components/layout/modal-navigator.tsx` (Native)
**Location:** `src/components/layout/modal-navigator.web.tsx` (Web)

Platform-specific modal navigation implementations.

#### Features

- Platform-optimized modal presentation
- Web-specific modal styling and interactions
- Integration with Expo Router modal system

## UI Primitives

### Form Components

**Location:** `src/components/ui/form.tsx`

Comprehensive form system with platform adaptations and Android-specific fixes.

#### Key Components

##### Section
Container for grouping related form elements.

```typescript
<Section>
  <Row>
    <AppText>User Information</AppText>
  </Row>
  <Row>
    <TextInput placeholder="Name" />
  </Row>
</Section>
```

##### Row
Individual form row with consistent spacing.

```typescript
<Row>
  <AppText>Email Address</AppText>
  <TextInput 
    placeholder="Enter your email"
    keyboardType="email-address"
  />
</Row>
```

##### Group
Form field grouping with validation styling.

```typescript
<Group>
  <Label>Password</Label>
  <TextInput 
    secureTextEntry 
    placeholder="Enter password"
  />
  <ErrorText>Password is required</ErrorText>
</Group>
```

#### Android Compatibility

The form system includes specific fixes for Android:

- Uses regular ScrollView instead of Animated.ScrollView
- Simplified style merging for better performance
- Error boundaries around complex components
- Safe ref handling to prevent getScrollableNode errors

### Header Components

**Location:** `src/components/ui/header.tsx`

Navigation header button with platform-specific styling.

#### HeaderButton Component

```typescript
import { HeaderButton } from '@/components/ui/header';

// In navigation options
<Stack.Screen 
  options={{
    headerRight: () => (
      <HeaderButton onPress={handleSave}>
        <Text>Save</Text>
      </HeaderButton>
    )
  }}
/>
```

#### Features

- Platform-specific ripple effects
- Proper hit slop for touch targets
- Accessibility support
- Consistent styling across platforms

### Icon Components

#### IconSymbol Component

**Location:** `src/components/ui/icon-symbol.tsx` (General)
**Location:** `src/components/ui/icon-symbol.ios.tsx` (iOS-specific)

Platform-aware icon system using SF Symbols on iOS and fallbacks on other platforms.

```typescript
import { IconSymbol } from '@/components/ui/icon-symbol';

// Basic usage
<IconSymbol name="person.circle" size={24} />

// With color and weight
<IconSymbol 
  name="heart.fill" 
  size={20} 
  color="red" 
  weight="bold" 
/>
```

#### IconSymbolFallback Component

**Location:** `src/components/ui/icon-symbol-fallback.tsx`

Fallback icon component for non-iOS platforms with extensive icon mapping.

### Image Components

#### Img Component

**Location:** `src/components/ui/img.tsx`

Enhanced image component with optimizations.

```typescript
import { Image } from '@/components/ui/img';

<Image 
  source={{ uri: 'https://example.com/image.jpg' }}
  style={{ width: 100, height: 100 }}
  placeholder="Loading..."
/>
```

### Switch Components

**Location:** `src/components/ui/switch.tsx` (Native)
**Location:** `src/components/ui/switch.web.tsx` (Web)

Platform-specific switch implementations.

```typescript
import { Switch } from '@/components/ui/switch';

<Switch 
  value={isEnabled}
  onValueChange={setIsEnabled}
  thumbColor="#007AFF"
/>
```

### Utility Components

#### Rounded Component

**Location:** `src/components/ui/rounded.tsx`

Component for creating rounded containers with consistent styling.

#### Segments Component

**Location:** `src/components/ui/segments.tsx`

Segmented control component for multiple choice selections.

```typescript
import { Segments } from '@/components/ui/segments';

<Segments
  options={['Option 1', 'Option 2', 'Option 3']}
  selectedIndex={selectedIndex}
  onSelectionChange={setSelectedIndex}
/>
```

### Tab Bar Components

#### TabBarBackground Component

**Location:** `src/components/ui/tab-bar-background.tsx` (Native)
**Location:** `src/components/ui/tab-bar-background.ios.tsx` (iOS-specific)

Platform-specific tab bar background styling with blur effects on iOS.

## Usage Patterns

### Component Composition

```typescript
import { Section, Row, Group } from '@/components/ui/form';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';

function SettingsForm() {
  return (
    <Section>
      <Row>
        <AppText size="heading">Account Settings</AppText>
      </Row>
      
      <Group>
        <AppText color="secondary">Profile Information</AppText>
        <Row>
          <TextInput placeholder="Display Name" />
        </Row>
        <Row>
          <TextInput 
            placeholder="Email" 
            keyboardType="email-address" 
          />
        </Row>
      </Group>
      
      <Row>
        <Button 
          title="Save Changes" 
          onPress={handleSave}
          theme="primary"
        />
      </Row>
    </Section>
  );
}
```

### Platform-Specific Components

```typescript
// Use platform-specific components when needed
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Switch } from '@/components/ui/switch';

function PlatformAwareComponent() {
  return (
    <Row>
      <IconSymbol name="gear" size={20} />
      <AppText>Enable Notifications</AppText>
      <Switch 
        value={notificationsEnabled}
        onValueChange={setNotificationsEnabled}
      />
    </Row>
  );
}
```

### Theming and Styling

```typescript
// Use consistent theming
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';

function ThemedComponent() {
  return (
    <Section>
      <AppText color="primary" size="heading">
        Primary Heading
      </AppText>
      <AppText color="secondary">
        Secondary description text
      </AppText>
      <Button theme="primary" title="Primary Action" />
      <Button theme="secondary" title="Secondary Action" />
    </Section>
  );
}
```

---

This component reference provides detailed information about each component's API, props, and usage patterns. All components are designed to work seamlessly together and provide a consistent user experience across platforms.