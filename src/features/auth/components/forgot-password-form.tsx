"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle2, KeyRound, Mail, RefreshCw, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
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
  const [timeLeft, setTimeLeft] = useState(600);
  const { toast } = useToast();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "code" && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  async function requestCode(): Promise<boolean> {
    setLoading(true);
    try {
      const result = await forgotPassword(email.trim());

      if (!result.success) {
        toast({
          title: "Erreur",
          description: result.message ?? "Aucun compte n'est associé à cette adresse e-mail.",
          variant: "error",
        });
        return false;
      }

      return true;
    } catch (err) {
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Impossible d'envoyer le code.",
        variant: "error",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function handleSendCode(event: React.FormEvent) {
    event.preventDefault();

    if (!email.trim()) {
      toast({ title: "Erreur", description: "Veuillez saisir votre adresse e-mail.", variant: "error" });
      return;
    }

    if (await requestCode()) {
      toast({ title: "Code envoyé", description: "Un code à 6 chiffres vous a été envoyé.", variant: "success" });
      setTimeLeft(600);
      setStep("code");
    }
  }

  async function handleVerifyCode(event: React.FormEvent) {
    event.preventDefault();

    if (!/^\d{6}$/.test(code)) {
      toast({ title: "Erreur", description: "Veuillez saisir le code à 6 chiffres.", variant: "error" });
      return;
    }

    setLoading(true);
    try {
      const result = await verifyResetCode(email.trim(), code);
      setResetToken(result.resetToken);
      setStep("password");
    } catch (err) {
      toast({ title: "Erreur", description: err instanceof Error ? err.message : "Code invalide.", variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  async function handleResendCode() {
    if (await requestCode()) {
      toast({ title: "Code renvoyé", description: "Un nouveau code à 6 chiffres vous a été envoyé.", variant: "success" });
      setTimeLeft(600);
    }
  }

  async function handleResetPassword(event: React.FormEvent) {
    event.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({ title: "Erreur", description: "Les deux mots de passe ne correspondent pas.", variant: "error" });
      return;
    }
    if (newPassword.length < 8) {
      toast({ title: "Erreur", description: "Le mot de passe doit contenir au moins 8 caractères.", variant: "error" });
      return;
    }

    setLoading(true);
    try {
      await resetPassword(resetToken, newPassword);
      toast({ title: "Succès", description: "Votre mot de passe a été réinitialisé avec succès.", variant: "success" });
      setStep("done");
    } catch (err) {
      toast({
        title: "Erreur",
        description: err instanceof Error
          ? err.message
          : "Impossible de réinitialiser le mot de passe.",
        variant: "error",
      });
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
        <Button className="w-full cursor-pointer" onClick={onBack}>
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
            <div 
              className="flex justify-between gap-2"
              onPaste={(e) => {
                e.preventDefault();
                const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
                if (pasted) {
                  setCode(pasted);
                  const nextIndex = Math.min(pasted.length, 5);
                  document.getElementById(`code-${nextIndex}`)?.focus();
                }
              }}
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <input
                  key={i}
                  id={`code-${i}`}
                  value={code[i] || ""}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(-1);
                    const newCode = code.split("");
                    newCode[i] = val;
                    setCode(newCode.join(""));
                    if (val && i < 5) {
                      document.getElementById(`code-${i + 1}`)?.focus();
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !code[i] && i > 0) {
                      const prevInput = document.getElementById(`code-${i - 1}`);
                      if (prevInput) {
                        prevInput.focus();
                        // Optional: clear the previous input when navigating back on empty
                        const newCode = code.split("");
                        newCode[i - 1] = "";
                        setCode(newCode.join(""));
                      }
                    }
                  }}
                  inputMode="numeric"
                  autoComplete={i === 0 ? "one-time-code" : "off"}
                  className="w-12 h-14 sm:w-14 sm:h-16 rounded-xl border-2 border-primary/40 bg-white/55 text-center font-mono text-2xl text-text-main backdrop-blur-sm placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  maxLength={2}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-center items-center gap-1.5 text-sm text-text-muted">
            <Clock className="size-4" />
            <span>Code valide pendant <strong className={`font-mono ${timeLeft < 60 ? 'text-destructive' : 'text-primary'}`}>{formatTime(timeLeft)}</strong></span>
          </div>
          <Button type="submit" className="w-full" loading={loading} disabled={timeLeft === 0}>
            Vérifier le code
          </Button>
          <button
            type="button"
            onClick={handleResendCode}
            disabled={loading}
            className="mx-auto cursor-pointer flex items-center gap-1.5 text-xs font-medium text-primary transition-colors hover:text-primary-hover disabled:opacity-60"
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
