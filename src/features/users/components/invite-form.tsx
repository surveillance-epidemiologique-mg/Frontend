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

const INVITABLE_ROLES = [
  "Responsable national",
  "Responsable régional",
  "Agent de santé",
  "Observateur",
];

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  roleId: string;
  regionId: string;
  districtId: string;
  centreId: string;
  phoneNumber: string;
}

const EMPTY_FORM: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  roleId: "",
  regionId: "",
  districtId: "",
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

  const selectedRegion = options?.regions.find(
    (r) => String(r.id) === form.regionId,
  );
  const districts = selectedRegion?.districts ?? [];
  const centresInDistrict = (options?.centres ?? []).filter(
    (c) => String(c.zoneId) === form.districtId,
  );

  function updateField<K extends keyof FormState>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const firstName = form.firstName.trim();
      const lastName = form.lastName.trim();
      const payload: InvitePayload = {
        name: [firstName, lastName].filter(Boolean).join(" "),
        firstName,
        lastName,
        email: form.email.trim(),
        roleId: Number(form.roleId),
        regionId: form.regionId ? Number(form.regionId) : undefined,
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
            <div className="font-medium text-text-muted">Lien d&apos;activation</div>
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error ? <Alert variant="error">{error}</Alert> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Prénom"
          name="firstName"
          value={form.firstName}
          onChange={(e) => updateField("firstName", e.target.value)}
          required
          placeholder="Jean"
        />
        <Input
          label="Nom"
          name="lastName"
          value={form.lastName}
          onChange={(e) => updateField("lastName", e.target.value)}
          required
          placeholder="Rakoto"
        />
      </div>

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
          {(options?.roles ?? [])
            .filter((role) => INVITABLE_ROLES.includes(role.name))
            .map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Select
          label="Région"
          value={form.regionId}
          onChange={(e) => {
            updateField("regionId", e.target.value);
            updateField("districtId", "");
            updateField("centreId", "");
          }}
          placeholder="Aucune"
          options={(options?.regions ?? []).map((r) => ({
            value: String(r.id),
            label: r.name,
          }))}
        />
        <Select
          label="District"
          value={form.districtId}
          onChange={(e) => {
            updateField("districtId", e.target.value);
            updateField("centreId", "");
          }}
          placeholder="Aucun"
          disabled={!form.regionId}
          options={districts.map((d) => ({
            value: String(d.id),
            label: d.name,
          }))}
        />
        <Select
          label="Établissement"
          value={form.centreId}
          onChange={(e) => updateField("centreId", e.target.value)}
          placeholder="Aucun"
          disabled={!form.districtId}
          options={centresInDistrict.map((c) => ({
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

      <Button type="submit" className="w-full" disabled={submitting || loading}>
        {submitting ? "Envoi..." : "Créer le compte"}
      </Button>
    </form>
  );
}