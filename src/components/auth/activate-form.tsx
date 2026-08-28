"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  activateAction,
  resendActivationAction,
  type ActionState,
} from "@/app/actions/auth";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: ActionState = {};

interface ActivateFormProps {
  token: string;
  email: string | null;
  invalid: boolean;
  expired: boolean;
}

export function ActivateForm({
  token,
  email,
  invalid,
  expired,
}: ActivateFormProps) {
  const [state, formAction, pending] = useActionState(
    activateAction,
    initialState,
  );
  const [resendState, resendAction, resendPending] = useActionState(
    resendActivationAction,
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

  if (invalid || !token) {
    return (
      <div className="space-y-4">
        <Alert variant="error">
          {invalid
            ? "Ce lien d'activation est invalide ou a déjà été utilisé."
            : "Ce lien d'activation est invalide ou incomplet."}
        </Alert>
        <Button asChild variant="secondary" className="w-full">
          <Link href="/login">Retour à la connexion</Link>
        </Button>
      </div>
    );
  }

  if (expired) {
    return (
      <div className="space-y-4">
        <Alert variant="error">
          Ce lien d&apos;activation a expiré.
        </Alert>
        <form action={resendAction} className="space-y-3">
          {resendState.error ? (
            <Alert variant="error">{resendState.error}</Alert>
          ) : null}
          {resendState.success ? (
            <Alert variant="success">{resendState.success}</Alert>
          ) : null}
          <Input
            label="Adresse e-mail"
            name="email"
            type="email"
            defaultValue={email ?? ""}
            required
            placeholder="votre@email.mg"
          />
          <Button type="submit" className="w-full" disabled={resendPending}>
            {resendPending ? "Envoi..." : "Demander un nouveau lien"}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />

      {state.error ? <Alert variant="error">{state.error}</Alert> : null}

      <div className="rounded-lg border border-border bg-bg-app px-3 py-2.5 text-sm">
        <span className="text-text-muted">Email : </span>
        <span className="font-medium text-text-main">{email}</span>
      </div>

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