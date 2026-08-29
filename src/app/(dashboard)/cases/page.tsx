"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";

interface Option {
  id: number;
  name: string;
}

interface CasRow {
  id: number;
  patient: { anonymousCode: string };
  maladie: { name: string };
  centre: { name: string };
  diagnosisDate: string;
  diagnosticStatus: string;
  clinicalOutcome: string;
  symptoms: string | null;
}

const EMPTY_FORM = {
  patientId: "",
  maladieId: "",
  centreId: "",
  symptoms: "",
  diagnosisDate: "",
  latitude: "",
  longitude: "",
};

export default function CasCliniquePage() {
  const { toast } = useToast();
  const [patients, setPatients] = useState<Option[]>([]);
  const [maladies, setMaladies] = useState<Option[]>([]);
  const [centres, setCentres] = useState<Option[]>([]);
  const [casList, setCasList] = useState<CasRow[]>([]);
  const [statutFilter, setStatutFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [p, m, c, cs] = await Promise.all([
          fetch("/api/patients").then((r) => (r.ok ? r.json() : [])),
          fetch("/api/maladies").then((r) => (r.ok ? r.json() : [])),
          fetch("/api/centres").then((r) => (r.ok ? r.json() : [])),
          fetch("/api/cas/mes-cas").then((r) => (r.ok ? r.json() : [])),
        ]);
        if (!active) return;
        setPatients(p);
        setMaladies(m);
        setCentres(c);
        setCasList(cs);
      } catch {
        // API indisponible : champs vides
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!statutFilter) return casList;
    return casList.filter((c) => c.diagnosticStatus === statutFilter);
  }, [casList, statutFilter]);

  async function reloadCases() {
    const cs = await fetch("/api/cas/mes-cas").then((r) => (r.ok ? r.json() : []));
    setCasList(cs);
  }

  async function declareCase(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/cas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: Number(form.patientId),
          maladieId: Number(form.maladieId),
          centreId: Number(form.centreId),
          symptoms: form.symptoms || undefined,
          diagnosisDate: form.diagnosisDate,
          latitude: form.latitude ? Number(form.latitude) : undefined,
          longitude: form.longitude ? Number(form.longitude) : undefined,
        }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(
          typeof body?.message === "string" ? body.message : "Impossible de déclarer le cas.",
        );
      }
      toast({ title: "Cas déclaré", description: `Cas #${body.id} enregistré comme suspect.`, variant: "success" });
      setForm(EMPTY_FORM);
      await reloadCases();
    } catch (e) {
      toast({ title: "Erreur", description: e instanceof Error ? e.message : "Erreur.", variant: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  function updateField(key: keyof typeof EMPTY_FORM, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cas clinique"
        description="Déclarer un cas suspect et suivre vos déclarations."
      >
        <Button onClick={() => document.getElementById("declare-form")?.scrollIntoView({ behavior: "smooth" })}>
          <Plus className="size-4" />
          Déclarer un cas
        </Button>
      </PageHeader>

      {/* Déclaration */}
      <Card id="declare-form" className="p-6">
        <h2 className="mb-4 text-base font-semibold text-text-main">
          Déclarer un cas suspect
        </h2>
        <form onSubmit={declareCase} className="grid gap-4 md:grid-cols-2">
          <Select
            label="Patient anonyme"
            value={form.patientId}
            onChange={(e) => updateField("patientId", e.target.value)}
            placeholder={loading ? "Chargement..." : "Sélectionner un patient"}
            options={patients.map((p) => ({ value: String(p.id), label: p.name }))}
          />
          <Select
            label="Maladie"
            value={form.maladieId}
            onChange={(e) => updateField("maladieId", e.target.value)}
            placeholder={loading ? "Chargement..." : "Sélectionner une maladie"}
            options={maladies.map((m) => ({ value: String(m.id), label: m.name }))}
          />
          <Select
            label="Centre de santé"
            value={form.centreId}
            onChange={(e) => updateField("centreId", e.target.value)}
            placeholder={loading ? "Chargement..." : "Sélectionner un centre"}
            options={centres.map((c) => ({ value: String(c.id), label: c.name }))}
          />
          <Input
            label="Date du diagnostic"
            type="date"
            value={form.diagnosisDate}
            onChange={(e) => updateField("diagnosisDate", e.target.value)}
            required
          />
          <Input
            label="Symptômes"
            value={form.symptoms}
            onChange={(e) => updateField("symptoms", e.target.value)}
            placeholder="Fièvre, céphalées..."
            className="md:col-span-2"
          />
          <Input
            label="Latitude (GPS)"
            type="number"
            step="any"
            value={form.latitude}
            onChange={(e) => updateField("latitude", e.target.value)}
            placeholder="-18.91"
          />
          <Input
            label="Longitude (GPS)"
            type="number"
            step="any"
            value={form.longitude}
            onChange={(e) => updateField("longitude", e.target.value)}
            placeholder="47.53"
          />
          <div className="md:col-span-2">
            <Button type="submit" loading={submitting}>
              <Activity className="size-4" />
              {submitting ? "Enregistrement..." : "Déclarer le cas"}
            </Button>
          </div>
        </form>
      </Card>

      {/* Mes cas */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text-main">Mes cas déclarés</h2>
          <p className="text-sm text-text-muted">{casList.length} déclaration(s).</p>
        </div>
        <Select
          aria-label="Filtrer par statut"
          value={statutFilter}
          onChange={(e) => setStatutFilter(e.target.value)}
          placeholder="Tous les statuts"
          options={[
            { value: "Suspect", label: "Suspect" },
            { value: "Confirme", label: "Confirmé" },
            { value: "Invalide", label: "Invalidé" },
          ]}
          className="sm:w-48"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Activity}
          title={loading ? "Chargement..." : "Aucun cas déclaré"}
          description="Vos déclarations apparaîtront ici."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => (
            <Card key={c.id} className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm font-semibold text-text-main">
                    {c.patient.anonymousCode}
                  </span>
                  <Badge variant="secondary">{c.maladie.name}</Badge>
                  <Badge variant={c.diagnosticStatus === "Confirme" ? "success" : c.diagnosticStatus === "Invalide" ? "danger" : "warning"}>
                    {c.diagnosticStatus}
                  </Badge>
                  <Badge variant="outline">{c.clinicalOutcome}</Badge>
                </div>
                <p className="mt-1 text-sm text-text-muted">
                  {c.centre.name} · {formatDate(c.diagnosisDate)}
                </p>
                {c.symptoms ? (
                  <p className="mt-1 text-sm text-text-muted">{c.symptoms}</p>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}