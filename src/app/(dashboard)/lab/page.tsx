"use client";

import { useEffect, useMemo, useState } from "react";
import { FlaskConical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  buildCasQueryString,
  CaseFilters,
  EMPTY_FILTERS,
  type CaseFiltersValues,
  type FilterOption,
} from "@/components/cases/case-filters";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";

interface PendingCase {
  id: number;
  patient: {
    anonymousCode: string;
    namePatient: string | null;
    age: number | null;
    gender: string | null;
  };
  maladie: { name: string };
  centre: { name: string; zone: { name: string } | null };
  agent: { name: string };
  diagnosisDate: string;
  symptoms: string | null;
  diagnosticStatus: string;
}

export default function LaboratoirePage() {
  const { toast } = useToast();
  const [cases, setCases] = useState<PendingCase[]>([]);
  const [maladies, setMaladies] = useState<FilterOption[]>([]);
  const [centres, setCentres] = useState<FilterOption[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [filters, setFilters] = useState<CaseFiltersValues>(EMPTY_FILTERS);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<
    Record<number, { labResult: string; status: string }>
  >({});

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [m, c, y] = await Promise.all([
          fetch("/api/maladies").then((r) => (r.ok ? r.json() : [])),
          fetch("/api/centres").then((r) => (r.ok ? r.json() : [])),
          fetch("/api/cas/years").then((r) => (r.ok ? r.json() : [])),
        ]);
        if (!active) return;
        setMaladies(m);
        setCentres(c);
        setYears(y);
      } catch {
        // API indisponible : listes vides
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      void (async () => {
        try {
          const data = await fetch(
            `/api/cas/laboratoire${buildCasQueryString(filters)}`,
          ).then((r) => (r.ok ? r.json() : []));
          setCases(Array.isArray(data) ? data : []);
        } catch (e) {
          toast({
            title: "Erreur",
            description:
              e instanceof Error ? e.message : "Erreur de chargement.",
            variant: "error",
          });
          setCases([]);
        } finally {
          setLoading(false);
        }
      })();
    }, 300);
    return () => clearTimeout(id);
  }, [filters, toast]);

  const centreNames = useMemo(
    () => new Set(cases.map((c) => c.centre.name)),
    [cases],
  );

  async function submitResult(id: number) {
    const data = result[id];
    if (!data?.labResult || !data?.status) {
      toast({
        title: "Champs requis",
        description: "Renseignez le résultat et le statut.",
        variant: "warning",
      });
      return;
    }
    try {
      const res = await fetch(`/api/cas/${id}/result`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          labResult: data.labResult,
          diagnosticStatus: data.status,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(
          body?.message ?? "Impossible d'enregistrer le résultat.",
        );
      }
      toast({
        title: "Résultat enregistré",
        description: `Cas #${id} → ${data.status}.`,
        variant: "success",
      });
      setResult((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      const fresh = await fetch(
        `/api/cas/laboratoire${buildCasQueryString(filters)}`,
      ).then((r) => (r.ok ? r.json() : []));
      setCases(Array.isArray(fresh) ? fresh : []);
    } catch (e) {
      toast({
        title: "Erreur",
        description: e instanceof Error ? e.message : "Erreur.",
        variant: "error",
      });
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Laboratoire"
        description="Cas suspects en attente d'analyse."
      />

      <Card>
        <CaseFilters
          values={filters}
          onChange={setFilters}
          years={years}
          centres={centres}
          maladies={maladies}
          showStatut={false}
        />

        {cases.length === 0 ? (
          <EmptyState
            icon={FlaskConical}
            title={loading ? "Chargement…" : "Aucun cas en attente"}
            description={
              loading
                ? "Récupération des cas…"
                : centreNames.size
                  ? "Aucun cas ne correspond aux filtres sélectionnés."
                  : "Tous les cas suspects ont été analysés."
            }
          />
        ) : (
          <div className="space-y-4 p-4">
            {cases.map((c) => {
              const value = result[c.id];
              return (
                <Card key={c.id} className="p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm font-semibold text-text-main">
                          {c.patient.anonymousCode}
                        </span>
                        <Badge variant="warning">Suspect</Badge>
                        <Badge variant="secondary">{c.maladie.name}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-text-muted">
                        {c.patient.namePatient ?? "—"} · {c.centre.name} ·{" "}
                        {c.centre.zone?.name ?? "—"} · Déclaré par{" "}
                        {c.agent.name} · {formatDate(c.diagnosisDate)}
                      </p>
                      {c.symptoms ? (
                        <p className="mt-1 text-sm text-text-muted">
                          {c.symptoms}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                      <Input
                        label="Résultat"
                        value={value?.labResult ?? ""}
                        onChange={(e) =>
                          setResult((prev) => ({
                            ...prev,
                            [c.id]: {
                              labResult: e.target.value,
                              status: prev[c.id]?.status ?? "",
                            },
                          }))
                        }
                        placeholder="Positif / Négatif"
                        className="sm:w-44"
                      />
                      <Select
                        label="Statut"
                        value={value?.status ?? ""}
                        onChange={(e) =>
                          setResult((prev) => ({
                            ...prev,
                            [c.id]: {
                              labResult: prev[c.id]?.labResult ?? "",
                              status: e.target.value,
                            },
                          }))
                        }
                        placeholder="Choisir"
                        options={[
                          { value: "Confirme", label: "Confirmé" },
                          { value: "Invalide", label: "Invalidé" },
                        ]}
                        className="sm:w-40"
                      />
                      <Button onClick={() => submitResult(c.id)}>Valider</Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}