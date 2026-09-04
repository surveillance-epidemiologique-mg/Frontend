"use client";

import { useState } from "react";
import { FlaskConical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import {
  TEST_TYPES,
  type LabResultPayload,
  type PendingCase,
} from "@/features/lab/types";
import { formatDate } from "@/lib/utils";

interface ValidateCaseModalProps {
  cas: PendingCase | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (id: number, payload: LabResultPayload) => Promise<void>;
}

export function ValidateCaseModal({
  cas,
  open,
  onClose,
  onSubmit,
}: ValidateCaseModalProps) {
  const [labResult, setLabResult] = useState("");
  const [testType, setTestType] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!cas) {
      return;
    }
    if (!labResult.trim()) {
      setError("Le résultat biologique est requis.");
      return;
    }
    if (!testType) {
      setError("Le type de test est requis.");
      return;
    }
    if (status !== "Confirme" && status !== "Invalide") {
      setError("Le statut final est requis.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(cas.id, {
        labResult: labResult.trim(),
        testType,
        diagnosticStatus: status,
      });
      setLabResult("");
      setTestType("");
      setStatus("");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Impossible de valider le cas.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Valider le cas"
      description="Saisissez les résultats biologiques et le statut final."
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Annuler
          </Button>
          <Button type="submit" form="lab-result-form" loading={submitting}>
            <FlaskConical className="size-4" />
            {submitting ? "Enregistrement…" : "Valider le cas"}
          </Button>
        </>
      }
    >
      {cas ? (
        <form
          id="lab-result-form"
          onSubmit={handleSubmit}
          className="space-y-5"
          noValidate
        >
          {/* Récapitulatif du cas */}
          <div className="rounded-xl border border-border bg-bg-app p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm font-semibold text-text-main">
                {cas.patient.anonymousCode}
              </span>
              <Badge variant="warning">Suspect</Badge>
              <Badge variant="secondary">{cas.maladie.name}</Badge>
            </div>
            <p className="mt-1.5 text-sm text-text-muted">
              {cas.patient.namePatient ?? "—"} · {cas.centre.name}
              {cas.centre.zone?.name ? ` · ${cas.centre.zone.name}` : ""} ·
              Déclaré par {cas.agent.name} · {formatDate(cas.diagnosisDate)}
            </p>
            {cas.symptoms ? (
              <p className="mt-1.5 text-sm text-text-muted">{cas.symptoms}</p>
            ) : null}
          </div>

          {error ? (
            <p className="text-sm font-medium text-error">{error}</p>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Résultat biologique"
              value={labResult}
              onChange={(e) => setLabResult(e.target.value)}
              placeholder="Ex. Positif / Négatif / Indéterminé"
            />
            <Select
              label="Type de test"
              value={testType}
              onChange={(e) => setTestType(e.target.value)}
              placeholder="Sélectionner"
              options={TEST_TYPES.map((type) => ({
                value: type,
                label: type,
              }))}
            />
          </div>

          <Select
            label="Statut final"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            placeholder="Choisir le statut"
            options={[
              { value: "Confirme", label: "Confirmé" },
              { value: "Invalide", label: "Invalidé" },
            ]}
          />
        </form>
      ) : null}
    </Modal>
  );
}