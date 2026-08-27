"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  forgotPasswordAction,
  type ActionState,
} from "@/app/actions/auth";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";

const initialState: ActionState = {};

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    forgotPasswordAction,
    initialState,
  );

  if (state.success) {
    return (
      <div className="space-y-4">
        <Alert variant="success">{state.success}</Alert>
        <Button asChild variant="secondary" className="w-full">
          <Link href="/login">Retour à la connexion</Link>
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {state.error ? <Alert variant="error">{state.error}</Alert> : null}

      <p className="text-sm leading-relaxed text-text-muted">
        Saisissez l&apos;adresse e-mail associée à votre compte. Nous vous
        enverrons un lien pour réinitialiser votre mot de passe.
      </p>

      <Input
        label="Adresse e-mail"
        name="email"
        type="email"
        icon={Mail}
        variant="glass"
        autoComplete="email"
        required
        placeholder="prenom.nom@exemple.mg"
      />

      <Button type="submit" size="lg" className="mt-2 w-full" loading={pending}>
        {pending ? "Envoi en cours…" : "Envoyer le lien"}
      </Button>

      <div className="text-center">
        <Link
          href="/login"
          className="text-xs font-medium text-primary transition-colors hover:text-primary-hover"
        >
          Retour à la connexion
        </Link>
      </div>
    </form>
  );
}