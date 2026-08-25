const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api/v1";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

let accessToken: string | null = null;
let unauthorizedHandler: (() => void | Promise<void>) | null = null;
let refreshPromise: Promise<string | null> | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function setUnauthorizedHandler(
  handler: () => void | Promise<void>,
): void {
  unauthorizedHandler = handler;
}

/**
 * Rafraîchissement silencieux du jeton.
 * Single-flight : les appels concurrents partagent la même promesse,
 * ce qui évite les boucles d'appels récursifs.
 */
export function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  const promise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        return null;
      }

      const data = (await response.json().catch(() => null)) as {
        token?: string;
      } | null;

      const token = data?.token ?? null;
      if (token) {
        accessToken = token;
      }
      return token;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  refreshPromise = promise;
  return promise;
}

/**
 * Supprime la session locale (jeton mémoire + cookie HTTP-only côté serveur).
 */
export async function clearSession(): Promise<void> {
  accessToken = null;
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch {
    // Le backend peut être indisponible : on ignore l'erreur.
  }
}

async function handleUnauthorized(): Promise<void> {
  await clearSession();
  if (unauthorizedHandler) {
    await unauthorizedHandler();
  }
}

function extractErrorMessage(data: unknown): string | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  const body = data as Record<string, unknown>;

  if (typeof body.message === "string") {
    return body.message;
  }

  if (Array.isArray(body.message)) {
    return body.message
      .map((m) => {
        if (typeof m === "object" && m !== null && "constraints" in m) {
          const constraints = (m as Record<string, unknown>).constraints;
          if (constraints && typeof constraints === "object") {
            return Object.values(constraints).join(", ");
          }
        }
        return String(m);
      })
      .join(", ");
  }

  return null;
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  return doRequest<T>(path, options, true);
}

async function doRequest<T>(
  path: string,
  options: RequestInit,
  allowRetry: boolean,
): Promise<T> {
  const headers = new Headers(options.headers);

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  const data = await response.json().catch(() => null);

  // Intercepteur 401 : rafraîchissement silencieux puis nouvel essai (une seule fois).
  if (response.status === 401 && allowRetry && path !== "/auth/refresh") {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return doRequest<T>(path, options, false);
    }

    await handleUnauthorized();
    throw new ApiError("Session expirée.", 401);
  }

  if (!response.ok) {
    throw new ApiError(
      extractErrorMessage(data) ?? `Erreur serveur (${response.status})`,
      response.status,
    );
  }

  return data as T;
}
