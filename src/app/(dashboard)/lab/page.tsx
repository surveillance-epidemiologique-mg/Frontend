"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { FlaskConical, Plus, QrCode, Stethoscope, Calendar, Building2, Activity } from "lucide-react";
import type { ScanResult } from "@/components/lab/qr-scanner";

const QrScanner = dynamic(
  () => import("@/components/lab/qr-scanner").then((mod) => mod.QrScanner),
  {
    ssr: false,
    loading: () => (
      <div className="py-8 text-center text-sm text-text-muted">
        Chargement du scanner…
      </div>
    ),
  },
);
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
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface LabAnalyse {
  id: number;
  label: string;
  resultType: string;
  resultat: string | null;
  statut: string;
  laboratory: { id: number; name: string } | null;
  dateAnalyse: string | null;
  dateDemande: string;
}

interface LabCase {
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
  declarationDate: string;
  symptoms: string | null;
  diagnosticStatus: string;
  clinicalOutcome: string;
  analyses: LabAnalyse[];
  decisionAnalyse: {
    id: number;
    label: string;
    laboratory: { name: string } | null;
  } | null;
}

type Visuel = "all" | "pending" | "processed";

const RESULT_TYPE_LABEL: Record<string, string> = {
  Numerique: "Numérique",
  ChoixPositifNegatif: "Positif / Négatif",
  TexteLibre: "Texte libre",
};

const RESULT_TYPE_OPTIONS = [
  { value: "Numerique", label: "Numérique" },
  { value: "ChoixPositifNegatif", label: "Positif / Négatif" },
  { value: "TexteLibre", label: "Texte libre" },
];

const STATUT_BADGE: Record<string, "warning" | "success" | "danger" | "secondary"> = {
  Suspect: "warning",
  Confirme: "success",
  Invalide: "danger",
};

function statutLabel(s: string) {
  if (s === "Suspect") return "En attente";
  if (s === "Confirme") return "Confirmé";
  if (s === "Invalide") return "Invalidé";
  return s;
}

