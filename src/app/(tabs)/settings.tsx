import { View } from "react-native";
import { AppText } from "@/components/AppText";
import { Button } from "@/components/Button";
import { useAuthStore } from "@/utils/authStore";

export default function SettingsScreen() {
  const { logOut, resetOnboarding } = useAuthStore();

  return (
    <View className="justify-center flex-1 p-4">
      <AppText center size="heading">
        Settings Screen
      </AppText>

      <View className="gap-4 mt-8">
        <Button title="Reset Onboarding" onPress={resetOnboarding} />
        <Button title="Sign out" onPress={logOut} />
      </View>
    </View>
  );
}
