import { View, TextInput, Alert } from "react-native";
import { AppText } from "@/components/AppText";
import { Link } from "expo-router";
import { Button } from "@/components/Button";
import { useAuthStore } from "@/utils/authStore";
import { useState } from "react";

export default function SignInScreen() {
  const { logIn, logInAsVip } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }

    setIsLoading(true);
    try {
      const result = await logIn(email, password);

      if (result.success) {
        Alert.alert("Succès", "Connexion réussie !");
      } else {
        Alert.alert("Erreur", result.error || "Échec de la connexion");
      }
    } catch (error) {
      Alert.alert("Erreur", "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="justify-center flex-1 p-4">
      <AppText center size="heading" className="mb-8">
        Connexion
      </AppText>

      <View className="space-y-4 mb-6">
        <View>
          <AppText className="mb-2">Email</AppText>
          <TextInput
            className="border border-gray-300 rounded-lg p-3 bg-white"
            placeholder="Entrez votre email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View>
          <AppText className="mb-2">Mot de passe</AppText>
          <TextInput
            className="border border-gray-300 rounded-lg p-3 bg-white"
            placeholder="Entrez votre mot de passe"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>

      <Button
        title={isLoading ? "Connexion..." : "Se connecter"}
        onPress={handleLogin}
        disabled={isLoading}
      />

      <View className="mt-4 space-y-2">
        <Link asChild href="/register-modal">
          <Button title="S'inscrire" theme="secondary" />
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
