import { apiFetch } from "@/lib/api";
import type { AuthResponse, User } from "@/types/auth";

export async function login(
  email: string,
  password: string,
  rememberMe = false,
): Promise<AuthResponse> {
  return apiFetch<AuthResponse>(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ email, password, rememberMe }),
    },
    { withAuth: false },
  );
}

export async function forgotPassword(email: string): Promise<void> {
  await apiFetch<{ message: string }>(
    "/auth/forgot-password",
    {
      method: "POST",
      body: JSON.stringify({ email }),
    },
    { withAuth: false },
  );
}

export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<AuthResponse> {
  return apiFetch<AuthResponse>(
    "/auth/reset-password",
    {
      method: "POST",
      body: JSON.stringify({ token, newPassword }),
    },
    { withAuth: false },
  );
}

export async function activate(
  token: string,
  newPassword: string,
): Promise<AuthResponse> {
  return apiFetch<AuthResponse>(
    "/auth/activate",
    {
      method: "POST",
      body: JSON.stringify({ token, newPassword }),
    },
    { withAuth: false },
  );
}

export async function activateInfo(
  token: string,
): Promise<{ email: string }> {
  return apiFetch<{ email: string }>(
    "/auth/activate-info",
    {
      method: "POST",
      body: JSON.stringify({ token }),
    },
    { withAuth: false },
  );
}

export async function resendActivation(email: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(
    "/auth/resend-activation",
    {
      method: "POST",
      body: JSON.stringify({ email }),
    },
    { withAuth: false },
  );
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/change-password", {
    method: "POST",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export async function getMe(): Promise<User> {
  return apiFetch<User>("/auth/me");
}