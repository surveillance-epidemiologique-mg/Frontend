"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import {
  INVITABLE_ROLE_NAMES,
  type CentreSante,
  type Role,
  type User,
  type UserFormValues,
} from "@/features/settings/types";

interface UserFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: UserFormValues) => void;
  user?: User | null;
  roles: Role[];
  centres: CentreSante[];
  loading?: boolean;
}

const EMPTY: UserFormValues = {
  name: "",
  email: "",
  phoneNumber: "",
  roleId: 0,
  centreId: null,
  isActive: true,
};

export function UserFormModal({
  open,
  onClose,
  onSubmit,
  user,
  roles,
  centres,
  loading = false,
}: UserFormModalProps) {
  const [values, setValues] = useState<UserFormValues>(() =>
    user
      ? {
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber ?? "",
          roleId: user.roleId,
          centreId: user.centreId,
          isActive: user.isActive,
        }
      : EMPTY,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isEdit = Boolean(user);

  const roleOptions = useMemo(() => {
    const invitable = INVITABLE_ROLE_NAMES as readonly string[];
    const options = roles.filter((role) => invitable.includes(role.name));
    if (user && !options.some((role) => role.id === user.roleId)) {
      options.push({ id: user.roleId, name: user.role.name });
    }
    return options;
  }, [roles, user]);

  function updateField<K extends keyof UserFormValues>(
    key: K,
    value: UserFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  function validate(): boolean {
    const next: Record<string, string> = {};

    if (!values.name.trim()) {
      next.name = "Le nom complet est requis.";
    } else if (values.name.trim().length < 2) {
      next.name = "Le nom doit contenir au moins 2 caractères.";
    }
    if (!values.email.trim()) {
      next.email = "L'adresse e-mail est requise.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      next.email = "Adresse e-mail invalide.";
    }
    if (!values.roleId) {
      next.roleId = "Le rôle est requis.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    onSubmit({
      ...values,
      name: values.name.trim(),
      email: values.email.trim(),
      phoneNumber: values.phoneNumber.trim(),
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Modifier l'utilisateur" : "Créer un utilisateur"}
      description={
        isEdit
          ? "Mettez à jour les informations du compte."
          : "Le compte sera créé avec un mot de passe temporaire. L'utilisateur définira son propre mot de passe lors de l'activation."
      }
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button type="submit" form="user-form" loading={loading}>
            {loading
              ? "Enregistrement..."
              : isEdit
                ? "Enregistrer"
                : "Créer le compte"}
          </Button>
        </>
      }
    >
      <form
        id="user-form"
        onSubmit={handleSubmit}
        className="space-y-4"
        noValidate
      >
        <Input
          label="Nom complet"
          value={values.name}
          onChange={(e) => updateField("name", e.target.value)}
          placeholder="Dr RAKOTO Jean"
          error={errors.name}
          autoFocus
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Adresse e-mail"
            type="email"
            value={values.email}
            onChange={(e) => updateField("email", e.target.value)}
            placeholder="prenom.nom@surveillance.mg"
            error={errors.email}
          />
          <Input
            label="Numéro de téléphone"
            type="tel"
            value={values.phoneNumber}
            onChange={(e) => updateField("phoneNumber", e.target.value)}
            placeholder="+261 34 00 000 00"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Rôle"
            value={values.roleId ? String(values.roleId) : ""}
            onChange={(e) =>
              updateField("roleId", e.target.value ? Number(e.target.value) : 0)
            }
            placeholder="Sélectionner un rôle"
            options={roleOptions.map((role) => ({
              value: String(role.id),
              label: role.name,
            }))}
            error={errors.roleId}
          />
          <Select
            label="Centre de santé"
            value={values.centreId ? String(values.centreId) : ""}
            onChange={(e) =>
              updateField(
                "centreId",
                e.target.value ? Number(e.target.value) : null,
              )
            }
            placeholder="Aucun centre"
            options={centres.map((centre) => ({
              value: String(centre.id),
              label: centre.name,
            }))}
          />
        </div>

        {isEdit ? (
          <Select
            label="Statut du compte"
            value={values.isActive ? "active" : "inactive"}
            onChange={(e) => updateField("isActive", e.target.value === "active")}
            options={[
              { value: "active", label: "Actif" },
              { value: "inactive", label: "Inactif" },
            ]}
          />
        ) : null}
      </form>
    </Modal>
  );
}