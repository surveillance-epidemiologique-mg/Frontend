"use client";

import { useEffect, useState } from "react";
import { Activity, Plus } from "lucide-react";
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
import { DataTable, type Column } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { ROLES } from "@/config/navigation";
import { formatDate } from "@/lib/utils";

interface CasRow {
  id: number;
  patient: { id: number; namePatient: string | null; anonymousCode: string };
  maladie: { name: string };
  centre: { name: string };
  agent: { id: number; name: string };
  declarationDate: string;
  diagnosisDate: string;
  diagnosticStatus: string;
  clinicalOutcome: string;
  symptoms: string | null;
}

const EMPTY_FORM = {
  namePatient: "",
  age: "",
  gender: "",
  maladieId: "",
  centreId: "",
  symptoms: "",
  diagnosticStatus: "Suspect",
};
type FormKey = keyof typeof EMPTY_FORM;

const STATUS_BADGE: Record<string, "suspect" | "warning" | "confirmed" | "danger"> = {
  Suspect: "suspect",
  Probable: "warning",
  Confirme: "confirmed",
  Invalide: "danger",
};

const STATUS_LABEL: Record<string, string> = {
  Suspect: "Suspect",
  Probable: "Probable",
  Confirme: "Confirmé",
  Invalide: "Invalidé",
};

const DIAGNOSTIC_STATUS_OPTIONS = [
  { value: "Suspect", label: "Suspect" },
  { value: "Confirme", label: "Confirmé" },
];

function statusBadge(statut: string) {
  return STATUS_BADGE[statut] ?? "secondary";
}

