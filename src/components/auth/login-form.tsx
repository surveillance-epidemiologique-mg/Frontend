"use client";

import { useState } from "react";
import { useActionState } from "react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { loginAction, type ActionState } from "@/app/actions/auth";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

const initialState: ActionState = {};

export function LoginForm() {
  const [view, setView] = useState<"login" | "forgot">("login");
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState,
  );
  const [showPassword, setShowPassword] = useState(false);

  if (view === "forgot") {
    return <ForgotPasswordForm onBack={() => setView("login")} />;
  }

  return (
      <div className="space-y-6">
          <div>
              <h2 className="text-2xl font-semibold tracking-tight text-primary ">
                  Connexion
              </h2>
              <p className="mt-1 text-sm text-text-muted">
                  Entrez vos identifiants pour accéder à votre compte.
              </p>
          </div>
          <form action={formAction} className="space-y-6">
              {state.error ? <Alert variant="error">{state.error}</Alert> : null}

              <Input
                  label="Adresse e-mail"
                  name="email"
                  type="email"
                  icon={Mail}
                  variant="glass"
                  autoComplete="email"
                  required
                  placeholder="exemple@gmail.com"
              />

              <div className="space-y-1.5">
                  <Input
                      label="Mot de passe"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      icon={Lock}
                      variant="glass"
                      autoComplete="current-password"
                      required
                      placeholder="••••••••"
                      rightSlot={
                          <button
                              type="button"
                              onClick={() => setShowPassword((prev) => !prev)}
                              aria-label={
                                  showPassword
                                      ? "Masquer le mot de passe"
                                      : "Afficher le mot de passe"
                              }
                              className="grid size-8 place-items-center rounded-md text-text-muted transition-colors hover:text-text-main"
                          >
                              {showPassword ? (
                                  <EyeOff className="size-4" strokeWidth={1.75} />
                              ) : (
                                  <Eye className="size-4" strokeWidth={1.75} />
                              )}
                          </button>
                      }
                  />
                  <div className="flex justify-end">
                      <button
                          type="button"
                          onClick={() => setView("forgot")}
                          className="cursor-pointer text-xs font-medium text-primary transition-colors hover:text-primary-hover"
                      >
                          Mot de passe oublié ?
                      </button>
                  </div>
              </div>

              <Button type="submit" size="lg" className="mt-2 w-full" loading={pending}>
                  {pending ? "Connexion en cours…" : "Se connecter"}
              </Button>
          </form>
      </div>
  );
}
