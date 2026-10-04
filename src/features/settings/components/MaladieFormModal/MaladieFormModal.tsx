"use client";

import { useState } from "react";
import { Button } from "@/components/button/component";
import { Input } from "@/components/input/component";
import { Modal } from "@/components/modal/component";
import { Textarea } from "@/components/textarea/component";
import type { Maladie, MaladieFormValues } from "@/features/settings/types";

interface MaladieFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: MaladieFormValues) => void;
  disease?: Maladie | null;
}

const EMPTY: MaladieFormValues = {
  name: "",
  icd10Code: "",
  alertThresholdCentre: 1,
  alertThresholdRegion: 1,
  description: "",
};

export function MaladieFormModal({
  open,
  onClose,
  onSubmit,
  disease,
}: MaladieFormModalProps) {
  const [values, setValues] = useState<MaladieFormValues>(() =>
    disease
      ? {
          name: disease.name,
          icd10Code: disease.icd10Code ?? "",
          alertThresholdCentre: disease.alertThresholdCentre,
          alertThresholdRegion: disease.alertThresholdRegion,
          description: disease.description ?? "",
        }
      : EMPTY,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isEdit = Boolean(disease);

  function updateField<K extends keyof MaladieFormValues>(
    key: K,
    value: MaladieFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  function validate(): boolean {
    const next: Record<string, string> = {};

    if (!values.name.trim()) {
      next.name = "Le nom de la maladie est requis.";
    }
    if (!values.icd10Code.trim()) {
      next.icd10Code = "Le code ICD-10 est requis.";
    }
    for (const field of ["alertThresholdCentre", "alertThresholdRegion"] as const) {
      if (!Number.isInteger(values[field]) || values[field] < 1 || values[field] > 2147483647) {
        next[field] = "Saisissez un entier entre 1 et 2 147 483 647.";
      }
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
      icd10Code: values.icd10Code.trim().toUpperCase(),
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Modifier la maladie" : "Ajouter une maladie"}
      description="Renseignez les informations de la maladie."
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" form="disease-form">
            {isEdit ? "Enregistrer" : "Ajouter"}
          </Button>
        </>
      }
    >
      <form
        id="disease-form"
        onSubmit={handleSubmit}
        className="space-y-4"
        noValidate
      >
        <Input
          label="Nom de la maladie"
          value={values.name}
          onChange={(e) => updateField("name", e.target.value)}
          placeholder="Ex. Paludisme"
          error={errors.name}
          autoFocus
        />
          <Input
            label="Code ICD-10"
            value={values.icd10Code}
            onChange={(e) => updateField("icd10Code", e.target.value)}
            placeholder="Ex. B54"
            error={errors.icd10Code}
          />
        <div className="grid gap-4 rounded-xl border border-border bg-bg-muted/30 p-4 sm:grid-cols-2">
          {([
            ["alertThresholdCentre", "Seuil d'alerte — Centre de santé", "Nombre de cas confirmés dans un même établissement sur la fenêtre de surveillance."],
            ["alertThresholdRegion", "Seuil d'alerte — Zone administrative", "Nombre de cas confirmés cumulés sur toute la zone, tous établissements confondus, sur la même fenêtre."],
          ] as const).map(([field, label, hint]) => (
            <Input key={field} label={label} hint={hint} type="number" min={1} max={2147483647} step={1}
              value={Number.isFinite(values[field]) ? values[field] : ""}
              onChange={(e) => updateField(field, e.target.value === "" ? NaN : Number(e.target.value))}
              error={errors[field]} />
          ))}
        </div>
        <Textarea
          label="Description / Consignes"
          value={values.description}
          onChange={(e) => updateField("description", e.target.value)}
          rows={4}
          placeholder="Description clinique et consignes de déclaration..."
        />
      </form>
    </Modal>
  );
}
