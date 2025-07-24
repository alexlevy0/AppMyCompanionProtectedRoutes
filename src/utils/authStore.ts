import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { getItem, setItem, deleteItemAsync } from "expo-secure-store";
import { Platform } from "react-native";
import { login } from "./login";
import { register } from "./register";
import {
  UserData,
  UserState,
  CallSettings,
  NotificationSettings,
} from "@/types";

// Constants
export const AUTH_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxBlSRVwQfIyjDXoMBD3B0R7cmaHkBPv1IBOJS4nI3aX-lbEASF7hYyn8YPInBl1B8s/exec";

// Utility functions
export function hashPassword(password: string): string {
  // Simple hash pour le MVP (à améliorer en production)
  return btoa(password + "salt_mycompanion_2025");
}

export function generateUserId(): string {
  return "user_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
}

// Détection de l'environnement
const isSSR = typeof window === "undefined";
const isWeb = Platform.OS === "web";

// Storage adaptatif qui gère automatiquement tous les cas
const createAdaptiveStorage = () => {
  // Pendant le SSR, utiliser un storage "noop" qui ne fait rien
  if (isSSR) {
    return createJSONStorage<UserState>(() => ({
      setItem: async () => {}, // No-op pendant SSR
      getItem: async () => null, // Retourne null pendant SSR
      removeItem: async () => {}, // No-op pendant SSR
    }));
  }

  // Sur le web (après hydratation), utiliser localStorage
  if (isWeb) {
    return createJSONStorage<UserState>(() => ({
      setItem: async (key: string, value: string) => {
        localStorage.setItem(key, value);
      },
      getItem: async (key: string) => {
        return localStorage.getItem(key);
      },
      removeItem: async (key: string) => {
        localStorage.removeItem(key);
      },
    }));
  }

  // Sur native, utiliser expo-secure-store
  return createJSONStorage<UserState>(() => ({
    setItem,
    getItem,
    removeItem: deleteItemAsync,
  }));
};

export const useAuthStore = create(
  persist<UserState>(
    (set) => ({
      isLoggedIn: false,
      shouldCreateAccount: false,
      hasCompletedOnboarding: false,
      isVip: false,
      _hasHydrated: false,
      user: null,

      logIn: async (email: string, password: string) => {
        const result = await login(email, password);
        if (result.success && result.user) {
          set((state) => ({
            ...state,
            isLoggedIn: true,
            user: result.user,
          }));
        }
        return result;
      },

      register: async (userData: UserData) => {
        const result = await register(userData);
        if (result.success) {
          set((state) => ({
            ...state,
            isLoggedIn: true,
            user: {
              id: generateUserId(),
              name: userData.name,
              email: userData.email,
            },
          }));
        }
        return result;
      },

      logInAsVip: () => {
        set((state) => ({
          ...state,
          isVip: true,
          isLoggedIn: true,
        }));
      },

      logOut: () => {
        set((state) => ({
          ...state,
          isVip: false,
          isLoggedIn: false,
          user: null,
        }));
      },

      completeOnboarding: () => {
        set((state) => ({
          ...state,
          hasCompletedOnboarding: true,
        }));
      },

      resetOnboarding: () => {
        set((state) => ({
          ...state,
          hasCompletedOnboarding: false,
        }));
      },

      setHasHydrated: (value: boolean) => {
        set((state) => ({
          ...state,
          _hasHydrated: value,
        }));
      },

      updateCallSettings: (settings: CallSettings) => {
        set((state) => ({
          ...state,
          user: state.user
            ? {
                ...state.user,
                callSettings: settings,
              }
            : null,
        }));
      },

      updateNotificationSettings: (settings: NotificationSettings) => {
        set((state) => ({
          ...state,
          user: state.user
            ? {
                ...state.user,
                notificationSettings: settings,
              }
            : null,
        }));
      },
    }),
    {
      name: "auth-store",
      storage: createAdaptiveStorage(),
      // Pendant le SSR, on skip complètement l'hydratation
      skipHydration: isSSR,
      onRehydrateStorage: (state) => {
        console.log("onRehydrateStorage starting", state);
        return (state, error) => {
          if (error) {
            console.error("Rehydration failed:", error);
          } else {
            console.log("onRehydrateStorage completed successfully");
          }
          // Marquer comme hydraté seulement si on n'est pas en SSR
          if (state && !isSSR) {
            state.setHasHydrated(true);
          }
        };
      },
    }
  )
);
