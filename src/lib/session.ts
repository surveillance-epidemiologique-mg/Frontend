import { jwtVerify } from "jose";
import { cookies } from "next/headers";

export interface SessionUser {
  id: number;
  id_role: number;
  role: string;
  email: string;
  tempPassword: boolean;
}

const COOKIE_NAME = process.env.JWT_COOKIE_NAME ?? "access_token";

function getSecretKey(): Uint8Array {
  return new TextEncoder().encode(process.env.JWT_SECRET ?? "change-me");
}

export async function getSessionToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(COOKIE_NAME)?.value;
}

export async function setSessionToken(token: string, maxAge = 86400): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge,
    path: "/",
  });
}

export async function deleteSessionToken(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function verifySession(
  token?: string,
): Promise<SessionUser | null> {
  const raw = token ?? (await getSessionToken());
  if (!raw) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(raw, getSecretKey(), {
      algorithms: ["HS256"],
    });

    return {
      id: Number(payload.sub),
      id_role: Number(payload.id_role),
      role: String(payload.role),
      email: String(payload.email),
      tempPassword: Boolean(payload.tempPassword),
    };
  } catch {
    return null;
  }
}