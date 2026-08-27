"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type {
  AlertNiveauRisque,
  AlerteOptions,
  AlertePayload,
} from "@/features/alerts/types";

const NIVEAUX: AlertNiveauRisque[] = [
  "Normal",
  "Surveillance",
  "Alerte",
  "Critique",
];

interface AlertFormProps {
  options: AlerteOptions;
  onSubmit: (payload: AlertePayload) => Promise<void>;
  onCancel?: () => void;
}

export function AlertForm({ options, onSubmit, onCancel }: AlertFormProps) {
  const [maladieId, setMaladieId] = useState("");
  const [regionId, setRegionId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [niveauRisque, setNiveauRisque] = useState<AlertNiveauRisque>("Alerte");
  const [detectedCaseCount, setDetectedCaseCount] = useState(1);
  const [commentaire, setCommentaire] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const region = useMemo(
    () => options.regions.find((r) => String(r.id) === regionId),
    [options.regions, regionId],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!maladieId || !regionId) {
      setError("Veuillez sélectionner une maladie et une région.");
      return;
    }

    setBusy(true);
    try {
      await onSubmit({
        maladieId: Number(maladieId),
        zoneId: districtId ? Number(districtId) : Number(regionId),
        niveauRisque,
        detectedCaseCount,
        commentaire: commentaire.trim() || undefined,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Impossible de créer l'alerte.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error ? <p className="text-sm text-error">{error}</p> : null}

      <Select
        label="Maladie"
        value={maladieId}
        onChange={(e) => setMaladieId(e.target.value)}
        placeholder="Sélectionner une maladie"
        options={options.maladies.map((m) => ({
          value: String(m.id),
          label: m.name,
        }))}
        required
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Région"
          value={regionId}
          onChange={(e) => {
            setRegionId(e.target.value);
            setDistrictId("");
          }}
          placeholder="Sélectionner une région"
          options={options.regions.map((r) => ({
            value: String(r.id),
            label: r.name,
          }))}
          required
        />
        <Select
          label="District (optionnel)"
          value={districtId}
          onChange={(e) => setDistrictId(e.target.value)}
          placeholder="Région entière"
          disabled={!regionId}
          options={(region?.districts ?? []).map((d) => ({
            value: String(d.id),
            label: d.name,
          }))}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Niveau de risque"
          value={niveauRisque}
          onChange={(e) => setNiveauRisque(e.target.value as AlertNiveauRisque)}
          options={NIVEAUX.map((n) => ({ value: n, label: n }))}
        />
        <Input
          label="Nombre de cas détectés"
          type="number"
          min={0}
          value={detectedCaseCount}
          onChange={(e) => setDetectedCaseCount(Number(e.target.value) || 0)}
        />
      </div>

      <Textarea
        label="Commentaire"
        value={commentaire}
        onChange={(e) => setCommentaire(e.target.value)}
        placeholder="Contexte, mesures engagées..."
        rows={3}
      />

      <div className="flex justify-end gap-3 pt-2">
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Annuler
          </Button>
        ) : null}
        <Button type="submit" loading={busy}>
          Créer l&apos;alerte
        </Button>
      </div>
    </form>
  );
}