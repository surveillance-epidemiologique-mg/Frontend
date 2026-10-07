"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  activateAction,
  resendInvitationAction,
  type ActionState,
} from "@/app/actions/auth";
import { Alert } from "@/components/alert/component";
import { Button } from "@/components/button/component";
import { Input } from "@/components/input/component";

const initialState: ActionState = {};

interface ActivateFormProps {
  token: string;
}

export function ActivateForm({ token }: ActivateFormProps) {
  const [state, formAction, pending] = useActionState(
    activateAction,
    initialState,
  );
  const [resendState, resendFormAction, resendPending] = useActionState(
    resendInvitationAction,
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

  if (resendState.success) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight text-primary">
          Vérifiez votre boîte e-mail
        </h2>
        <Alert variant="success">{resendState.success}</Alert>
        <p className="text-sm text-text-muted">
          Si cette invitation est encore en attente, le nouveau lien sera valable 7 jours. Vérifiez également vos courriers indésirables.
        </p>
        <Button asChild variant="secondary" className="w-full">
          <Link href="/login">Retour à la connexion</Link>
        </Button>
      </div>
    );
  }

  if (state.error?.includes("expiré")) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight text-primary">
          Lien d&apos;invitation expiré
        </h2>
        <Alert variant="error">{state.error}</Alert>
        <form action={resendFormAction} className="space-y-3">
          <input type="hidden" name="token" value={token} />
          <Button type="submit" variant="secondary" className="w-full" loading={resendPending}>
            {resendPending ? "Envoi en cours…" : "Renvoyer le lien d'invitation"}
          </Button>
          {resendState.error ? <Alert variant="error">{resendState.error}</Alert> : null}
        </form>
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
      <div className="border-t border-border pt-4">
        <form action={resendFormAction} className="space-y-2">
          <input type="hidden" name="token" value={token} />
          <Button type="submit" variant="ghost" className="w-full" loading={resendPending}>
            {resendPending ? "Envoi en cours…" : "Lien expiré ? Renvoyer l'invitation"}
          </Button>
          {resendState.error ? <Alert variant="info">{resendState.error}</Alert> : null}
        </form>
      </div>
    </div>
  );
}
