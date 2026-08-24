import { cookies } from "next/headers";

const API_URL = process.env.API_URL ?? "http://localhost:3001";
const COOKIE_NAME = process.env.JWT_COOKIE_NAME ?? "access_token";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface ApiFetchOptions {
  withAuth?: boolean;
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
  { withAuth = true }: ApiFetchOptions = {},
): Promise<T> {
  const headers = new Headers(options.headers);

  if (withAuth) {
    const token = (await cookies()).get(COOKIE_NAME)?.value;
    if (token) {
      headers.set("Cookie", `${COOKIE_NAME}=${token}`);
    }
  }

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      extractErrorMessage(data) ?? `Erreur serveur (${response.status})`,
      response.status,
    );
  }

  return data as T;
}

export function extractErrorMessage(data: unknown): string | null {
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