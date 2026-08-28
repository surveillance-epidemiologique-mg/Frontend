"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  resetPasswordAction,
  type ActionState,
} from "@/app/actions/auth";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: ActionState = {};

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [state, formAction, pending] = useActionState(
    resetPasswordAction,
    initialState,
  );

  if (state.success) {
    return (
      <div className="space-y-4">
        <Alert variant="success">{state.success}</Alert>
        <Button asChild className="w-full">
          <Link href="/login">Se connecter</Link>
        </Button>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="space-y-4">
        <Alert variant="error">
          Ce lien de réinitialisation est invalide ou incomplet.
        </Alert>
        <Button asChild variant="secondary" className="w-full">
          <Link href="/login">Retour à la connexion</Link>
        </Button>
      </div>
    );
  }

  const expired = Boolean(state.error && state.error.includes("expiré"));

  if (expired) {
    return (
      <div className="space-y-4">
        <Alert variant="error">
          Ce lien de réinitialisation a expiré.
        </Alert>
        <Button asChild className="w-full">
          <Link href="/forgot-password">Demander un nouveau lien</Link>
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />

      {state.error ? <Alert variant="error">{state.error}</Alert> : null}

      <Input
        label="Nouveau mot de passe"
        name="newPassword"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        placeholder="Au moins 8 caractères"
      />
      <Input
        label="Confirmer le mot de passe"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        placeholder="Saisissez à nouveau le mot de passe"
      />

      <Button type="submit" className="mt-2 w-full" loading={pending}>
        {pending ? "Réinitialisation..." : "Réinitialiser mon mot de passe"}
      </Button>
    </form>
  );
}