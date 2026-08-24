"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
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
  alertThreshold: 1,
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
          alertThreshold: disease.alertThreshold,
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
    if (!Number.isFinite(values.alertThreshold) || values.alertThreshold < 1) {
      next.alertThreshold = "Le seuil doit être un nombre positif.";
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
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Code ICD-10"
            value={values.icd10Code}
            onChange={(e) => updateField("icd10Code", e.target.value)}
            placeholder="Ex. B54"
            error={errors.icd10Code}
          />
          <Input
            label="Seuil d'alerte"
            type="number"
            min={1}
            value={
              Number.isFinite(values.alertThreshold)
                ? values.alertThreshold
                : ""
            }
            onChange={(e) =>
              updateField("alertThreshold", Number(e.target.value))
            }
            error={errors.alertThreshold}
          />
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