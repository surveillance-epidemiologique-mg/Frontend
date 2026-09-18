"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, Eye, Pencil, Plus, Printer, Trash2 } from "lucide-react";
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
  decisionAnalyse?: {
    id: number;
    laboratory?: {
      name: string;
      centre?: { name: string } | null;
    } | null;
  } | null;
}

interface PatientCas {
  id: number;
  maladie: { name: string };
  agent: { name: string };
  centre: { name: string };
  diagnosticStatus: string;
  clinicalOutcome: string;
  declarationDate: string;
  decisionAnalyse?: {
    id: number;
    laboratory?: {
      name: string;
      centre?: { name: string } | null;
    } | null;
  } | null;
  analyses: {
    id: number;
    label: string;
    statut: string;
    resultType: string;
    resultat: string | null;
    dateDemande: string;
    dateAnalyse: string | null;
    laboratory?: {
      name: string;
      centre?: { name: string } | null;
    } | null;
  }[];
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

  // Actions patient
  const [viewPatient, setViewPatient] = useState<PatientDetail | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewQr, setViewQr] = useState("");
  const [viewCas, setViewCas] = useState<{
    id: number;
    code: string;
    maladie: string;
    centre: string;
  } | null>(null);
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

  async function reload() {
    const cs = await fetch(`/api/cas${buildCasQueryString(filters)}`).then(
      (r) => (r.ok ? r.json() : []),
    );
    setCasList(cs);
  }

  async function openView(cas: CasRow) {
    setViewPatient(null);
    setViewQr("");
    setViewCas({
      id: cas.id,
      code: cas.patient.anonymousCode,
      maladie: cas.maladie.name,
      centre: cas.centre.name,
    });
    setViewLoading(true);
    try {
      const res = await fetch(`/api/patients/${cas.patient.id}`);
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(
          typeof body?.message === "string"
            ? body.message
            : "Impossible de charger le patient.",
        );
      }
      setViewPatient(await res.json());
      try {
        const { qrDataUrl } = await import("@/lib/qr");
        const qr = await qrDataUrl(cas.patient.anonymousCode, cas.id);
        setViewQr(qr);
      } catch {
        // QR indisponible : on affiche la fiche sans QR.
      }
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
          onClick={() => void openView(c)}
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
        <div className="flex flex-col gap-1 items-start">
          <Badge variant={statusBadge(c.diagnosticStatus)} dot>
            {STATUS_LABEL[c.diagnosticStatus] ?? c.diagnosticStatus}
          </Badge>
          {["Confirme", "Invalide"].includes(c.diagnosticStatus) && c.decisionAnalyse?.laboratory && (
             <span className="text-[10px] text-text-muted max-w-[150px] truncate" title={`Confirmé par: ${c.decisionAnalyse.laboratory.centre?.name ?? c.decisionAnalyse.laboratory.name}`}>
               Labo: {c.decisionAnalyse.laboratory.centre?.name ?? c.decisionAnalyse.laboratory.name}
             </span>
          )}
        </div>
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
              onClick: () => void openView(c),
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
        <Button asChild>
          <Link href="/cases/declarer">
            <Plus className="size-4" />
            Déclarer un cas
          </Link>
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
        ) : viewPatient && viewCas ? (
          <div className="space-y-6">
            {(() => {
              const currentCas = viewPatient.cas.find(c => c.id === viewCas.id);
              if (!currentCas) return null;
              
              return (
                <>
                  {/* BLOC 1: EN-TÊTE */}
                  <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-bg-surface p-4 shadow-sm">
                    {viewQr && (
                      <img
                        src={viewQr}
                        alt={`QR code du cas #${viewCas.id}`}
                        className="size-30 shrink-0 rounded-lg border border-border bg-bg-surface p-1"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xl font-extrabold text-text-main tracking-tight">
                        {viewPatient.anonymousCode}
                      </h3>
                      <p className="mt-1.5 flex items-center text-sm font-medium text-text-muted">
                        {currentCas.centre.name}
                      </p>
                      <p className="mt-1 text-xs text-text-muted">
                        Déclaré le {formatDate(currentCas.declarationDate)}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="border-primary text-primary hover:bg-primary hover:text-white font-medium"
                      onClick={() => {
                        void import("@/lib/qr").then(({ printFichePatient }) => {
                          printFichePatient(
                            {
                              codeAnonyme: viewPatient.anonymousCode,
                              centre: currentCas.centre.name,
                              dateDeclaration: currentCas.declarationDate,
                              nomPatient: viewPatient.namePatient,
                              age: viewPatient.age,
                              sexe: viewPatient.gender,
                              analyses: currentCas.analyses.map(a => ({
                                id: a.id,
                                label: a.label,
                                statut: a.statut,
                                resultat: a.resultat,
                                dateDemande: a.dateDemande,
                                dateAnalyse: a.dateAnalyse,
                              })),
                            },
                            viewQr,
                          );
                        });
                      }}
                    >
                      <Printer className="mr-2 size-4" />
                      Imprimer la fiche
                    </Button>
                  </div>

                  {/* BLOC 2: INFORMATIONS GÉNÉRALES */}
                  <div className="rounded-xl border border-border bg-bg-surface p-5 shadow-sm">
                    <h4 className="mb-5 text-sm font-bold tracking-wide text-primary border-b border-border pb-2 uppercase">
                      Informations Générales
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                      <div className="sm:col-span-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                          Nom et prénom(s)
                        </p>
                        <p className="mt-1.5 text-base font-semibold text-text-main break-words">
                          {viewPatient.namePatient || "—"}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                            Âge
                          </p>
                          <p className="mt-1.5 text-sm font-semibold text-text-main">
                            {viewPatient.age != null ? `${viewPatient.age} ans` : "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                            Sexe
                          </p>
                          <p className="mt-1.5 text-sm font-semibold text-text-main">
                            {genderLabel(viewPatient.gender)}
                          </p>
                        </div>
                      </div>

                      <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                            Zone de résidence
                          </p>
                          <p className="mt-1.5 text-sm font-semibold text-text-main">
                            {viewPatient.residenceZone?.name ?? "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                            Centre de traitement
                          </p>
                          <p className="mt-1.5 text-sm font-semibold text-text-main">
                            {currentCas.centre.name}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                            Statut du cas
                          </p>
                          <div className="mt-1.5">
                            <Badge variant={statusBadge(currentCas.diagnosticStatus)} dot>
                              {STATUS_LABEL[currentCas.diagnosticStatus] ?? currentCas.diagnosticStatus}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* BLOC 3: ANALYSES & LABORATOIRE */}
                  <div>
                    <h4 className="mb-4 text-xs font-bold tracking-wider text-text-muted uppercase">
                      Analyses & Laboratoire
                    </h4>
                    <div className="max-h-[350px] overflow-y-auto pr-2 space-y-3">
                      {currentCas.analyses && currentCas.analyses.length > 0 ? (
                        currentCas.analyses.map((a) => {
                          const isRealisee = a.statut === "Realisee";
                          return (
                            <div key={a.id} className="relative rounded-lg border border-border bg-bg-surface p-4 shadow-sm">
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                                <div className="space-y-3 flex-1">
                                  <h5 className="font-bold text-text-main text-[15px]">{a.label}</h5>
                                  
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-text-muted">Résultat :</span>
                                    {isRealisee && a.resultat ? (
                                      <Badge variant="info">{a.resultat}</Badge>
                                    ) : (
                                      <Badge variant="secondary">En cours</Badge>
                                    )}
                                  </div>

                                  <div className="text-xs text-text-muted">
                                    Par : {isRealisee && a.laboratory ? <span className="font-medium text-text-main">{a.laboratory.name}</span> : "—"}
                                  </div>
                                </div>
                                
                                <div className="flex flex-col items-start sm:items-end gap-3 shrink-0">
                                  <div className="text-xs text-text-muted">
                                    Réalisée le : {isRealisee && a.dateAnalyse ? <span className="font-medium text-text-main">{formatDate(a.dateAnalyse)}</span> : "—"}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-text-muted">Statut :</span>
                                    <Badge variant={isRealisee ? "info" : "warning"}>
                                      {a.statut}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-sm text-text-muted p-4 border border-border rounded-lg bg-bg-muted/10 text-center">
                          Aucune analyse liée à ce cas.
                        </p>
                      )}
                    </div>
                  </div>
                </>
              );
            })()}
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
            ? `Supprimer définitivement le patient « ${deletePatient.namePatient ?? deletePatient.anonymousCode} » (${deletePatient.anonymousCode}) ? Tous ses cas épidémiologiques et analyses associés seront supprimés en cascade.`
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