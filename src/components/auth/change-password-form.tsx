"use client";

import { useActionState } from "react";
import {
  changePasswordAction,
  type ActionState,
} from "@/app/actions/auth";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: ActionState = {};

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(
    changePasswordAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      {state.error ? <Alert variant="error">{state.error}</Alert> : null}

      <Input
        label="Mot de passe actuel"
        name="currentPassword"
        type="password"
        autoComplete="current-password"
        required
        placeholder="••••••••"
      />
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
        label="Confirmer le nouveau mot de passe"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        placeholder="Saisissez à nouveau le mot de passe"
      />

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Enregistrement..." : "Enregistrer le mot de passe"}
      </Button>
    </form>
  );
}