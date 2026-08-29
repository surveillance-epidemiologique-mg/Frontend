"use client";

import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  getInviteOptions,
  inviteUser,
} from "@/features/users/services/invite";
import type { InviteOptions, InvitePayload } from "@/features/users/services/invite";
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
  const [options, setOptions] = useState<InviteOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<InviteResponse | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  useEffect(() => {
    let cancelled = false;

    async function loadOptions() {
      const data = await getInviteOptions();
      if (!cancelled) {
        setOptions(data);
        if (data.roles.length === 0) {
          setError("Impossible de charger les rôles et établissements.");
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

  function validate(): boolean {
    if (!form.name.trim() || form.name.trim().length < 2) {
      setError("Le nom complet est requis (2 caractères minimum).");
      return false;
    }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError("Adresse e-mail invalide.");
      return false;
    }
    if (!form.roleId) {
      setError("Le rôle est requis.");
      return false;
    }
    return true;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!validate()) {
      return;
    }

    setSubmitting(true);

    try {
      const payload: InvitePayload = {
        name: form.name.trim(),
        email: form.email.trim(),
        roleId: Number(form.roleId),
        centreId: form.centreId ? Number(form.centreId) : undefined,
        phoneNumber: form.phoneNumber.trim() || undefined,
      };
      const response = await inviteUser(payload);
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
          <div className="space-y-1">
            <p className="font-medium">
              Utilisateur créé avec succès — {result.user.name}.
            </p>
            <p className="text-sm">
              Le compte est prêt pour sa première connexion. Transmettez à
              l&apos;utilisateur le lien d&apos;activation ci-dessous : il y
              définira lui-même son mot de passe.
            </p>
          </div>
        </Alert>

        <div className="space-y-3 rounded-lg border border-border bg-bg-app p-4 text-sm">
          <div>
            <div className="font-medium text-text-muted">
              Lien d&apos;activation
            </div>
            <div className="break-all font-mono text-xs text-text-main">
              {result.activationLink}
            </div>
          </div>
          <p className="text-xs text-text-muted">
            Le mot de passe n&apos;est jamais affiché : il est défini par
            l&apos;utilisateur lors de l&apos;activation de son compte.
          </p>
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

  const invitableRoles = (options?.roles ?? []).filter((role) =>
    INVITABLE_ROLES.includes(role.name),
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error ? <Alert variant="error">{error}</Alert> : null}

      <Input
        label="Nom complet"
        name="name"
        value={form.name}
        onChange={(e) => updateField("name", e.target.value)}
        required
        placeholder="Dr RAKOTO Jean"
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

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Rôle"
          value={form.roleId}
          onChange={(e) => updateField("roleId", e.target.value)}
          placeholder={loading ? "Chargement..." : "Sélectionner un rôle"}
          options={invitableRoles.map((role) => ({
            value: String(role.id),
            label: role.name,
          }))}
        />
        <Select
          label="Centre de santé"
          value={form.centreId}
          onChange={(e) => updateField("centreId", e.target.value)}
          placeholder="Aucun centre"
          options={(options?.centres ?? []).map((c) => ({
            value: String(c.id),
            label: c.name,
          }))}
        />
      </div>

      <Input
        label="Téléphone"
        name="phoneNumber"
        type="tel"
        value={form.phoneNumber}
        onChange={(e) => updateField("phoneNumber", e.target.value)}
        placeholder="+261 34 00 000 00"
      />

      <Button
        type="submit"
        className="w-full"
        loading={submitting}
        disabled={loading}
      >
        {submitting ? "Envoi..." : "Créer le compte"}
      </Button>
    </form>
  );
}