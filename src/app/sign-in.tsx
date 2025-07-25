import { View, TextInput, Alert } from "react-native";
import { AppText } from "@/components/AppText";
import { Link } from "expo-router";
import { Button } from "@/components/Button";
import { useAuthStore } from "@/utils/authStore";
import { useState } from "react";
import { useI18n } from "@/utils/I18nContext";

export default function SignInScreen() {
  const { logIn, logInAsVip } = useAuthStore();
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(i18n.t('error'), i18n.t('pleaseFillAllFields'));
      return;
    }

    setIsLoading(true);
    try {
      const result = await logIn(email, password);

      if (result.success) {
        Alert.alert(i18n.t('success'), i18n.t('connectionSuccessful'));
      } else {
        Alert.alert(i18n.t('error'), result.error || i18n.t('connectionFailed'));
      }
    } catch (error) {
      Alert.alert(i18n.t('error'), i18n.t('anErrorOccurred'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="justify-center flex-1 p-4">
      <AppText center size="heading" className="mb-8">
        {i18n.t('connection')}
      </AppText>

      <View className="space-y-4 mb-6">
        <View>
          <AppText className="mb-2">{i18n.t('email')}</AppText>
          <TextInput
            className="border border-gray-300 rounded-lg p-3 bg-white"
            placeholder={`Entrez votre ${i18n.t('email').toLowerCase()}`}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View>
          <AppText className="mb-2">{i18n.t('password')}</AppText>
          <TextInput
            className="border border-gray-300 rounded-lg p-3 bg-white"
            placeholder={`Entrez votre ${i18n.t('password').toLowerCase()}`}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>

      <Button
        title={isLoading ? i18n.t('sending') : i18n.t('signIn')}
        onPress={handleLogin}
        disabled={isLoading}
      />

      <View className="mt-4 space-y-2">
        <Link asChild href="/register-modal">
          <Button title={i18n.t('signUp')} theme="secondary" />
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
