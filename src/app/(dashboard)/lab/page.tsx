"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FlaskConical, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";

interface PendingCase {
  id: number;
  patient: { anonymousCode: string; age: number | null; gender: string | null };
  maladie: { name: string };
  centre: { name: string; zone: { name: string } | null };
  agent: { name: string };
  diagnosisDate: string;
  symptoms: string | null;
  diagnosticStatus: string;
}

async function fetchPendingCases(): Promise<PendingCase[]> {
  const res = await fetch("/api/cas/laboratoire");
  if (!res.ok) throw new Error("Impossible de charger les cas.");
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export default function LaboratoirePage() {
  const { toast } = useToast();
  const [cases, setCases] = useState<PendingCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [centreFilter, setCentreFilter] = useState("");
  const [result, setResult] = useState<Record<number, { labResult: string; status: string }>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setCases(await fetchPendingCases());
    } catch (e) {
      toast({ title: "Erreur", description: e instanceof Error ? e.message : "Erreur de chargement.", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await fetchPendingCases();
        if (active) setCases(data);
      } catch (e) {
        if (active) toast({ title: "Erreur", description: e instanceof Error ? e.message : "Erreur de chargement.", variant: "error" });
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [toast]);

  const centreOptions = useMemo(() => {
    const names = new Set(cases.map((c) => c.centre.name));
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [cases]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return cases.filter((c) => {
      const matchSearch = !q || c.patient.anonymousCode.toLowerCase().includes(q) || c.maladie.name.toLowerCase().includes(q);
      const matchCentre = !centreFilter || c.centre.name === centreFilter;
      return matchSearch && matchCentre;
    });
  }, [cases, search, centreFilter]);

  async function submitResult(id: number) {
    const data = result[id];
    if (!data?.labResult || !data?.status) {
      toast({ title: "Champs requis", description: "Renseignez le résultat et le statut.", variant: "warning" });
      return;
    }
    try {
      const res = await fetch(`/api/cas/${id}/result`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ labResult: data.labResult, diagnosticStatus: data.status }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? "Impossible d'enregistrer le résultat.");
      }
      toast({ title: "Résultat enregistré", description: `Cas #${id} → ${data.status}.`, variant: "success" });
      await load();
    } catch (e) {
      toast({ title: "Erreur", description: e instanceof Error ? e.message : "Erreur.", variant: "error" });
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Laboratoire"
        description="Cas suspects en attente d'analyse."
      />

      <Card className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex-1">
            <Input
              icon={Search}
              placeholder="Rechercher par code patient ou maladie..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Rechercher"
            />
          </div>
          <Select
            aria-label="Filtrer par centre"
            value={centreFilter}
            onChange={(e) => setCentreFilter(e.target.value)}
            placeholder="Tous les centres"
            options={centreOptions.map((name) => ({ value: name, label: name }))}
            className="lg:w-56"
          />
        </div>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          icon={FlaskConical}
          title={loading ? "Chargement..." : "Aucun cas en attente"}
          description={loading ? "Récupération des cas..." : "Tous les cas suspects ont été analysés."}
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((c) => {
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
                      {c.centre.name} · {c.centre.zone?.name ?? "—"} · Déclaré par{" "}
                      {c.agent.name} · {formatDate(c.diagnosisDate)}
                    </p>
                    {c.symptoms ? (
                      <p className="mt-1 text-sm text-text-muted">{c.symptoms}</p>
                    ) : null}
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                    <Input
                      label="Résultat"
                      value={value?.labResult ?? ""}
                      onChange={(e) =>
                        setResult((prev) => ({ ...prev, [c.id]: { labResult: e.target.value, status: prev[c.id]?.status ?? "" } }))
                      }
                      placeholder="Positif / Négatif"
                      className="sm:w-44"
                    />
                    <Select
                      label="Statut"
                      value={value?.status ?? ""}
                      onChange={(e) =>
                        setResult((prev) => ({ ...prev, [c.id]: { labResult: prev[c.id]?.labResult ?? "", status: e.target.value } }))
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
    </div>
  );
}