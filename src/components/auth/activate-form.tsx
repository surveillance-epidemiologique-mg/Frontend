"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  activateAction,
  type ActionState,
} from "@/app/actions/auth";
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

  if (state.success) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-primary">
            Compte activé
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            Votre compte est prêt. Vous pouvez maintenant vous connecter.
          </p>
        </div>
        <Alert variant="success">{state.success}</Alert>
        <Button asChild className="w-full">
          <Link href="/login">Se connecter</Link>
        </Button>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-primary">
            Activation de votre compte
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            Définissez votre mot de passe personnel
          </p>
        </div>
        <Alert variant="error">
          Ce lien d&apos;activation est invalide ou incomplet.
        </Alert>
        <Button asChild variant="secondary" className="w-full">
          <Link href="/login">Retour à la connexion</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-primary">
          Activation de votre compte
        </h2>
        <p className="mt-1 text-sm text-text-muted">
          Définissez votre mot de passe personnel
        </p>
      </div>
      <form action={formAction} className="space-y-6">
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

      <Button type="submit" size="lg" className="mt-2 w-full" loading={pending}>
        {pending ? "Activation..." : "Activer mon compte"}
      </Button>
    </form>
    </div>
  );
}