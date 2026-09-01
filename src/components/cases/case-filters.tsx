"use client";

import { useState } from "react";
import { ChevronDown, RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface CaseFiltersValues {
  search: string;
  year: string;
  centreId: string;
  maladieId: string;
  gender: string;
  ageRange: string;
  statut: string;
}

export const EMPTY_FILTERS: CaseFiltersValues = {
  search: "",
  year: "",
  centreId: "",
  maladieId: "",
  gender: "",
  ageRange: "",
  statut: "",
};

export const AGE_RANGE_OPTIONS = [
  { value: "0-5", label: "0 – 5 ans" },
  { value: "6-17", label: "6 – 17 ans" },
  { value: "18-35", label: "18 – 35 ans" },
  { value: "36-60", label: "36 – 60 ans" },
  { value: "60+", label: "60 ans et +" },
];

const GENDER_OPTIONS = [
  { value: "M", label: "Homme" },
  { value: "F", label: "Femme" },
];

const STATUT_OPTIONS = [
  { value: "Suspect", label: "Suspect" },
  { value: "Probable", label: "Probable" },
  { value: "Confirme", label: "Confirmé" },
  { value: "Invalide", label: "Invalidé" },
];

export interface FilterOption {
  id: number;
  name: string;
}

export interface LockedCentre {
  id: number;
  name: string;
}

interface CaseFiltersProps {
  values: CaseFiltersValues;
  onChange: (values: CaseFiltersValues) => void;
  years: number[];
  centres: FilterOption[];
  maladies: FilterOption[];
  showStatut?: boolean;
  lockedCentre?: LockedCentre | null;
}

export function buildCasQueryString(f: CaseFiltersValues): string {
  const params = new URLSearchParams();
  if (f.search.trim()) params.set("search", f.search.trim());
  if (f.year) params.set("year", f.year);
  if (f.centreId) params.set("centreId", f.centreId);
  if (f.maladieId) params.set("maladieId", f.maladieId);
  if (f.gender) params.set("gender", f.gender);
  if (f.ageRange) params.set("ageRange", f.ageRange);
  if (f.statut) params.set("statut", f.statut);
  const s = params.toString();
  return s ? `?${s}` : "";
}

export function CaseFilters({
  values,
  onChange,
  years,
  centres,
  maladies,
  showStatut = true,
  lockedCentre = null,
}: CaseFiltersProps) {
  const [open, setOpen] = useState(false);

  const hasActive = Object.values(values).some(Boolean);

  function set<K extends keyof CaseFiltersValues>(key: K, value: string) {
    onChange({ ...values, [key]: value });
  }

  function reset() {
    onChange(EMPTY_FILTERS);
  }

  return (
    <div className="border-b border-border p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
          <Input
            aria-label="Rechercher un patient"
            placeholder="Nom du patient, code anonyme…"
            value={values.search}
            onChange={(e) => set("search", e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
          >
            Filtres
            <ChevronDown
              className={cn(
                "size-4 transition-transform duration-200",
                open && "rotate-180",
              )}
            />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={reset}
            disabled={!hasActive}
          >
            <RotateCcw className="size-4" />
            Réinitialiser
          </Button>
        </div>
      </div>

      {open ? (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Select
            label="Année"
            value={values.year}
            onChange={(e) => set("year", e.target.value)}
            placeholder="Toutes les années"
            options={years.map((y) => ({ value: String(y), label: String(y) }))}
          />
          {lockedCentre ? (
            <div className="space-y-1.5">
              <Select
                label="Centre de santé"
                value={String(lockedCentre.id)}
                onChange={() => {}}
                options={[{ value: String(lockedCentre.id), label: lockedCentre.name }]}
                disabled
              />
              <p className="text-xs text-text-muted">Centre rattaché à votre compte.</p>
            </div>
          ) : (
            <Select
              label="Centre de santé"
              value={values.centreId}
              onChange={(e) => set("centreId", e.target.value)}
              placeholder="Tous les centres"
              options={centres.map((c) => ({
                value: String(c.id),
                label: c.name,
              }))}
            />
          )}
          <Select
            label="Maladie"
            value={values.maladieId}
            onChange={(e) => set("maladieId", e.target.value)}
            placeholder="Toutes les maladies"
            options={maladies.map((m) => ({
              value: String(m.id),
              label: m.name,
            }))}
          />
          <Select
            label="Sexe"
            value={values.gender}
            onChange={(e) => set("gender", e.target.value)}
            placeholder="Tous"
            options={GENDER_OPTIONS}
          />
          <Select
            label="Tranche d'âge"
            value={values.ageRange}
            onChange={(e) => set("ageRange", e.target.value)}
            placeholder="Toutes"
            options={AGE_RANGE_OPTIONS}
          />
          {showStatut ? (
            <Select
              label="Statut"
              value={values.statut}
              onChange={(e) => set("statut", e.target.value)}
              placeholder="Tous"
              options={STATUT_OPTIONS}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}