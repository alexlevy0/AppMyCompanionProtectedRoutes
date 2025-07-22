import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { getItem, setItem, deleteItemAsync } from "expo-secure-store";
import { Platform } from "react-native";

type UserState = {
  isLoggedIn: boolean;
  shouldCreateAccount: boolean;
  hasCompletedOnboarding: boolean;
  isVip: boolean;
  _hasHydrated: boolean;
  logIn: () => void;
  logOut: () => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  logInAsVip: () => void;
  setHasHydrated: (value: boolean) => void;
};

// Créer un storage adaptatif selon la plateforme
const createAdaptiveStorage = () => {
  if (Platform.OS === "web") {
    // Sur web, utiliser localStorage
    return createJSONStorage(() => ({
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
    return createJSONStorage(() => ({
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
      logIn: () => {
        set((state) => {
          return {
            ...state,
            isLoggedIn: true,
          };
        });
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
      // Améliorer la gestion d'erreurs
      serialize: (state) => {
        try {
          return JSON.stringify(state);
        } catch (error) {
          console.error("Serialization error:", error);
          return "{}";
        }
      },
      deserialize: (str) => {
        try {
          return JSON.parse(str);
        } catch (error) {
          console.error("Deserialization error:", error);
          return {};
        }
      },
    },
  ),
);
