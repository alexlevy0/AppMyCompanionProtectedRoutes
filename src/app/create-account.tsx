import { View, TextInput, Alert, ScrollView } from "react-native";
import { AppText } from "@/components/AppText";
import { Button } from "@/components/Button";
import { useAuthStoreObserver } from "@/utils/authStoreLegend";
import { useState } from "react";
import { router } from "expo-router";
import { useI18n } from "@/utils/I18nContext";
import * as AC from "@bacons/apple-colors";

export default function CreateAccountScreen() {
  const { register } = useAuthStoreObserver();
  const { t } = useI18n();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    // Validation
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      Alert.alert(t('error'), "Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert(t('error'), "Les mots de passe ne correspondent pas");
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert(
        t('error'),
        "Le mot de passe doit contenir au moins 6 caractères",
      );
      return;
    }

    setIsLoading(true);
    try {
      console.log('🔐 Attempting registration with:', formData.email);
      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined,
      });

      console.log("Registration result:", result);
      if (result.success) {
        Alert.alert(
          t('success'),
          "Inscription réussie ! Vous êtes maintenant connecté.",
          [
            {
              text: "OK",
              onPress: () => router.replace("/(tabs)"),
            },
          ],
        );
      } else {
        Alert.alert(t('error'), result.error || "Échec de l'inscription");
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert(t('error'), "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View 
      className="flex-1"
      style={{ backgroundColor: AC.systemGroupedBackground }}
    >
      <ScrollView className="flex-1 p-4">
        <AppText center size="heading" className="mb-8">
          {t('registration')}
        </AppText>

        <View className="space-y-4">
          <View>
            <AppText className="mb-2">Nom complet *</AppText>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: AC.separator,
                borderRadius: 8,
                padding: 12,
                backgroundColor: AC.secondarySystemGroupedBackground,
                color: AC.label,
              }}
              placeholder="Entrez votre nom complet"
              placeholderTextColor={AC.tertiaryLabel}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          <View>
            <AppText className="mb-2">Email *</AppText>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: AC.separator,
                borderRadius: 8,
                padding: 12,
                backgroundColor: AC.secondarySystemGroupedBackground,
                color: AC.label,
              }}
              placeholder="Entrez votre email"
              placeholderTextColor={AC.tertiaryLabel}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View>
            <AppText className="mb-2">Téléphone</AppText>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: AC.separator,
                borderRadius: 8,
                padding: 12,
                backgroundColor: AC.secondarySystemGroupedBackground,
                color: AC.label,
              }}
              placeholder="Entrez votre numéro de téléphone"
              placeholderTextColor={AC.tertiaryLabel}
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              keyboardType="phone-pad"
              autoCorrect={false}
            />
          </View>

          <View>
            <AppText className="mb-2">Mot de passe *</AppText>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: AC.separator,
                borderRadius: 8,
                padding: 12,
                backgroundColor: AC.secondarySystemGroupedBackground,
                color: AC.label,
              }}
              placeholder="Entrez votre mot de passe"
              placeholderTextColor={AC.tertiaryLabel}
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View>
            <AppText className="mb-2">Confirmer le mot de passe *</AppText>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: AC.separator,
                borderRadius: 8,
                padding: 12,
                backgroundColor: AC.secondarySystemGroupedBackground,
                color: AC.label,
              }}
              placeholder="Confirmez votre mot de passe"
              placeholderTextColor={AC.tertiaryLabel}
              value={formData.confirmPassword}
              onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        <View className="mt-6">
          <Button
            title={isLoading ? "Inscription..." : t('signUp')}
            onPress={handleRegister}
            disabled={isLoading}
          />
        </View>

        <View className="mt-4">
          <AppText center className="text-gray-600 text-sm">
            En vous inscrivant, vous acceptez nos conditions d'utilisation
          </AppText>
        </View>
      </ScrollView>
    </View>
  );
}
