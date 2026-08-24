"use client";

import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getInviteOptions,
  inviteUser,
} from "@/features/users/services/invite";
import type { InviteResponse } from "@/types/auth";

const INVITABLE_ROLES = ["Medecin", "Laboratoire"];

interface FormState {
  name: string;
  email: string;
  roleId: string;
  centreId: string;
  phoneNumber: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  email: "",
  roleId: "",
  centreId: "",
  phoneNumber: "",
};

export function InviteForm() {
  const [roles, setRoles] = useState<{ id: number; name: string }[]>([]);
  const [centres, setCentres] = useState<
    { id: number; name: string; zone?: { name: string } }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<InviteResponse | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  useEffect(() => {
    let cancelled = false;

    async function loadOptions() {
      const options = await getInviteOptions();

      if (!cancelled) {
        setRoles(
          options.roles.filter((role) => INVITABLE_ROLES.includes(role.name)),
        );
        setCentres(options.centres);
        if (options.roles.length === 0) {
          setError("Impossible de charger les rôles et centres de santé.");
        }
      }

      if (!cancelled) {
        setLoading(false);
      }
    }

    loadOptions();

    return () => {
      cancelled = true;
    };
  }, []);

  function updateField<K extends keyof FormState>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await inviteUser({
        name: form.name.trim(),
        email: form.email.trim(),
        roleId: Number(form.roleId),
        centreId: form.centreId ? Number(form.centreId) : undefined,
        phoneNumber: form.phoneNumber.trim() || undefined,
      });

      setResult(response);
      setForm(EMPTY_FORM);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Impossible d'envoyer l'invitation.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="space-y-4">
        <Alert variant="success">
          Compte créé pour <strong>{result.user.name}</strong>.
        </Alert>

        <div className="space-y-3 rounded-lg border border-border bg-bg-app p-4 text-sm">
          <div>
            <div className="font-medium text-text-muted">
              Mot de passe temporaire
            </div>
            <div className="font-mono text-lg font-semibold text-text-main">
              {result.temporaryPassword}
            </div>
          </div>
          <div>
            <div className="font-medium text-text-muted">
              Lien d&apos;activation
            </div>
            <div className="break-all font-mono text-xs text-text-main">
              {result.activationLink}
            </div>
          </div>
        </div>

        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={() => setResult(null)}
        >
          Inviter un autre utilisateur
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error ? <Alert variant="error">{error}</Alert> : null}

      <Input
        label="Nom complet"
        name="name"
        value={form.name}
        onChange={(e) => updateField("name", e.target.value)}
        required
        placeholder="Dr. RAKOTO Jean"
      />
      <Input
        label="Adresse e-mail"
        name="email"
        type="email"
        value={form.email}
        onChange={(e) => updateField("email", e.target.value)}
        required
        placeholder="prenom.nom@exemple.mg"
      />

      <div className="space-y-1.5">
        <label
          htmlFor="roleId"
          className="block text-sm font-medium text-text-main"
        >
          Rôle
        </label>
        <select
          id="roleId"
          name="roleId"
          value={form.roleId}
          onChange={(e) => updateField("roleId", e.target.value)}
          required
          disabled={loading}
          className="w-full rounded-lg border border-border bg-bg-surface px-3.5 py-2.5 text-sm text-text-main focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
        >
          <option value="">
            {loading ? "Chargement..." : "Sélectionner un rôle"}
          </option>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="centreId"
          className="block text-sm font-medium text-text-main"
        >
          Centre de santé{" "}
          <span className="font-normal text-text-muted">(optionnel)</span>
        </label>
        <select
          id="centreId"
          name="centreId"
          value={form.centreId}
          onChange={(e) => updateField("centreId", e.target.value)}
          disabled={loading}
          className="w-full rounded-lg border border-border bg-bg-surface px-3.5 py-2.5 text-sm text-text-main focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
        >
          <option value="">Aucun centre</option>
          {centres.map((centre) => (
            <option key={centre.id} value={centre.id}>
              {centre.name}
              {centre.zone?.name ? ` — ${centre.zone.name}` : ""}
            </option>
          ))}
        </select>
      </div>

      <Input
        label="Téléphone"
        name="phoneNumber"
        type="tel"
        value={form.phoneNumber}
        onChange={(e) => updateField("phoneNumber", e.target.value)}
        placeholder="+261 34 00 000 00"
      />

      <Button type="submit" className="w-full" disabled={submitting || loading}>
        {submitting ? "Envoi..." : "Envoyer l'invitation"}
      </Button>
    </form>
  );
}