import { View, TextInput, Alert } from "react-native";
import { AppText } from "@/components/AppText";
import { Link } from "expo-router";
import { Button } from "@/components/Button";
import { useAuthStore } from "@/utils/authStore";
import { useState } from "react";
import { useI18n } from "@/utils/I18nContext";
import * as AC from "@bacons/apple-colors";

export default function SignInScreen() {
  const { logIn, logInAsVip } = useAuthStore();
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
      const result = await logIn(email, password);

      if (result.success) {
        Alert.alert(t('success'), t('connectionSuccessful'));
      } else {
        Alert.alert(t('error'), result.error || t('connectionFailed'));
      }
    } catch (error) {
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
        {/* <Button
          title="Sign in as VIP 👑"
          onPress={logInAsVip}
          theme="secondary"
        /> */}
      </View>

      {/* <Link asChild push href="/modal" className="mt-4">
        <Button title="Open modal (disabled)" theme="secondary" />
      </Link> */}
    </View>
  );
}
