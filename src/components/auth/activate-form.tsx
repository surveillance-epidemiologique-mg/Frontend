"use client";

import { useActionState } from "react";
import { activateAction, type ActionState } from "@/app/actions/auth";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: ActionState = {};

interface ActivateFormProps {
  token: string;
}

export function ActivateForm({ token }: ActivateFormProps) {
  const [state, formAction, pending] = useActionState(
    activateAction,
    initialState,
  );

  if (!token) {
    return (
      <Alert variant="error">
        Ce lien d&apos;activation est invalide ou incomplet. Contactez votre
        administrateur.
      </Alert>
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

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Activation..." : "Activer mon compte"}
      </Button>
    </form>
  );
}