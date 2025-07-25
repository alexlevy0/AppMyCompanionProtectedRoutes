import { View, Alert } from "react-native";
import { AppText } from "@/components/AppText";
import { Button } from "@/components/Button";
import { useAuthStore } from "@/utils/authStore";
import * as Form from "@/components/ui/form";
import { Link } from "expo-router";
import { Text, Pressable } from "react-native";
import * as AC from "@bacons/apple-colors";
import { Rounded } from "@/components/ui/rounded";
import { Image } from "@/components/ui/img";
import { TripleItemTest } from "./index";

export default function SettingsScreen() {
  const { logOut, resetOnboarding } = useAuthStore();

  return (
    <View
      className="flex-1 p-4"
      style={{ flex: 1, backgroundColor: AC.systemGroupedBackground }}
    >
      <Form.List navigationTitle="Home">
        <Form.Section>
          <Rounded padding style={{ alignItems: "center", gap: 8, flex: 1 }}>
            <Image
              source={{
                uri: "https://github.com/alexlevy0/getmycompanion.com/blob/main/android-chrome-512x512.png?raw=true",
              }}
              style={{
                aspectRatio: 1,
                height: 64,
                borderRadius: 8,
              }}
            />
            <Form.Text
              style={{
                fontSize: 20,
                fontFamily:
                  process.env.EXPO_OS === "ios" ? "ui-rounded" : undefined,
                fontWeight: "600",
              }}
            >
              MyCompanion
            </Form.Text>
            <Form.Text style={{ textAlign: "center", fontSize: 14 }}>
              MyCompanion calls your Senior daily and keeps you informed.
            </Form.Text>
          </Rounded>
        </Form.Section>
        <Form.Section title="Settings">
          <Form.Link href="/call-settings">
            <View style={{ gap: 4 }}>
              <Form.Text>Call Settings</Form.Text>
            </View>
          </Form.Link>
          <Link href="/notifications-settings">
            <View style={{ gap: 4 }}>
              <Form.Text>Notifications</Form.Text>
            </View>
          </Link>
        </Form.Section>
        <Form.Section title="App">
          <Form.Link href="/modal?deleteAccount=true">
            <View style={{ gap: 4 }}>
              <Form.Text>Delete Account</Form.Text>
            </View>
          </Form.Link>
          <Link target="_blank" href="https://getmycompanion.com">
            <View style={{ gap: 4 }}>
              <Form.Text>Contact Support</Form.Text>
            </View>
          </Link>
          <Link href="/settings" asChild style={{ flex: 1 }}>
            <Pressable style={{ flex: 1, gap: 4 }} onPress={resetOnboarding}>
              <Form.Text>Reset Onboarding</Form.Text>
            </Pressable>
          </Link>
          <Link href="/settings" asChild>
            <Pressable style={{ flex: 1, gap: 4 }} onPress={logOut}>
              <Form.Text>Sign out</Form.Text>
            </Pressable>
          </Link>
        </Form.Section>
        <Form.Section title="Status">
          <Form.HStack style={{ alignItems: "stretch", gap: 12 }}>
            <TripleItemTest />
          </Form.HStack>
        </Form.Section>
      </Form.List>
    </View>
  );
}
