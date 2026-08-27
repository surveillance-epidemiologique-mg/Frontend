"use server";

import { redirect } from "next/navigation";
import { deleteSessionToken, setSessionToken } from "@/lib/session";
import {
  activate,
  changePassword,
  forgotPassword,
  login,
  resetPassword,
} from "@/services/auth";

export interface ActionState {
  error?: string;
  success?: string;
}

const COOKIE_MAX_AGE = 86400;

export async function loginAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const rememberMe = formData.get("rememberMe") === "on";

  if (!email || !password) {
    return {
      error: "Veuillez renseigner votre adresse e-mail et votre mot de passe.",
    };
  }

  let temporaryPassword = false;

  try {
    const result = await login(email, password, rememberMe);

    await setSessionToken(
      result.token,
      result.expiresIn ?? COOKIE_MAX_AGE,
    );
    temporaryPassword = result.user.temporaryPassword;
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Identifiants invalides.",
    };
  }

  redirect(temporaryPassword ? "/change-password" : "/dashboard");
}

export async function activateAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const token = String(formData.get("token") ?? "").trim();
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!token) {
    return { error: "Lien d'activation invalide." };
  }

  if (newPassword !== confirmPassword) {
    return { error: "Les deux mots de passe ne correspondent pas." };
  }

  try {
    const result = await activate(token, newPassword);

    await setSessionToken(result.token, COOKIE_MAX_AGE);
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Impossible d'activer le compte.",
    };
  }

  redirect("/dashboard");
}

export async function forgotPasswordAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    return { error: "Veuillez renseigner votre adresse e-mail." };
  }

  try {
    await forgotPassword(email);
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Impossible d'envoyer l'e-mail de réinitialisation.",
    };
  }

  return {
    success:
      "Si un compte est associé à cette adresse e-mail, un lien de réinitialisation vient d'être envoyé.",
  };
}

export async function resetPasswordAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const token = String(formData.get("token") ?? "").trim();
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!token) {
    return { error: "Lien de réinitialisation invalide." };
  }

  if (newPassword !== confirmPassword) {
    return { error: "Les deux mots de passe ne correspondent pas." };
  }

  try {
    const result = await resetPassword(token, newPassword);

    await setSessionToken(result.token, COOKIE_MAX_AGE);
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Impossible de réinitialiser le mot de passe.",
    };
  }

  redirect("/dashboard");
}

export async function changePasswordAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (newPassword !== confirmPassword) {
    return { error: "Les deux mots de passe ne correspondent pas." };
  }

  if (newPassword.length < 8) {
    return { error: "Le mot de passe doit contenir au moins 8 caractères." };
  }

  try {
    const result = await changePassword(currentPassword, newPassword);

    await setSessionToken(result.token, COOKIE_MAX_AGE);
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Impossible de modifier le mot de passe.",
    };
  }

  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  await deleteSessionToken();
  redirect("/login");
}