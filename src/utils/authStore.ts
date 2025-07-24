import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { getItem, setItem, deleteItemAsync } from "expo-secure-store";
import { Platform } from "react-native";
import { login } from "./login";
import { register } from "./register";
import { UserData, UserState, CallSettings, NotificationSettings } from "@/types";

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

const createAdaptiveStorage = () => {
  if (Platform.OS === "web") {
    return createJSONStorage<UserState>(() => ({
      setItem: async (key: string, value: string) => {
        try {
          localStorage.setItem(key, value);
        } catch (error) {
          console.error("Failed to save to localStorage:", error);
        }
      },
      getItem: async (key: string) => {
        try {
          return localStorage.getItem(key);
        } catch (error) {
          console.error("Failed to get from localStorage:", error);
          return null;
        }
      },
      removeItem: async (key: string) => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.error("Failed to remove from localStorage:", error);
        }
      },
    }));
  } else {
    // Sur native, utiliser expo-secure-store
    return createJSONStorage<UserState>(() => ({
      setItem,
      getItem,
      removeItem: deleteItemAsync,
    }));
  }
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
        set((state) => {
          return {
            ...state,
            isVip: true,
            isLoggedIn: true,
          };
        });
      },
      logOut: () => {
        set((state) => {
          return {
            ...state,
            isVip: false,
            isLoggedIn: false,
            user: null,
          };
        });
      },
      completeOnboarding: () => {
        set((state) => {
          return {
            ...state,
            hasCompletedOnboarding: true,
          };
        });
      },
      resetOnboarding: () => {
        set((state) => {
          return {
            ...state,
            hasCompletedOnboarding: false,
          };
        });
      },
      setHasHydrated: (value: boolean) => {
        set((state) => {
          return {
            ...state,
            _hasHydrated: value,
          };
        });
      },
      updateCallSettings: (settings: CallSettings) => {
        set((state) => {
          return {
            ...state,
            user: state.user ? {
              ...state.user,
              callSettings: settings,
            } : null,
          };
        });
      },
      updateNotificationSettings: (settings: NotificationSettings) => {
        set((state) => {
          return {
            ...state,
            user: state.user ? {
              ...state.user,
              notificationSettings: settings,
            } : null,
          };
        });
      },
    }),
    {
      name: "auth-store",
      storage: createAdaptiveStorage(),
      onRehydrateStorage: (state) => {
        console.log("onRehydrateStorage starting", state);
        return (state, error) => {
          if (error) {
            console.error("Rehydration failed:", error);
          } else {
            console.log("onRehydrateStorage completed successfully");
          }
          // Toujours marquer comme hydraté, même en cas d'erreur
          if (state) {
            state.setHasHydrated(true);
          }
        };
      },
    },
  ),
);
