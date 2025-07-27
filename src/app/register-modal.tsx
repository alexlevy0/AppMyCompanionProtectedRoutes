import { View, TextInput, Alert, ScrollView } from "react-native";
import { AppText } from "@/components/AppText";
import { Button } from "@/components/Button";
import { useAuthStoreObserver } from "@/utils/authStoreLegend";
import { useState } from "react";
import { router } from "expo-router";

export default function RegisterModal() {
  const { register } = useAuthStoreObserver();
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
      Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas");
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert(
        "Erreur",
        "Le mot de passe doit contenir au moins 6 caractères",
      );
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

      console.log("result", result);
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

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1 p-4">
        <View className="space-y-4">
          <View>
            <AppText className="mb-2">Nom complet *</AppText>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 bg-white"
              placeholder="Entrez votre nom complet"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          <View>
            <AppText className="mb-2">Email *</AppText>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 bg-white"
              placeholder="Entrez votre email"
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
              className="border border-gray-300 rounded-lg p-3 bg-white"
              placeholder="Entrez votre numéro de téléphone"
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              keyboardType="phone-pad"
              autoCorrect={false}
            />
          </View>

          <View>
            <AppText className="mb-2">Mot de passe *</AppText>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 bg-white"
              placeholder="Entrez votre mot de passe"
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
              className="border border-gray-300 rounded-lg p-3 bg-white"
              placeholder="Confirmez votre mot de passe"
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
            title={isLoading ? "Inscription..." : "S'inscrire"}
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