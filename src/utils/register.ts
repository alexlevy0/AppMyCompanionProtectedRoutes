import { AUTH_SCRIPT_URL, hashPassword, generateUserId } from "./authStore";
import { RegisterResult, UserData } from "@/types";

export async function register(userData: UserData): Promise<RegisterResult> {
  try {
    await fetch(AUTH_SCRIPT_URL, {
      redirect: "follow",
      method: "POST",
      body: JSON.stringify({
        action: "register",
        ...userData,
        password: hashPassword(userData.password),
        userId: generateUserId(),
        timestamp: new Date().toISOString(),
      }),
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Erreur inscription:", error);
    return { success: false, error: "Erreur de connexion" };
  }
}
