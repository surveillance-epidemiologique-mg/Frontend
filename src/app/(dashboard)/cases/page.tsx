"use client";

import { useEffect, useState } from "react";
import { Activity, Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { ActionMenu } from "@/components/ui/action-menu";
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
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
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
  patient: {
    id: number;
    namePatient: string | null;
    anonymousCode: string;
    age: number | null;
    gender: string | null;
  };
  maladie: { name: string };
  centre: { name: string };
  agent: { id: number; name: string };
  declarationDate: string;
  diagnosisDate: string;
  diagnosticStatus: string;
  clinicalOutcome: string;
  symptoms: string | null;
}

interface PatientCas {
  id: number;
  maladie: { name: string };
  agent: { name: string };
  centre: { name: string };
  diagnosticStatus: string;
  clinicalOutcome: string;
  declarationDate: string;
}

interface PatientDetail {
  id: number;
  namePatient: string | null;
  anonymousCode: string;
  age: number | null;
  gender: string | null;
  residenceZone: { name: string } | null;
  cas: PatientCas[];
}

interface PatientLight {
  id: number;
  namePatient: string | null;
  anonymousCode: string;
  age: number | null;
  gender: string | null;
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

function genderLabel(gender: string | null): string {
  if (gender === "M") return "Homme";
  if (gender === "F") return "Femme";
  return "—";
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

  // Actions patient
  const [viewPatient, setViewPatient] = useState<PatientDetail | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [editPatient, setEditPatient] = useState<PatientLight | null>(null);
  const [editForm, setEditForm] = useState({
    namePatient: "",
    age: "",
    gender: "",
  });
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [deletePatient, setDeletePatient] = useState<PatientLight | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

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

  async function reload() {
    const cs = await fetch(`/api/cas${buildCasQueryString(filters)}`).then(
      (r) => (r.ok ? r.json() : []),
    );
    setCasList(cs);
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
      await reload();
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

  async function openView(patientId: number) {
    setViewPatient(null);
    setViewLoading(true);
    try {
      const res = await fetch(`/api/patients/${patientId}`);
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(
          typeof body?.message === "string"
            ? body.message
            : "Impossible de charger le patient.",
        );
      }
      setViewPatient(await res.json());
    } catch (e) {
      toast({
        title: "Erreur",
        description: e instanceof Error ? e.message : "Erreur.",
        variant: "error",
      });
    } finally {
      setViewLoading(false);
    }
  }

  function openEdit(patient: PatientLight) {
    setEditPatient(patient);
    setEditForm({
      namePatient: patient.namePatient ?? "",
      age: patient.age != null ? String(patient.age) : "",
      gender: patient.gender ?? "",
    });
  }

  async function submitEdit(event: React.FormEvent) {
    event.preventDefault();
    if (!editPatient) {
      return;
    }
    if (editForm.namePatient.trim().length < 2) {
      toast({
        title: "Nom invalide",
        description: "Le nom doit contenir au moins 2 caractères.",
        variant: "warning",
      });
      return;
    }

    setEditSubmitting(true);
    try {
      const res = await fetch(`/api/patients/${editPatient.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          namePatient: editForm.namePatient.trim(),
          age: editForm.age ? Number(editForm.age) : undefined,
          gender: editForm.gender || undefined,
        }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(
          typeof body?.message === "string"
            ? body.message
            : "Impossible de modifier le patient.",
        );
      }
      toast({
        title: "Patient modifié",
        description: `Patient ${body.anonymousCode} mis à jour.`,
        variant: "success",
      });
      setEditPatient(null);
      await reload();
    } catch (e) {
      toast({
        title: "Erreur",
        description: e instanceof Error ? e.message : "Erreur.",
        variant: "error",
      });
    } finally {
      setEditSubmitting(false);
    }
  }

  async function confirmDelete() {
    if (!deletePatient) {
      return;
    }
    setDeleteSubmitting(true);
    try {
      const res = await fetch(`/api/patients/${deletePatient.id}`, {
        method: "DELETE",
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(
          typeof body?.message === "string"
            ? body.message
            : "Impossible de supprimer le patient.",
        );
      }
      toast({
        title: "Patient supprimé",
        description: `${deletePatient.namePatient ?? deletePatient.anonymousCode} a été supprimé.`,
        variant: "success",
      });
      setDeletePatient(null);
      await reload();
    } catch (e) {
      toast({
        title: "Suppression impossible",
        description: e instanceof Error ? e.message : "Erreur.",
        variant: "error",
      });
    } finally {
      setDeleteSubmitting(false);
    }
  }

  const columns: Column<CasRow>[] = [
    {
      key: "patient",
      header: "Nom du patient",
      cell: (c) => (
        <button
          type="button"
          onClick={() => void openView(c.patient.id)}
          className="block max-w-[14rem] truncate text-left font-medium text-primary hover:underline"
          title={c.patient.namePatient ?? undefined}
        >
          {c.patient.namePatient ?? "—"}
        </button>
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
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (c) => (
        <ActionMenu
          ariaLabel={`Actions pour ${c.patient.namePatient ?? c.patient.anonymousCode}`}
          items={[
            {
              label: "Voir le patient",
              icon: Eye,
              onClick: () => void openView(c.patient.id),
            },
            {
              label: "Modifier le patient",
              icon: Pencil,
              onClick: () => openEdit(c.patient),
            },
            {
              label: "Supprimer le patient",
              icon: Trash2,
              danger: true,
              onClick: () => setDeletePatient(c.patient),
            },
          ]}
        />
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

      {/* Déclaration de cas */}
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

      {/* Voir un patient */}
      <Modal
        open={viewPatient !== null || viewLoading}
        onClose={() => setViewPatient(null)}
        title="Détail du patient"
        size="lg"
      >
        {viewLoading ? (
          <div className="py-8 text-center text-sm text-text-muted">
            Chargement…
          </div>
        ) : viewPatient ? (
          <div className="space-y-5">
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailItem label="Nom" value={viewPatient.namePatient ?? "—"} />
              <DetailItem
                label="Code anonyme"
                value={
                  <span className="font-mono">{viewPatient.anonymousCode}</span>
                }
              />
              <DetailItem
                label="Âge"
                value={viewPatient.age != null ? `${viewPatient.age} ans` : "—"}
              />
              <DetailItem
                label="Sexe"
                value={genderLabel(viewPatient.gender)}
              />
              <DetailItem
                label="Zone de résidence"
                value={viewPatient.residenceZone?.name ?? "—"}
              />
            </dl>

            <div>
              <h4 className="mb-2 text-sm font-semibold text-text-main">
                Historique des cas ({viewPatient.cas.length})
              </h4>
              {viewPatient.cas.length === 0 ? (
                <p className="text-sm text-text-muted">
                  Aucun cas déclaré pour ce patient.
                </p>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-bg-muted/60">
                        <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                          Maladie
                        </th>
                        <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                          Statut
                        </th>
                        <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                          Médecin
                        </th>
                        <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {viewPatient.cas.map((c) => (
                        <tr key={c.id}>
                          <td className="px-4 py-3 text-text-main">
                            {c.maladie.name}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={statusBadge(c.diagnosticStatus)} dot>
                              {STATUS_LABEL[c.diagnosticStatus] ??
                                c.diagnosticStatus}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-text-muted">
                            {c.agent.name}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-text-muted">
                            {formatDate(c.declarationDate)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Modifier un patient */}
      <Modal
        open={editPatient !== null}
        onClose={() => setEditPatient(null)}
        title="Modifier le patient"
        description={
          editPatient
            ? `Code anonyme : ${editPatient.anonymousCode} (non modifiable)`
            : undefined
        }
      >
        <form onSubmit={submitEdit} className="space-y-4">
          <Input
            label="Nom du patient"
            value={editForm.namePatient}
            onChange={(e) => setEditForm((p) => ({ ...p, namePatient: e.target.value }))}
            placeholder="Patient 01"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Âge (années)"
              type="number"
              min={0}
              value={editForm.age}
              onChange={(e) => setEditForm((p) => ({ ...p, age: e.target.value }))}
              placeholder="34"
            />
            <Select
              label="Sexe"
              value={editForm.gender}
              onChange={(e) => setEditForm((p) => ({ ...p, gender: e.target.value }))}
              placeholder="—"
              options={[
                { value: "M", label: "Masculin" },
                { value: "F", label: "Féminin" },
              ]}
            />
          </div>
          <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditPatient(null)}
            >
              Annuler
            </Button>
            <Button type="submit" loading={editSubmitting}>
              Enregistrer
            </Button>
          </div>
        </form>
      </Modal>

      {/* Supprimer un patient */}
      <ConfirmDialog
        open={deletePatient !== null}
        onClose={() => setDeletePatient(null)}
        onConfirm={() => void confirmDelete()}
        title="Supprimer le patient"
        description={
          deletePatient
            ? `Supprimer définitivement le patient « ${deletePatient.namePatient ?? deletePatient.anonymousCode} » (${deletePatient.anonymousCode}) ?`
            : ""
        }
        confirmLabel="Supprimer"
        loading={deleteSubmitting}
      />
    </div>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wider text-text-muted">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm text-text-main">{value}</dd>
    </div>
  );
}