import { View, TextInput, Alert } from "react-native";
import { AppText } from "@/components/AppText";
import { Link } from "expo-router";
import { Button } from "@/components/Button";
import { useAuthStoreObserver } from "@/utils/authStoreLegend";
import { useState } from "react";
import { useI18n } from "@/utils/I18nContext";
import * as AC from "@bacons/apple-colors";
import { router } from "expo-router";
import { observer } from '@legendapp/state/react';

export default observer(function SignInScreen() {
  const { logIn, logInAsVip, isLoggedIn } = useAuthStoreObserver();
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t('error'), t('pleaseFillAllFields'));
      return;
    }

    setIsLoading(true);
    try {
      console.log('Attempting login with:', email);
      const result = await logIn(email, password);
      console.log('Login result:', result);

      if (result.success) {
        console.log('Login successful, redirecting...');
        console.log('isLoggedIn state:', isLoggedIn);
        
        // Redirection immédiate sans alert
        console.log('Forcing immediate redirect to tabs...');
        try {
          router.push('/(tabs)');
        } catch (error) {
          console.error('Router error:', error);
          // Fallback: essayer avec replace
          router.replace('/(tabs)');
        }
        
        // Alert après redirection
        setTimeout(() => {
          Alert.alert(t('success'), t('connectionSuccessful'));
        }, 100);
      } else {
        Alert.alert(t('error'), result.error || t('connectionFailed'));
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert(t('error'), t('anErrorOccurred'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View 
      className="justify-center flex-1 p-4"
      style={{ backgroundColor: AC.systemGroupedBackground }}
    >
      <AppText center size="heading" className="mb-8">
        {t('connection')}
      </AppText>

      <View className="space-y-4 mb-6">
        <View>
          <AppText className="mb-2">{t('email')}</AppText>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: AC.separator,
              borderRadius: 8,
              padding: 12,
              backgroundColor: AC.secondarySystemGroupedBackground,
              color: AC.label,
            }}
            placeholder={`Entrez votre ${t('email').toLowerCase()}`}
            placeholderTextColor={AC.tertiaryLabel}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View>
          <AppText className="mb-2">{t('password')}</AppText>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: AC.separator,
              borderRadius: 8,
              padding: 12,
              backgroundColor: AC.secondarySystemGroupedBackground,
              color: AC.label,
            }}
            placeholder={`Entrez votre ${t('password').toLowerCase()}`}
            placeholderTextColor={AC.tertiaryLabel}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>

      <Button
        title={isLoading ? t('sending') : t('signIn')}
        onPress={handleLogin}
        disabled={isLoading}
      />

      <View className="mt-4 space-y-2">
        <Link asChild href="/register-modal">
          <Button title={t('signUp')} theme="secondary" />
        </Link>
        <Button
          title="Test VIP Login"
          onPress={() => {
            console.log('Testing VIP login...');
            logInAsVip();
            setTimeout(() => {
              console.log('VIP login - forcing redirect...');
              router.push('/(tabs)');
            }, 100);
          }}
          theme="secondary"
        />
      </View>

      {/* <Link asChild push href="/modal" className="mt-4">
        <Button title="Open modal (disabled)" theme="secondary" />
      </Link> */}
    </View>
  );
});
