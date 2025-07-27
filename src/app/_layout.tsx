import { Stack, SplashScreen } from "expo-router";
import "../../global.css";
import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { useAuthStoreObserver } from "@/utils/authStoreLegend";
import { Platform, View, Text, ActivityIndicator } from "react-native";
import { I18nProvider } from "@/utils/I18nContext";
import { configureLegendStateApp, initializeSync } from "@/utils/legendConfig";
import { observer } from '@legendapp/state/react';

SplashScreen.preventAutoHideAsync();

export default observer(function RootLayout() {
  const {
    isLoggedIn,
    shouldCreateAccount,
    hasCompletedOnboarding,
    _hasHydrated,
  } = useAuthStoreObserver();

  // Logs pour déboguer la navigation
  console.log('Navigation state:', {
    isLoggedIn,
    shouldCreateAccount,
    hasCompletedOnboarding,
    _hasHydrated,
  });

  // Logs détaillés pour chaque changement d'état
  useEffect(() => {
    console.log('🔍 Navigation state changed:', {
      isLoggedIn,
      shouldCreateAccount,
      hasCompletedOnboarding,
      _hasHydrated,
    });
  }, [isLoggedIn, shouldCreateAccount, hasCompletedOnboarding, _hasHydrated]);

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Initialiser Legend-State de manière asynchrone
    configureLegendStateApp();
    
    // Attendre un peu pour que l'état soit chargé depuis le storage
    const timer = setTimeout(() => {
      console.log("✅ Hiding splash screen after state load");
      setIsReady(true);
      SplashScreen.hideAsync().catch(console.error);
    }, 500);
    
    // Initialiser la synchronisation en arrière-plan
    setTimeout(() => {
      initializeSync();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

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

  // Déterminer quelle section de navigation est active
  const navigationSection = isLoggedIn 
    ? 'LOGGED_IN' 
    : !hasCompletedOnboarding 
      ? 'ONBOARDING' 
      : 'SIGN_IN';
  
  console.log('🎯 Active navigation section:', navigationSection);

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
});
