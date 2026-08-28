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

export interface RegionOption {
  id: number;
  name: string;
  districts: { id: number; name: string }[];
}

interface UserFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: UserFormValues) => void;
  user?: User | null;
  roles: Role[];
  centres: CentreSante[];
  regions: RegionOption[];
}

const EMPTY: UserFormValues = {
  name: "",
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  roleId: 0,
  regionId: null,
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
  regions,
}: UserFormModalProps) {
  const [values, setValues] = useState<UserFormValues>(() =>
    user
      ? {
          name: user.name,
          firstName: user.firstName ?? "",
          lastName: user.lastName ?? "",
          email: user.email,
          phoneNumber: user.phoneNumber ?? "",
          roleId: user.roleId,
          regionId: user.region?.id ?? null,
          centreId: user.centreId,
          isActive: user.isActive,
        }
      : EMPTY,
  );
  const [districtId, setDistrictId] = useState<string>(
    () =>
      user?.centre
        ? String(centres.find((c) => c.id === user.centreId)?.zoneId ?? "")
        : "",
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

  const selectedRegion = regions.find((r) => r.id === values.regionId);
  const districts = selectedRegion?.districts ?? [];
  const centresInDistrict = centres.filter(
    (c) => String(c.zoneId) === districtId,
  );

  function updateField<K extends keyof UserFormValues>(
    key: K,
    value: UserFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!values.firstName.trim() && !values.name.trim()) {
      next.firstName = "Le prénom ou le nom est requis.";
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

    const firstName = values.firstName.trim();
    const lastName = values.lastName.trim();
    onSubmit({
      ...values,
      name: [firstName, lastName].filter(Boolean).join(" ") || values.name.trim(),
      firstName,
      lastName,
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
          : "Le compte sera prêt pour sa première connexion (l'utilisateur définira son mot de passe)."
      }
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" form="user-form">
            {isEdit ? "Enregistrer" : "Créer le compte"}
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
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Prénom"
            value={values.firstName}
            onChange={(e) => updateField("firstName", e.target.value)}
            placeholder="Jean"
            error={errors.firstName}
            autoFocus
          />
          <Input
            label="Nom"
            value={values.lastName}
            onChange={(e) => updateField("lastName", e.target.value)}
            placeholder="Rakoto"
          />
        </div>

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

        <div className="grid gap-4 sm:grid-cols-3">
          <Select
            label="Rôle"
            value={values.roleId || ""}
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
            label="Région"
            value={values.regionId ? String(values.regionId) : ""}
            onChange={(e) => {
              updateField("regionId", e.target.value ? Number(e.target.value) : null);
              setDistrictId("");
              updateField("centreId", null);
            }}
            placeholder="Aucune"
            options={regions.map((r) => ({ value: String(r.id), label: r.name }))}
          />
          <Select
            label="District"
            value={districtId}
            onChange={(e) => {
              setDistrictId(e.target.value);
              updateField("centreId", null);
            }}
            placeholder="Aucun"
            disabled={!values.regionId}
            options={districts.map((d) => ({ value: String(d.id), label: d.name }))}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Select
            label="Établissement"
            value={values.centreId ? String(values.centreId) : ""}
            onChange={(e) =>
              updateField("centreId", e.target.value ? Number(e.target.value) : null)
            }
            placeholder="Aucun"
            disabled={!districtId}
            options={centresInDistrict.map((centre) => ({
              value: String(centre.id),
              label: centre.name,
            }))}
          />
          <Select
            label="Statut du compte"
            value={values.isActive ? "active" : "inactive"}
            onChange={(e) => updateField("isActive", e.target.value === "active")}
            options={[
              { value: "active", label: "Actif" },
              { value: "inactive", label: "Inactif" },
            ]}
          />
        </div>
      </form>
    </Modal>
  );
}