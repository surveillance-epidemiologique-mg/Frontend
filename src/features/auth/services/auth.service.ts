import {
  apiFetch,
  clearSession,
  refreshAccessToken,
  setAccessToken,
  setUnauthorizedHandler,
} from "@/services/api";
import type { AuthResponse, User } from "@/types/auth";

const SESSION_EXPIRED_PATH = "/login?reason=session-expired";

/**
 * Initialise le gestionnaire de déconnexion globale du client HTTP.
 * Appelé côté client uniquement (ex: au montage du layout authentifié).
 */
export function initAuthClient(): void {
  setUnauthorizedHandler(() => {
    if (typeof window !== "undefined") {
      window.location.assign(SESSION_EXPIRED_PATH);
    }
  });
}

export async function login(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const result = await apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  setAccessToken(result.token);
  return result;
}

export function getMe(): Promise<User> {
  return apiFetch<User>("/auth/me");
}

export function refreshToken(): Promise<string | null> {
  return refreshAccessToken();
}

export async function logout(): Promise<void> {
  await clearSession();
}

export { SESSION_EXPIRED_PATH };
