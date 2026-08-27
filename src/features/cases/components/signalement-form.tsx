"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type {
  SignalementOptions,
  SignalementPayload,
} from "@/features/cases/types";

interface LockedCentre {
  regionId: number;
  districtId: number;
  centreId: number;
}

interface SignalementFormProps {
  options: SignalementOptions;
  initial?: SignalementPayload | null;
  lockedCentre?: LockedCentre | null;
  submitLabel?: string;
  onSubmit: (payload: SignalementPayload) => Promise<void>;
  onCancel?: () => void;
}

function toDateInputValue(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function SignalementForm({
  options,
  initial,
  lockedCentre,
  submitLabel = "Enregistrer le signalement",
  onSubmit,
  onCancel,
}: SignalementFormProps) {
  const isLocked = Boolean(lockedCentre);

  const [maladieId, setMaladieId] = useState(() =>
    initial ? String(initial.maladieId) : "",
  );
  const [regionId, setRegionId] = useState(() =>
    initial ? String(initial.regionId) : lockedCentre ? String(lockedCentre.regionId) : "",
  );
  const [districtId, setDistrictId] = useState(() =>
    initial ? String(initial.districtId) : lockedCentre ? String(lockedCentre.districtId) : "",
  );
  const [centreId, setCentreId] = useState(() =>
    initial ? String(initial.centreId) : lockedCentre ? String(lockedCentre.centreId) : "",
  );
  const [dateSignalement, setDateSignalement] = useState(() =>
    initial ? toDateInputValue(initial.dateSignalement) : new Date().toISOString().slice(0, 10),
  );
  const [nbCasSuspects, setNbCasSuspects] = useState(
    initial?.nbCasSuspects ?? 0,
  );
  const [nbCasConfirmes, setNbCasConfirmes] = useState(
    initial?.nbCasConfirmes ?? 0,
  );
  const [nbDeces, setNbDeces] = useState(initial?.nbDeces ?? 0);
  const [nbGueris, setNbGueris] = useState(initial?.nbGueris ?? 0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedRegion = useMemo(
    () => options.regions.find((r) => String(r.id) === regionId),
    [options.regions, regionId],
  );
  const selectedDistrict = useMemo(
    () => selectedRegion?.districts.find((d) => String(d.id) === districtId),
    [selectedRegion, districtId],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!maladieId || !regionId || !districtId || !centreId) {
      setError("Veuillez renseigner la maladie, la région, le district et l'établissement.");
      return;
    }
    if (!dateSignalement) {
      setError("La date du signalement est requise.");
      return;
    }
    if (nbCasSuspects + nbCasConfirmes === 0) {
      setError("Le signalement doit contenir au moins un cas suspect ou confirmé.");
      return;
    }

    setBusy(true);
    try {
      await onSubmit({
        maladieId: Number(maladieId),
        regionId: Number(regionId),
        districtId: Number(districtId),
        centreId: Number(centreId),
        dateSignalement,
        nbCasSuspects,
        nbCasConfirmes,
        nbDeces,
        nbGueris,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Impossible d'enregistrer le signalement.");
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

      <div className="grid gap-4 sm:grid-cols-3">
        <Select
          label="Région"
          value={regionId}
          onChange={(e) => {
            setRegionId(e.target.value);
            setDistrictId("");
            setCentreId("");
          }}
          placeholder="Sélectionner une région"
          options={options.regions.map((r) => ({
            value: String(r.id),
            label: r.name,
          }))}
          disabled={isLocked}
          required
        />
        <Select
          label="District"
          value={districtId}
          onChange={(e) => {
            setDistrictId(e.target.value);
            setCentreId("");
          }}
          placeholder="Sélectionner un district"
          options={(selectedRegion?.districts ?? []).map((d) => ({
            value: String(d.id),
            label: d.name,
          }))}
          disabled={isLocked || !regionId}
          required
        />
        <Select
          label="Établissement"
          value={centreId}
          onChange={(e) => setCentreId(e.target.value)}
          placeholder="Sélectionner un établissement"
          options={(selectedDistrict?.centres ?? []).map((c) => ({
            value: String(c.id),
            label: c.name,
          }))}
          disabled={isLocked || !districtId}
          required
        />
      </div>

      <Input
        label="Date du signalement"
        name="dateSignalement"
        type="date"
        value={dateSignalement}
        onChange={(e) => setDateSignalement(e.target.value)}
        required
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Input
          label="Cas suspects"
          type="number"
          min={0}
          value={nbCasSuspects}
          onChange={(e) => setNbCasSuspects(Number(e.target.value) || 0)}
        />
        <Input
          label="Cas confirmés"
          type="number"
          min={0}
          value={nbCasConfirmes}
          onChange={(e) => setNbCasConfirmes(Number(e.target.value) || 0)}
        />
        <Input
          label="Décès"
          type="number"
          min={0}
          value={nbDeces}
          onChange={(e) => setNbDeces(Number(e.target.value) || 0)}
        />
        <Input
          label="Guéris"
          type="number"
          min={0}
          value={nbGueris}
          onChange={(e) => setNbGueris(Number(e.target.value) || 0)}
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Annuler
          </Button>
        ) : null}
        <Button type="submit" loading={busy}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}