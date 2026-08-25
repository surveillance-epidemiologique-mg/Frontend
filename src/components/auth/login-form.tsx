"use client";

import { useState } from "react";
import { useActionState } from "react";
import Link from "next/link";
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
        variant="glass"
        autoComplete="email"
        required
        placeholder="prenom.nom@exemple.mg"
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
          <Link
            href="#"
            className="text-xs font-medium text-primary transition-colors hover:text-primary-hover"
          >
            Mot de passe oublié ?
          </Link>
        </div>
      </div>

      <Button type="submit" size="lg" className="mt-2 w-full" loading={pending}>
        {pending ? "Connexion en cours…" : "Se connecter"}
      </Button>
    </form>
  );
}
