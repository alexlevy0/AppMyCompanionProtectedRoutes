import { AUTH_SCRIPT_URL } from "./authStore";
import { LoginResult } from "@/types";

function hashPassword(password: string): string {
  return btoa(password + "salt_mycompanion_2025");
}

export async function login(
  email: string,
  password: string,
): Promise<LoginResult> {
  try {
    const response = await fetch(AUTH_SCRIPT_URL, {
      redirect: "follow",
      method: "POST",
      body: JSON.stringify({
        action: "login",
        email: email,
        password: hashPassword(password),
      }),
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
    });

    const result = await response.json();
    if (result.success) {
      return result;
    } else {
      return {
        success: false,
        error: "Email ou mot de passe incorrect",
      };
    }
  } catch (error) {
    console.error("Erreur connexion:", error);
    return { success: false, error: "Email ou mot de passe incorrect" };
  }
}
