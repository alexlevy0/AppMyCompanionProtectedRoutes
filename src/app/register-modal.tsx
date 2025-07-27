import { View, TextInput, Alert, ScrollView, Pressable, KeyboardAvoidingView, Platform } from "react-native";
import { AppText } from "@/components/AppText";
import { Button } from "@/components/Button";
import { useAuthStore } from "@/utils/authStore";
import { useState } from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RegisterModal() {
  const { register } = useAuthStore();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Le nom est requis";
    }

    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Format d'email invalide";
    }

    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis";
    } else if (formData.password.length < 6) {
      newErrors.password = "Minimum 6 caractères";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirmation requise";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined,
      });

      if (result.success) {
        Alert.alert(
          "Succès",
          "Inscription réussie ! Vous êtes maintenant connecté.",
          [
            {
              text: "OK",
              onPress: () => router.replace("/(tabs)"),
            },
          ],
        );
      } else {
        Alert.alert("Erreur", result.error || "Échec de l'inscription");
      }
    } catch (error) {
      Alert.alert("Erreur", "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const renderInput = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    placeholder: string,
    error?: string,
    keyboardType?: "default" | "email-address" | "phone-pad",
    isPassword?: boolean,
    showPasswordToggle?: boolean,
    isPasswordVisible?: boolean,
    onTogglePassword?: () => void,
    required?: boolean
  ) => (
    <View className="mb-5">
      <AppText className="mb-2 text-gray-700 font-medium">
        {label} {required && <AppText className="text-red-500">*</AppText>}
      </AppText>
      <View className="relative">
        <TextInput
          className={`border-2 rounded-xl px-4 py-4 bg-gray-50 text-base ${
            error ? "border-red-400" : "border-gray-200 focus:border-blue-500"
          } ${isPassword && showPasswordToggle ? "pr-12" : ""}`}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          secureTextEntry={isPassword && !isPasswordVisible}
          autoCapitalize={isPassword ? "none" : keyboardType === "email-address" ? "none" : "words"}
          autoCorrect={false}
        />
        {isPassword && showPasswordToggle && (
          <Pressable
            onPress={onTogglePassword}
            className="absolute right-4 top-4"
          >
            <Ionicons
              name={isPasswordVisible ? "eye-off" : "eye"}
              size={24}
              color="#6B7280"
            />
          </Pressable>
        )}
      </View>
      {error && (
        <AppText className="text-red-500 text-sm mt-1">{error}</AppText>
      )}
    </View>
  );

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
          <View className="p-6 flex-1">
            {/* Header */}
            <View className="mb-8">
              <AppText size="heading" className="text-gray-900 font-bold mb-2">
                Créer un compte
              </AppText>
              <AppText className="text-gray-600">
                Rejoignez-nous et commencez votre aventure
              </AppText>
            </View>

            {/* Form */}
            <View className="flex-1">
              {renderInput(
                "Nom complet",
                formData.name,
                (text) => setFormData({ ...formData, name: text }),
                "John Doe",
                errors.name,
                "default",
                false,
                false,
                false,
                undefined,
                true
              )}

              {renderInput(
                "Email",
                formData.email,
                (text) => setFormData({ ...formData, email: text }),
                "john@example.com",
                errors.email,
                "email-address",
                false,
                false,
                false,
                undefined,
                true
              )}

              {renderInput(
                "Téléphone",
                formData.phone,
                (text) => setFormData({ ...formData, phone: text }),
                "+33 6 12 34 56 78",
                errors.phone,
                "phone-pad"
              )}

              {renderInput(
                "Mot de passe",
                formData.password,
                (text) => setFormData({ ...formData, password: text }),
                "••••••••",
                errors.password,
                "default",
                true,
                true,
                showPassword,
                () => setShowPassword(!showPassword),
                true
              )}

              {renderInput(
                "Confirmer le mot de passe",
                formData.confirmPassword,
                (text) => setFormData({ ...formData, confirmPassword: text }),
                "••••••••",
                errors.confirmPassword,
                "default",
                true,
                true,
                showConfirmPassword,
                () => setShowConfirmPassword(!showConfirmPassword),
                true
              )}

              {/* Submit Button */}
              <View className="mt-6">
                <Pressable
                  onPress={handleRegister}
                  disabled={isLoading}
                  className={`bg-blue-600 rounded-xl py-4 px-6 ${
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
                    {isLoading ? "Inscription en cours..." : "S'inscrire"}
                  </AppText>
                </Pressable>
              </View>

              {/* Terms */}
              <View className="mt-6 px-4">
                <AppText center className="text-gray-500 text-sm leading-5">
                  En créant un compte, vous acceptez nos{" "}
                  <AppText className="text-blue-600 underline">
                    conditions d'utilisation
                  </AppText>{" "}
                  et notre{" "}
                  <AppText className="text-blue-600 underline">
                    politique de confidentialité
                  </AppText>
                </AppText>
              </View>

              {/* Sign In Link */}
              <View className="mt-8 mb-4">
                <Pressable
                  onPress={() => router.push("/sign-in")}
                  className="py-2"
                >
                  <AppText center className="text-gray-600">
                    Déjà un compte ?{" "}
                    <AppText className="text-blue-600 font-semibold">
                      Se connecter
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