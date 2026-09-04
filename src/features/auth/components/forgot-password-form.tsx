"use client";

import { useState } from "react";
import { ArrowLeft, CheckCircle2, KeyRound, Mail, RefreshCw } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  forgotPassword,
  resetPassword,
  verifyResetCode,
} from "@/features/auth/services/auth.service";

type Step = "email" | "code" | "password" | "done";

interface ForgotPasswordFormProps {
  onBack: () => void;
}

export function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  function clearMessages() {
    setError(null);
    setInfo(null);
  }

  async function requestCode(): Promise<boolean> {
    setLoading(true);
    try {
      const result = await forgotPassword(email.trim());

      if (!result.success) {
        setError(
          result.message ??
            "Aucun compte n'est associé à cette adresse e-mail.",
        );
        return false;
      }

      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Impossible d'envoyer le code.",
      );
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function handleSendCode(event: React.FormEvent) {
    event.preventDefault();
    clearMessages();

    if (!email.trim()) {
      setError("Veuillez saisir votre adresse e-mail.");
      return;
    }

    if (await requestCode()) {
      setInfo("Un code à 6 chiffres vous a été envoyé.");
      setStep("code");
    }
  }

  async function handleVerifyCode(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!/^\d{6}$/.test(code)) {
      setError("Veuillez saisir le code à 6 chiffres.");
      return;
    }

    setLoading(true);
    try {
      const result = await verifyResetCode(email.trim(), code);
      setResetToken(result.resetToken);
      setStep("password");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Code invalide.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResendCode() {
    clearMessages();
    if (await requestCode()) {
      setInfo("Un nouveau code à 6 chiffres vous a été envoyé.");
    }
  }

  async function handleResetPassword(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(resetToken, newPassword);
      setStep("done");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de réinitialiser le mot de passe.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (step === "done") {
    return (
      <div className="space-y-5 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-success/10 text-success">
          <CheckCircle2 className="size-6" />
        </span>
        <div>
          <h3 className="text-lg font-semibold text-text-main">
            Mot de passe réinitialisé
          </h3>
          <p className="mt-1 text-sm text-text-muted">
            Vous pouvez maintenant vous connecter avec votre nouveau mot de
            passe.
          </p>
        </div>
        <Button className="w-full" onClick={onBack}>
          Retour à la connexion
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold tracking-tight text-primary">
          {step === "email"
            ? "Mot de passe oublié ?"
            : step === "code"
              ? "Vérification"
              : "Nouveau mot de passe"}
        </h3>
        <p className="mt-1 text-sm text-text-muted">
          {step === "email"
            ? "Saisissez votre adresse e-mail pour recevoir un code de réinitialisation."
            : step === "code"
              ? `Saisissez le code à 6 chiffres envoyé à ${email}.`
              : "Choisissez un nouveau mot de passe sécurisé."}
        </p>
      </div>

      {error ? <Alert variant="error">{error}</Alert> : null}
      {info ? <Alert variant="info">{info}</Alert> : null}

      {step === "email" ? (
        <form onSubmit={handleSendCode} className="space-y-6">
          <Input
            label="Adresse e-mail"
            type="email"
            icon={Mail}
            variant="glass"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            placeholder="prenom.nom@exemple.mg"
            autoFocus
          />
          <Button type="submit" className="w-full" loading={loading}>
            Envoyer le code
          </Button>
        </form>
      ) : null}

      {step === "code" ? (
        <form onSubmit={handleVerifyCode} className="space-y-6">
          <div className="space-y-1.5">
            <label
              htmlFor="reset-code"
              className="block text-sm font-medium text-text-main"
            >
              Code de vérification
            </label>
            <input
              id="reset-code"
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="000000"
              className="w-full rounded-xl border border-white/60 bg-white/55 px-3 py-3 text-center font-mono text-2xl tracking-[0.5em] text-text-main backdrop-blur-sm placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <Button type="submit" className="w-full" loading={loading}>
            Vérifier le code
          </Button>
          <button
            type="button"
            onClick={handleResendCode}
            disabled={loading}
            className="mx-auto flex items-center gap-1.5 text-xs font-medium text-primary transition-colors hover:text-primary-hover disabled:opacity-60"
          >
            <RefreshCw className="size-3.5" />
            Renvoyer le code
          </button>
        </form>
      ) : null}

      {step === "password" ? (
        <form onSubmit={handleResetPassword} className="space-y-6">
          <Input
            label="Nouveau mot de passe"
            type="password"
            icon={KeyRound}
            variant="glass"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            required
            minLength={8}
            placeholder="Au moins 8 caractères"
          />
          <Input
            label="Confirmer le mot de passe"
            type="password"
            icon={KeyRound}
            variant="glass"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            required
            minLength={8}
            placeholder="Saisissez à nouveau le mot de passe"
          />
          <Button type="submit" className="w-full" loading={loading}>
            Réinitialiser le mot de passe
          </Button>
        </form>
      ) : null}

      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-medium text-text-muted transition-colors hover:text-text-main"
      >
        <ArrowLeft className="size-3.5" />
        Retour à la connexion
      </button>
    </div>
  );
}
