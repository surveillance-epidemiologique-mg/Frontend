"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import {
  CENTRE_TYPES,
  type CentreFormValues,
  type CentreSante,
  type CentreType,
  type Zone,
} from "@/features/settings/types";

interface CentreFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CentreFormValues) => void;
  centre?: CentreSante | null;
  zones: Zone[];
}

const EMPTY: CentreFormValues = {
  name: "",
  type: "CSB2",
  zoneId: 0,
  latitude: null,
  longitude: null,
};

export function CentreFormModal({
  open,
  onClose,
  onSubmit,
  centre,
  zones,
}: CentreFormModalProps) {
  const [values, setValues] = useState<CentreFormValues>(() =>
    centre
      ? {
          name: centre.name,
          type: centre.type as CentreType,
          zoneId: centre.zoneId,
          latitude: centre.latitude ?? null,
          longitude: centre.longitude ?? null,
        }
      : EMPTY,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isEdit = Boolean(centre);

  function updateField<K extends keyof CentreFormValues>(
    key: K,
    value: CentreFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  function validate(): boolean {
    const next: Record<string, string> = {};

    if (!values.name.trim()) {
      next.name = "Le nom du centre est requis.";
    }
    if (!values.zoneId) {
      next.zoneId = "La zone est requise.";
    }
    if (values.latitude !== null && !Number.isFinite(values.latitude)) {
      next.coordinates = "Coordonnées GPS invalides.";
    }
    if (values.longitude !== null && !Number.isFinite(values.longitude)) {
      next.coordinates = "Coordonnées GPS invalides.";
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
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Modifier le centre" : "Ajouter un centre"}
      description="Renseignez les informations de l'établissement sanitaire."
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" form="centre-form">
            {isEdit ? "Enregistrer" : "Ajouter"}
          </Button>
        </>
      }
    >
      <form
        id="centre-form"
        onSubmit={handleSubmit}
        className="space-y-4"
        noValidate
      >
        <Input
          label="Nom du centre"
          value={values.name}
          onChange={(e) => updateField("name", e.target.value)}
          placeholder="Ex. CSB2 Analakely"
          error={errors.name}
          autoFocus
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <Select
            label="Type"
            value={values.type}
            onChange={(e) =>
              updateField("type", e.target.value as CentreType)
            }
            options={CENTRE_TYPES.map((type) => ({
              value: type,
              label: type,
            }))}
          />
          <Select
            label="Zone"
            value={values.zoneId ? String(values.zoneId) : ""}
            onChange={(e) =>
              updateField("zoneId", e.target.value ? Number(e.target.value) : 0)
            }
            placeholder="Sélectionner"
            error={errors.zoneId}
            options={zones.map((zone) => ({
              value: String(zone.id),
              label: zone.name,
            }))}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Latitude (GPS)"
            type="number"
            step="any"
            value={values.latitude ?? ""}
            onChange={(e) =>
              updateField(
                "latitude",
                e.target.value === "" ? null : Number(e.target.value),
              )
            }
            placeholder="-18.91"
            error={errors.coordinates}
          />
          <Input
            label="Longitude (GPS)"
            type="number"
            step="any"
            value={values.longitude ?? ""}
            onChange={(e) =>
              updateField(
                "longitude",
                e.target.value === "" ? null : Number(e.target.value),
              )
            }
            placeholder="47.53"
          />
        </div>
      </form>
    </Modal>
  );
}