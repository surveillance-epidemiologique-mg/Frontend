"use client";

import { useState } from "react";
import { useActionState } from "react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { loginAction, type ActionState } from "@/app/actions/auth";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: ActionState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState,
  );
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="space-y-4">
      {state.error ? <Alert variant="error">{state.error}</Alert> : null}

      <Input
        label="Adresse e-mail"
        name="email"
        type="email"
        icon={Mail}
        autoComplete="email"
        required
        placeholder="prenom.nom@exemple.mg"
      />

      <Input
        label="Mot de passe"
        name="password"
        type={showPassword ? "text" : "password"}
        icon={Lock}
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
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        }
      />

      <Button type="submit" className="w-full" loading={pending}>
        {pending ? "Connexion en cours…" : "Se connecter"}
      </Button>
    </form>
  );
}