export default function CasCliniquePage() {
  const { toast } = useToast();
  const [me, setMe] = useState<{ role: string; centreId: number | null } | null>(
    null,
  );
  const [maladies, setMaladies] = useState<FilterOption[]>([]);
  const [centres, setCentres] = useState<FilterOption[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [casList, setCasList] = useState<CasRow[]>([]);
  const [filters, setFilters] = useState<CaseFiltersValues>(EMPTY_FILTERS);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<FormKey, string>>>({});

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [meData, m, c, y] = await Promise.all([
          fetch("/api/auth/me").then((r) => (r.ok ? r.json() : null)),
          fetch("/api/maladies").then((r) => (r.ok ? r.json() : [])),
          fetch("/api/centres").then((r) => (r.ok ? r.json() : [])),
          fetch("/api/cas/years").then((r) => (r.ok ? r.json() : [])),
        ]);
        if (!active) return;
        setMe(
          meData
            ? {
                role: meData.role?.name ?? "",
                centreId: meData.centreId ?? null,
              }
            : null,
        );
        setMaladies(m);
        setCentres(c);
        setYears(y);
      } catch {
        // API indisponible : on laisse les listes vides
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
          const cs = await fetch(`/api/cas${buildCasQueryString(filters)}`).then(
            (r) => (r.ok ? r.json() : []),
          );
          setCasList(cs);
        } catch {
          setCasList([]);
        } finally {
          setLoading(false);
        }
      })();
    }, 300);
    return () => clearTimeout(id);
  }, [filters]);

  const isMedecin = me?.role === ROLES.MEDECIN;
  const medecinCentre = isMedecin
    ? centres.find((c) => c.id === me?.centreId)
    : undefined;

  function updateField(key: FormKey, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function resetForm() {
    setForm({
      ...EMPTY_FORM,
      centreId: isMedecin && me?.centreId ? String(me.centreId) : "",
    });
    setErrors({});
  }

  function openModal() {
    resetForm();
    setModalOpen(true);
  }

  function validate(): boolean {
    const next: Partial<Record<FormKey, string>> = {};
    if (!form.namePatient.trim()) {
      next.namePatient = "Le nom du patient est requis.";
    } else if (form.namePatient.trim().length < 2) {
      next.namePatient = "Le nom doit contenir au moins 2 caractères.";
    }
    if (!form.maladieId) {
      next.maladieId = "La maladie est requise.";
    }
    if (!isMedecin && !form.centreId) {
      next.centreId = "Le centre de santé est requis.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function declareCase(event: React.FormEvent) {
    event.preventDefault();
    if (!validate()) {
      return;
    }

    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        newPatient: {
          namePatient: form.namePatient.trim(),
          age: form.age ? Number(form.age) : undefined,
          gender: form.gender || undefined,
        },
        maladieId: Number(form.maladieId),
        symptoms: form.symptoms || undefined,
        diagnosticStatus: form.diagnosticStatus,
      };
      if (!isMedecin) {
        payload.centreId = Number(form.centreId);
      }

      const res = await fetch("/api/cas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(
          typeof body?.message === "string"
            ? body.message
            : "Impossible de déclarer le cas.",
        );
      }

      toast({
        title: "Cas déclaré",
        description: `Cas #${body.id} enregistré comme ${body.diagnosticStatus} (${body.patient.anonymousCode}).`,
        variant: "success",
      });
      setModalOpen(false);
      resetForm();
      setFilters(EMPTY_FILTERS);
      const cs = await fetch("/api/cas").then((r) => (r.ok ? r.json() : []));
      setCasList(cs);
    } catch (e) {
      toast({
        title: "Erreur",
        description: e instanceof Error ? e.message : "Erreur.",
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  }

  const columns: Column<CasRow>[] = [
    {
      key: "patient",
      header: "Nom du patient",
      cell: (c) => (
        <span className="font-medium text-text-main">
          {c.patient.namePatient ?? "—"}
        </span>
      ),
    },
    {
      key: "code",
      header: "Code anonyme",
      cell: (c) => (
        <span className="font-mono text-xs font-medium text-text-muted">
          {c.patient.anonymousCode}
        </span>
      ),
    },
    {
      key: "maladie",
      header: "Maladie",
      cell: (c) => <span>{c.maladie.name}</span>,
    },
    {
      key: "statut",
      header: "Statut",
      cell: (c) => (
        <Badge variant={statusBadge(c.diagnosticStatus)} dot>
          {STATUS_LABEL[c.diagnosticStatus] ?? c.diagnosticStatus}
        </Badge>
      ),
    },
    {
      key: "medecin",
      header: "Médecin",
      cell: (c) => <span className="text-text-muted">{c.agent.name}</span>,
    },
    {
      key: "date",
      header: "Date de déclaration",
      cell: (c) => (
        <span className="whitespace-nowrap text-text-muted">
          {formatDate(c.declarationDate)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cas clinique"
        description="Déclarer un cas suspect ou confirmé et suivre les cas de votre périmètre."
      >
        <Button onClick={openModal}>
          <Plus className="size-4" />
          Déclarer un cas
        </Button>
      </PageHeader>

      <Card>
        <CaseFilters
          values={filters}
          onChange={setFilters}
          years={years}
          centres={centres}
          maladies={maladies}
          lockedCentre={
            isMedecin && medecinCentre
              ? { id: medecinCentre.id, name: medecinCentre.name }
              : null
          }
        />

        <DataTable
          columns={columns}
          data={casList}
          getRowId={(c) => String(c.id)}
          loading={loading}
          ariaLabel="Liste des cas déclarés"
          emptyState={
            <EmptyState
              icon={Activity}
              title={loading ? "Chargement…" : "Aucun cas déclaré"}
              description={
                loading
                  ? "Récupération des cas en cours."
                  : "Les cas déclarés apparaîtront ici. Utilisez « Déclarer un cas » pour en créer un."
              }
            />
          }
        />
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Déclarer un cas"
        description="Créer un nouveau patient anonyme, puis renseigner le cas."
        size="lg"
      >
        <form onSubmit={declareCase} className="space-y-5">
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-text-main">
              Nouveau patient
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Nom du patient"
                value={form.namePatient}
                onChange={(e) => updateField("namePatient", e.target.value)}
                placeholder="Patient 01"
                error={errors.namePatient}
              />
              <Input
                label="Âge (années)"
                type="number"
                min={0}
                value={form.age}
                onChange={(e) => updateField("age", e.target.value)}
                placeholder="34"
              />
              <Select
                label="Sexe"
                value={form.gender}
                onChange={(e) => updateField("gender", e.target.value)}
                placeholder="—"
                options={[
                  { value: "M", label: "Masculin" },
                  { value: "F", label: "Féminin" },
                ]}
              />
            </div>
          </section>

          <section className="space-y-3 border-t border-border pt-5">
            <h3 className="text-sm font-semibold text-text-main">Cas</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Maladie"
                value={form.maladieId}
                onChange={(e) => updateField("maladieId", e.target.value)}
                placeholder={loading ? "Chargement…" : "Sélectionner une maladie"}
                options={maladies.map((m) => ({
                  value: String(m.id),
                  label: m.name,
                }))}
                error={errors.maladieId}
              />
              {isMedecin ? (
                <div className="space-y-1.5">
                  <Select
                    label="Centre de santé"
                    value={form.centreId}
                    onChange={() => {}}
                    options={
                      medecinCentre
                        ? [{ value: String(medecinCentre.id), label: medecinCentre.name }]
                        : []
                    }
                    disabled
                  />
                  <p className="text-xs text-text-muted">
                    Centre rattaché à votre compte.
                  </p>
                </div>
              ) : (
                <Select
                  label="Centre de santé"
                  value={form.centreId}
                  onChange={(e) => updateField("centreId", e.target.value)}
                  placeholder={
                    loading ? "Chargement…" : "Sélectionner un centre"
                  }
                  options={centres.map((c) => ({
                    value: String(c.id),
                    label: c.name,
                  }))}
                  error={errors.centreId}
                />
              )}
              <Select
                label="Statut diagnostique"
                value={form.diagnosticStatus}
                onChange={(e) => updateField("diagnosticStatus", e.target.value)}
                options={DIAGNOSTIC_STATUS_OPTIONS}
              />
              <Input
                label="Symptômes"
                value={form.symptoms}
                onChange={(e) => updateField("symptoms", e.target.value)}
                placeholder="Fièvre, céphalées…"
              />
            </div>
            <p className="text-xs text-text-muted">
              La date du diagnostic et la zone de résidence sont renseignées
              automatiquement côté serveur.
            </p>
          </section>

          <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
            >
              Annuler
            </Button>
            <Button type="submit" loading={submitting}>
              <Activity className="size-4" />
              {submitting ? "Enregistrement…" : "Déclarer le cas"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}