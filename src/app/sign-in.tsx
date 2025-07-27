import { View, TextInput, Alert, Pressable, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { AppText } from "@/components/AppText";
import { Link, router } from "expo-router";
import { Button } from "@/components/Button";
import { useAuthStore } from "@/utils/authStore";
import { useState } from "react";
import { useI18n } from "@/utils/I18nContext";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignInScreen() {
  const { logIn, logInAsVip } = useAuthStore();
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = t('emailRequired') || "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = t('invalidEmailFormat') || "Format d'email invalide";
    }

    if (!password) {
      newErrors.password = t('passwordRequired') || "Le mot de passe est requis";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
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
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="p-6 flex-1 justify-center">
            {/* Header */}
            <View className="mb-10">
              <AppText size="heading" className="text-gray-900 font-bold mb-2 text-center">
                {t('connection')}
              </AppText>
              <AppText className="text-gray-600 text-center">
                {t('welcomeBack') || "Bienvenue ! Connectez-vous pour continuer"}
              </AppText>
            </View>

            {/* Form */}
            <View>
              {/* Email Input */}
              <View className="mb-5">
                <AppText className="mb-2 text-gray-700 font-medium">
                  {t('email')}
                </AppText>
                <TextInput
                  className={`border-2 rounded-xl px-4 py-4 bg-gray-50 text-base ${
                    errors.email ? "border-red-400" : "border-gray-200 focus:border-blue-500"
                  }`}
                  placeholder="john@example.com"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {errors.email && (
                  <AppText className="text-red-500 text-sm mt-1">{errors.email}</AppText>
                )}
              </View>

              {/* Password Input */}
              <View className="mb-5">
                <AppText className="mb-2 text-gray-700 font-medium">
                  {t('password')}
                </AppText>
                <View className="relative">
                  <TextInput
                    className={`border-2 rounded-xl px-4 py-4 bg-gray-50 text-base pr-12 ${
                      errors.password ? "border-red-400" : "border-gray-200 focus:border-blue-500"
                    }`}
                    placeholder="••••••••"
                    placeholderTextColor="#9CA3AF"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-4"
                  >
                    <Ionicons
                      name={showPassword ? "eye-off" : "eye"}
                      size={24}
                      color="#6B7280"
                    />
                  </Pressable>
                </View>
                {errors.password && (
                  <AppText className="text-red-500 text-sm mt-1">{errors.password}</AppText>
                )}
              </View>

              {/* Forgot Password Link */}
              <Pressable className="mb-6">
                <AppText className="text-blue-600 text-right font-medium">
                  {t('forgotPassword') || "Mot de passe oublié ?"}
                </AppText>
              </Pressable>

              {/* Submit Button */}
              <Pressable
                onPress={handleLogin}
                disabled={isLoading}
                className={`bg-blue-600 rounded-xl py-4 px-6 mb-4 ${
                  isLoading ? "opacity-70" : ""
                }`}
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <AppText className="text-white text-center font-semibold text-lg">
                  {isLoading ? t('sending') : t('signIn')}
                </AppText>
              </Pressable>

              {/* Sign Up Link */}
              <View className="mt-6">
                <Pressable
                  onPress={() => router.push("/register-modal")}
                  className="py-2"
                >
                  <AppText center className="text-gray-600">
                    {t('noAccount') || "Pas encore de compte ?"}{" "}
                    <AppText className="text-blue-600 font-semibold">
                      {t('signUp')}
                    </AppText>
                  </AppText>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
