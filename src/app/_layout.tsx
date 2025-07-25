import { Stack, SplashScreen } from "expo-router";
import "../../global.css";
import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { useAuthStore } from "@/utils/authStore";
import { Platform, View, Text, ActivityIndicator } from "react-native";
import { I18nProvider } from "@/utils/I18nContext";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const {
    isLoggedIn,
    shouldCreateAccount,
    hasCompletedOnboarding,
    _hasHydrated,
  } = useAuthStore();

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (_hasHydrated && !isReady) {
      console.log("✅ Store hydrated, hiding splash screen");
      setIsReady(true);
      SplashScreen.hideAsync().catch(console.error);
    }
  }, [_hasHydrated, isReady]);

  // Afficher un écran de chargement pendant l'hydratation
  if (!isReady) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#ffffff",
        }}
      >
        <ActivityIndicator size="large" color="#007AFF" />
        <Text
          style={{
            marginTop: 16,
            fontSize: 16,
            color: "#666",
          }}
        >
          Loading...
        </Text>
        {Platform.OS === "web" && (
          <Text
            style={{
              marginTop: 8,
              fontSize: 12,
              color: "#999",
            }}
          >
            Initializing for web
          </Text>
        )}
      </View>
    );
  }

  return (
    <I18nProvider>
      <React.Fragment>
        <StatusBar style="auto" />
        <Stack>
          <Stack.Protected guard={isLoggedIn}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: "modal" }} />
            <Stack.Screen
              name="call-settings"
              options={{
                title: "Call Settings",
                presentation: "modal",
              }}
            />
            <Stack.Screen
              name="notifications-settings"
              options={{
                title: "Notifications",
                presentation: "modal",
              }}
            />
          </Stack.Protected>
          <Stack.Protected guard={!isLoggedIn && hasCompletedOnboarding}>
            <Stack.Screen name="sign-in" />
            <Stack.Protected guard={shouldCreateAccount}>
              <Stack.Screen name="create-account" />
            </Stack.Protected>
          </Stack.Protected>
          <Stack.Protected guard={!hasCompletedOnboarding}>
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          </Stack.Protected>
        </Stack>
      </React.Fragment>
    </I18nProvider>
  );
}