export default function LaboratoirePage() {
  const { toast } = useToast();
  const [me, setMe] = useState<{ id: number; role: string } | null>(null);
  const [cases, setCases] = useState<LabCase[]>([]);
  const [maladies, setMaladies] = useState<FilterOption[]>([]);
  const [centres, setCentres] = useState<FilterOption[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [filters, setFilters] = useState<CaseFiltersValues>(EMPTY_FILTERS);
  const [visuel, setVisuel] = useState<Visuel>("all");
  const [loading, setLoading] = useState(true);

  // Modal analyses
  const [selectedCas, setSelectedCas] = useState<LabCase | null>(null);
  const [draft, setDraft] = useState<Record<number, string>>({});
  const [savingId, setSavingId] = useState<number | null>(null);
  const [addForm, setAddForm] = useState({ label: "", resultType: "" });
  const [adding, setAdding] = useState(false);
  const [validateAction, setValidateAction] = useState<{
    casId: number;
    status: string;
  } | null>(null);
  const [validating, setValidating] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanKey, setScanKey] = useState(0);

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
            ? { id: meData.id, role: meData.role?.name ?? "" }
            : null,
        );
        setMaladies(m);
        setCentres(c);
        setYears(y);
      } catch {
        // API indisponible
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
        } catch {
          setCases([]);
        } finally {
          setLoading(false);
        }
      })();
    }, 300);
    return () => clearTimeout(id);
  }, [filters]);

  const reload = useCallback(async () => {
    const data = await fetch(
      `/api/cas/laboratoire${buildCasQueryString(filters)}`,
    ).then((r) => (r.ok ? r.json() : []));
    const list = Array.isArray(data) ? data : [];
    setCases(list);
    if (selectedCas) {
      const fresh = list.find((c: LabCase) => c.id === selectedCas.id) ?? null;
      setSelectedCas(fresh);
      if (fresh) {
        const drafts: Record<number, string> = {};
        for (const a of fresh.analyses) {
          drafts[a.id] = a.resultat ?? "";
        }
        setDraft(drafts);
      }
    }
  }, [filters, selectedCas]);

  function processedByMe(c: LabCase) {
    return c.analyses.some(
      (a) => a.statut === "Realisee" && a.laboratory?.id === me?.id,
    );
  }

  const visible = useMemo(() => {
    if (visuel === "pending") {
      return cases.filter((c) => c.analyses.some((a) => a.statut === "Demandee"));
    }
    if (visuel === "processed") {
      return cases.filter(
        (c) => c.analyses.some(
          (a) => a.statut === "Realisee" && (me?.role === "Administrateur" || a.laboratory?.id === me?.id)
        )
      );
    }
    return cases;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cases, visuel, me]);

  function openCase(c: LabCase) {
    setSelectedCas(c);
    const drafts: Record<number, string> = {};
    for (const a of c.analyses) {
      drafts[a.id] = a.resultat ?? "";
    }
    setDraft(drafts);
    setAddForm({ label: "", resultType: "" });
  }

  /** Récupère un cas par id (vérifie l'accès) puis ouvre sa fiche analyses. */
  async function fetchAndOpen(casId: number, expectedCode?: string) {
    try {
      const res = await fetch(`/api/cas/${casId}`);
      if (res.status === 403) {
        toast({
          title: "Accès refusé",
          description: "Vous n'avez pas accès à ce cas.",
          variant: "error",
        });
        return;
      }
      if (!res.ok) {
        toast({
          title: "Cas introuvable",
          description: "QR Code invalide ou cas introuvable.",
          variant: "error",
        });
        return;
      }
      const cas = await res.json();
      if (expectedCode && cas.patient?.anonymousCode !== expectedCode) {
        toast({
          title: "QR Code invalide",
          description: "Le code scanné ne correspond à aucun cas.",
          variant: "error",
        });
        return;
      }
      setScannerOpen(false);
      openCase(cas as LabCase);
    } catch (e) {
      toast({
        title: "Erreur",
        description: e instanceof Error ? e.message : "Erreur.",
        variant: "error",
      });
    }
  }

  function handleScanned(result: ScanResult) {
    void fetchAndOpen(result.casId, result.code);
  }

  async function handleManual(value: string) {
    const v = value.trim();
    if (/^\d+$/.test(v)) {
      await fetchAndOpen(Number(v));
      return;
    }
    const m = v.match(/^(.+)#(\d+)$/);
    if (m) {
      await fetchAndOpen(Number(m[2]), m[1]);
      return;
    }
    try {
      const res = await fetch(`/api/cas?search=${encodeURIComponent(v)}`);
      const list = await res.json();
      const arr = Array.isArray(list) ? list : [];
      const match =
        arr.find((c: LabCase) => c.patient?.anonymousCode === v) ?? arr[0];
      if (match) {
        setScannerOpen(false);
        openCase(match as LabCase);
      } else {
        toast({
          title: "Cas introuvable",
          description: "Aucun cas ne correspond à ce code.",
          variant: "error",
        });
      }
    } catch (e) {
      toast({
        title: "Erreur",
        description: e instanceof Error ? e.message : "Erreur.",
        variant: "error",
      });
    }
  }

  function isEditable(a: LabAnalyse) {
    if (a.statut === "Demandee") return true;
    return a.statut === "Realisee" && a.laboratory?.id === me?.id;
  }

  async function saveResult(a: LabAnalyse) {
    const resultat = draft[a.id]?.trim() ?? "";
    if (!resultat) {
      toast({ title: "Résultat vide", description: "Saisissez un résultat.", variant: "warning" });
      return;
    }
    setSavingId(a.id);
    try {
      const res = await fetch(`/api/cas/analyses/${a.id}/result`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resultat }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(
          typeof body?.message === "string" ? body.message : "Impossible d'enregistrer le résultat.",
        );
      }
      toast({ title: "Résultat enregistré", description: `Analyse « ${a.label} » réalisée.`, variant: "success" });
      await reload();
    } catch (e) {
      toast({ title: "Erreur", description: e instanceof Error ? e.message : "Erreur.", variant: "error" });
    } finally {
      setSavingId(null);
    }
  }

  async function addAnalyse() {
    if (!selectedCas) return;
    if (addForm.label.trim().length < 2 || !addForm.resultType) {
      toast({ title: "Champs requis", description: "Libellé (≥2 car.) et type de résultat requis.", variant: "warning" });
      return;
    }
    setAdding(true);
    try {
      const res = await fetch(`/api/cas/${selectedCas.id}/analyses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: addForm.label.trim(), typeResultatAttendu: addForm.resultType }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(typeof body?.message === "string" ? body.message : "Impossible d'ajouter l'analyse.");
      }
      toast({ title: "Analyse ajoutée", description: `« ${body.label} » ajoutée au cas #${selectedCas.id}.`, variant: "success" });
      setAddForm({ label: "", resultType: "" });
      await reload();
    } catch (e) {
      toast({ title: "Erreur", description: e instanceof Error ? e.message : "Erreur.", variant: "error" });
    } finally {
      setAdding(false);
    }
  }

  async function confirmValidate() {
    if (!validateAction || !selectedCas) return;
    setValidating(true);
    try {
      const realised = selectedCas.analyses.filter((a) => a.statut === "Realisee");
      const mine = realised.find((a) => a.laboratory?.id === me?.id);
      const res = await fetch(`/api/cas/${validateAction.casId}/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          diagnosticStatus: validateAction.status,
          ...(mine ? { analyseId: mine.id } : {}),
        }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(typeof body?.message === "string" ? body.message : "Impossible de valider le cas.");
      }
      toast({
        title: "Cas validé",
        description: `Cas #${validateAction.casId} → ${validateAction.status === "Confirme" ? "Confirmé" : "Invalidé"}.`,
        variant: "success",
      });
      setValidateAction(null);
      await reload();
    } catch (e) {
      toast({ title: "Erreur", description: e instanceof Error ? e.message : "Erreur.", variant: "error" });
    } finally {
      setValidating(false);
    }
  }

  function renderResultInput(a: LabAnalyse) {
    if (!isEditable(a)) {
      return (
        <span className="text-sm font-medium text-text-main">
          {a.resultat ?? "—"}
        </span>
      );
    }
    const value = draft[a.id] ?? "";
    if (a.resultType === "Numerique") {
      return (
        <Input
          aria-label={`Résultat ${a.label}`}
          type="number"
          step="any"
          value={value}
          onChange={(e) => setDraft((p) => ({ ...p, [a.id]: e.target.value }))}
          placeholder="Valeur numérique"
          className="sm:w-40"
        />
      );
    }
    if (a.resultType === "ChoixPositifNegatif") {
      return (
        <Select
          aria-label={`Résultat ${a.label}`}
          value={value}
          onChange={(e) => setDraft((p) => ({ ...p, [a.id]: e.target.value }))}
          placeholder="Positif / Négatif"
          options={[
            { value: "Positif", label: "Positif" },
            { value: "Négatif", label: "Négatif" },
          ]}
          className="sm:w-40"
        />
      );
    }
    return (
      <Input
        aria-label={`Résultat ${a.label}`}
        value={value}
        onChange={(e) => setDraft((p) => ({ ...p, [a.id]: e.target.value }))}
        placeholder="Résultat libre"
        className="sm:w-48"
      />
    );
  }

  const realisedCount = selectedCas?.analyses.filter(
    (a) => a.statut === "Realisee",
  ).length ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Laboratoire"
        description="Analyses demandées, saisie des résultats et validation des cas."
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

        <div className="flex flex-col gap-4 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between bg-bg-surface">
          <Button
            variant="primary"
            onClick={() => {
              setScanKey((k) => k + 1);
              setScannerOpen(true);
            }}
          >
            <QrCode className="mr-2 size-4" />
            Scanner un QR Code
          </Button>

          <div className="flex rounded-md p-1 bg-bg-muted/30 border border-border">
            {(["all", "pending", "processed"] as Visuel[]).map((v) => {
              const active = visuel === v;
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVisuel(v)}
                  className={cn(
                    "px-4 py-1.5 text-sm font-medium rounded-sm transition-all",
                    active
                      ? "bg-primary text-white shadow-sm"
                      : "text-text-muted hover:text-text-main hover:bg-white/50"
                  )}
                >
                  {v === "all" ? "Tous" : v === "pending" ? "En attente" : "Traités"}
                </button>
              );
            })}
          </div>
        </div>

        {visible.length === 0 ? (
          <EmptyState
            icon={FlaskConical}
            title={loading ? "Chargement…" : "Aucun cas"}
            description={
              loading
                ? "Récupération des cas…"
                : "Aucun cas ne correspond aux filtres sélectionnés."
            }
          />
        ) : (
          <div className="space-y-4 p-4 bg-bg-muted/5">
            {visible.map((c) => {
              const mine = processedByMe(c);
              return (
                <Card key={c.id} className="p-0 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-4 sm:p-5">
                    {/* Ligne d'en-tête */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 border-b border-border pb-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-xl font-extrabold text-text-main tracking-tight">
                          {c.patient.anonymousCode}
                        </span>
                        <Badge variant={STATUT_BADGE[c.diagnosticStatus] ?? "secondary"} dot>
                          {statutLabel(c.diagnosticStatus)}
                        </Badge>
                        <Badge variant="outline" className="border-text-muted/30 text-text-muted">
                          {c.maladie.name}
                        </Badge>
                        {mine ? (
                          <Badge variant="info" className="bg-primary/5 text-primary border-primary/20">
                            Votre analyse
                          </Badge>
                        ) : null}
                      </div>
                      <div className="flex items-center text-xs font-medium text-text-muted">
                        <Calendar className="mr-1.5 size-3.5" />
                        {formatDate(c.diagnosisDate)}
                      </div>
                    </div>

                    {/* Ligne d'informations */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-4 gap-x-6 mb-5">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5">
                          Patient
                        </p>
                        <p className="text-sm font-semibold text-text-main">
                          {c.patient.namePatient || c.patient.anonymousCode}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5">
                          Établissement & Lieu
                        </p>
                        <p className="flex items-start text-sm font-semibold text-text-main">
                          <Building2 className="mr-1.5 mt-0.5 size-4 text-text-muted shrink-0" />
                          <span>
                            {c.centre.name} {c.centre.zone ? <span className="text-text-muted font-normal">({c.centre.zone.name})</span> : ""}
                          </span>
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5">
                          Déclaré par
                        </p>
                        <p className="text-sm font-semibold text-text-main">
                          {c.agent.name}
                        </p>
                      </div>
                    </div>

                    {/* Ligne inférieure */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-border">
                      <div className="flex items-start gap-2 max-w-2xl">
                        <Activity className="size-4 text-text-muted shrink-0 mt-0.5" />
                        <p className="text-sm text-text-muted leading-relaxed line-clamp-2">
                          <span className="font-semibold text-text-main mr-1">Symptômes :</span>
                          {c.symptoms || "—"}
                        </p>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        onClick={() => openCase(c)}
                        className="shrink-0 border-primary text-primary hover:bg-primary/5 hover:text-primary transition-colors"
                      >
                        <Stethoscope className="mr-2 size-4" />
                        Analyses ({c.analyses.length})
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </Card>

      {/* Modal analyses du cas */}
      <Modal
        open={selectedCas !== null}
        onClose={() => setSelectedCas(null)}
        title={`Analyses — cas #${selectedCas?.id ?? ""}`}
        description={
          selectedCas
            ? `${selectedCas.patient.anonymousCode} · ${selectedCas.maladie.name} · ${selectedCas.centre.name}`
            : undefined
        }
        size="lg"
      >
        {selectedCas ? (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={STATUT_BADGE[selectedCas.diagnosticStatus] ?? "secondary"}>
                {statutLabel(selectedCas.diagnosticStatus)}
              </Badge>
              {selectedCas.decisionAnalyse ? (
                <Badge variant="outline">
                  Décision : {selectedCas.decisionAnalyse.label} (
                  {selectedCas.decisionAnalyse.laboratory?.name ?? "?"})
                </Badge>
              ) : null}
            </div>

            {selectedCas.analyses.length === 0 ? (
              <p className="text-sm text-text-muted">
                Aucune analyse pour ce cas. Ajoutez-en une ci-dessous.
              </p>
            ) : (
              <div className="space-y-3">
                {selectedCas.analyses.map((a) => {
                  const editable = isEditable(a);
                  return (
                    <div
                      key={a.id}
                      className="rounded-xl border border-border p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-text-main">
                            {a.label}
                          </p>
                          <p className="text-xs text-text-muted">
                            {RESULT_TYPE_LABEL[a.resultType] ?? a.resultType} ·
                            {a.statut === "Realisee"
                              ? ` réalisée par ${a.laboratory?.name ?? "?"}`
                              : " non réalisée"}
                          </p>
                        </div>
                        <Badge
                          variant={a.statut === "Realisee" ? "success" : "warning"}
                        >
                          {a.statut === "Realisee" ? "Réalisée" : "Demandée"}
                        </Badge>
                      </div>

                      <div
                        className={cn(
                          "mt-3 flex flex-col gap-2 sm:flex-row sm:items-end",
                        )}
                      >
                        {renderResultInput(a)}
                        {editable ? (
                          <Button
                            size="sm"
                            loading={savingId === a.id}
                            onClick={() => void saveResult(a)}
                          >
                            {a.resultat ? "Modifier" : "Enregistrer"}
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Ajouter une analyse complémentaire */}
            <div className="rounded-xl border border-dashed border-border p-4">
              <p className="mb-3 text-sm font-semibold text-text-main">
                Ajouter une analyse complémentaire
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <Input
                  label="Libellé"
                  value={addForm.label}
                  onChange={(e) => setAddForm((p) => ({ ...p, label: e.target.value }))}
                  placeholder="Ex : TDR paludisme, PCR…"
                  className="sm:flex-1"
                />
                <Select
                  label="Type de résultat"
                  value={addForm.resultType}
                  onChange={(e) => setAddForm((p) => ({ ...p, resultType: e.target.value }))}
                  placeholder="—"
                  options={RESULT_TYPE_OPTIONS}
                  className="sm:w-52"
                />
                <Button variant="outline" onClick={() => void addAnalyse()} loading={adding}>
                  <Plus className="size-4" />
                  Ajouter
                </Button>
              </div>
            </div>

            {/* Validation du cas */}
            <div className="flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
              <p className="text-xs text-text-muted sm:mr-auto sm:self-center">
                {realisedCount > 0
                  ? `${realisedCount} analyse(s) réalisée(s) — le cas peut être validé.`
                  : "Validation possible dès qu'une analyse est réalisée."}
              </p>
              <Button
                variant="primary"
                disabled={realisedCount === 0}
                onClick={() => setValidateAction({ casId: selectedCas.id, status: "Confirme" })}
              >
                Confirmer le cas
              </Button>
              <Button
                variant="danger"
                disabled={realisedCount === 0}
                onClick={() => setValidateAction({ casId: selectedCas.id, status: "Invalide" })}
              >
                Invalider le cas
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Scanner QR Code (chargé à la demande) */}
      {scannerOpen ? (
        <QrScanner
          key={scanKey}
          open={scannerOpen}
          onClose={() => setScannerOpen(false)}
          onScanned={handleScanned}
          onManual={(v) => void handleManual(v)}
        />
      ) : null}

      {/* Confirmation de validation */}
      <ConfirmDialog
        open={validateAction !== null}
        onClose={() => setValidateAction(null)}
        onConfirm={() => void confirmValidate()}
        title={
          validateAction?.status === "Confirme"
            ? "Confirmer le cas"
            : "Invalider le cas"
        }
        description={
          validateAction
            ? `Le cas #${validateAction.casId} sera ${
                validateAction.status === "Confirme" ? "confirmé" : "invalidé"
              } définitivement. Le médecin prescripteur sera notifié.`
            : ""
        }
        confirmLabel={
          validateAction?.status === "Confirme" ? "Confirmer" : "Invalider"
        }
        tone={validateAction?.status === "Confirme" ? "primary" : "danger"}
        loading={validating}
      />
    </div>
  );
}