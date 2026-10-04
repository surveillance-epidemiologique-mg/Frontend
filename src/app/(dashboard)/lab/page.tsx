"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { FlaskConical, QrCode, Stethoscope, Calendar, Building2, Activity } from "lucide-react";
import type { ScanResult } from "@/features/laboratoire/components/QrScanner/QrScanner";

const QrScanner = dynamic(
  () => import("@/features/laboratoire/components/QrScanner/QrScanner").then((mod) => mod.QrScanner),
  {
    ssr: false,
    loading: () => (
      <div className="py-8 text-center text-sm text-text-muted">
        Chargement du scanner…
      </div>
    ),
  },
);
import { Badge } from "@/components/badge/component";
import { Button } from "@/components/button/component";
import { Card } from "@/components/card/component";
import {
  buildCasQueryString,
  CaseFilters,
  EMPTY_FILTERS,
  type CaseFiltersValues,
  type FilterOption,
} from "@/components/case-filters/component";
import { ConfirmDialog } from "@/components/confirm-dialog/component";
import { EmptyState } from "@/components/empty-state/component";
import { Input } from "@/components/input/component";
import { LoadingState } from "@/components/loading-state/component";
import { Modal } from "@/components/modal/component";
import { PageHeader } from "@/components/page-header/component";
import { Select } from "@/components/select/component";
import { useToast } from "@/components/toast/component";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { notifyMapDataChanged } from "@/services/live-events";

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

const LAB_PAGE_SIZE = 10;

const RESULT_TYPE_LABEL: Record<string, string> = {
  Numerique: "Numérique",
  ChoixPositifNegatif: "Positif / Négatif",
  TexteLibre: "Texte libre",
};

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

function buildLaboratoirePageUrl(filters: CaseFiltersValues, view: Visuel, page: number) {
  const params = new URLSearchParams(buildCasQueryString(filters).slice(1));
  params.set("laboratoryView", view);
  params.set("page", String(page));
  params.set("limit", String(LAB_PAGE_SIZE));
  return `?${params.toString()}`;
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
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const queryVersionRef = useRef(0);

  // Modal analyses
  const [selectedCas, setSelectedCas] = useState<LabCase | null>(null);
  const [draft, setDraft] = useState<Record<number, string>>({});
  const [savingId, setSavingId] = useState<number | null>(null);
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
          fetch("/api/cas/laboratoire/years").then((r) =>
            r.ok ? r.json() : [],
          ),
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
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const fetchLaboratoirePage = useCallback(async (pageNumber: number) => {
    const response = await fetch(
      `/api/cas/laboratoire${buildLaboratoirePageUrl(filters, visuel, pageNumber)}`,
    );
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? (data as LabCase[]) : [];
  }, [filters, visuel]);

  function startNewList() {
    queryVersionRef.current += 1;
    setLoading(true);
    setLoadingMore(false);
    setPage(0);
    setHasMore(true);
    setCases([]);
  }

  function changeFilters(next: CaseFiltersValues) {
    startNewList();
    setFilters(next);
  }

  function changeView(next: Visuel) {
    if (next === visuel) return;
    startNewList();
    setVisuel(next);
  }

  useEffect(() => {
    let cancelled = false;
    const queryVersion = queryVersionRef.current;
    const id = setTimeout(() => {
      void (async () => {
        try {
          const list = await fetchLaboratoirePage(1);
          if (cancelled || queryVersion !== queryVersionRef.current) return;
          setCases(list);
          setPage(1);
          setHasMore(list.length === LAB_PAGE_SIZE);
        } catch {
          if (cancelled || queryVersion !== queryVersionRef.current) return;
          setCases([]);
          setHasMore(false);
        } finally {
          if (!cancelled && queryVersion === queryVersionRef.current) setLoading(false);
        }
      })();
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [fetchLaboratoirePage]);

  const loadNextPage = useCallback(async () => {
    if (loading || loadingMore || !hasMore || page === 0) return;
    const nextPage = page + 1;
    const queryVersion = queryVersionRef.current;
    setLoadingMore(true);
    try {
      const list = await fetchLaboratoirePage(nextPage);
      if (queryVersion !== queryVersionRef.current) return;
      setCases((previous) => {
        const knownIds = new Set(previous.map((item) => item.id));
        return [...previous, ...list.filter((item) => !knownIds.has(item.id))];
      });
      setPage(nextPage);
      setHasMore(list.length === LAB_PAGE_SIZE);
    } finally {
      if (queryVersion === queryVersionRef.current) setLoadingMore(false);
    }
  }, [fetchLaboratoirePage, hasMore, loading, loadingMore, page]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadNextPage();
      },
      { rootMargin: "480px 0px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, loadNextPage]);

  const reload = useCallback(async () => {
    const queryVersion = queryVersionRef.current;
    const list = await fetchLaboratoirePage(1);
    if (queryVersion !== queryVersionRef.current) return;
    setCases(list);
    setPage(1);
    setHasMore(list.length === LAB_PAGE_SIZE);
    if (selectedCas) {
      const response = await fetch(`/api/cas/laboratoire/${selectedCas.id}`);
      const fresh = response.ok ? (await response.json() as LabCase) : null;
      if (queryVersion !== queryVersionRef.current) return;
      setSelectedCas(fresh);
      if (fresh) {
        const drafts: Record<number, string> = {};
        for (const a of fresh.analyses) {
          drafts[a.id] = a.resultat ?? "";
        }
        setDraft(drafts);
      }
    }
  }, [fetchLaboratoirePage, selectedCas]);

  function processedByMe(c: LabCase) {
    return c.analyses.some(
      (a) => a.statut === "Realisee" && a.laboratory?.id === me?.id,
    );
  }

  const hasActiveFilters = Object.values(filters).some(Boolean);

  function openCase(c: LabCase) {
    setSelectedCas(c);
    const drafts: Record<number, string> = {};
    for (const a of c.analyses) {
      drafts[a.id] = a.resultat ?? "";
    }
    setDraft(drafts);
  }

  /** Récupère un cas par id (vérifie l'accès) puis ouvre sa fiche analyses. */
  async function fetchAndOpen(casId: number, expectedCode?: string) {
    try {
      const res = await fetch(`/api/cas/laboratoire/${casId}`);
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
        description: `${selectedCas.patient.anonymousCode} → ${validateAction.status === "Confirme" ? "Confirmé" : "Invalidé"}.`,
        variant: "success",
      });
      notifyMapDataChanged();
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
    <div className="w-full space-y-6 pb-6">
      <PageHeader
        title="Laboratoire"
        description="Analyses demandées, saisie des résultats et validation des cas."
      />

      <Card className="overflow-hidden rounded-3xl border border-border/70 bg-bg-surface shadow-card">
        <CaseFilters
          values={filters}
          onChange={changeFilters}
          years={years}
          centres={centres}
          maladies={maladies}
          showStatut={false}
        />

        <div className="flex flex-col gap-4 border-b border-border/60 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex w-full rounded-xl border border-border/60 bg-bg-muted/70 p-1 sm:w-auto" aria-label="Catégories de cas">
            {(["all", "pending", "processed"] as Visuel[]).map((v) => {
              const active = visuel === v;
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => changeView(v)}
                  aria-pressed={active}
                  className={cn(
                    "min-w-0 flex-1 rounded-lg px-3 py-2 text-center text-xs font-semibold transition-colors sm:flex-none sm:px-4 sm:text-sm",
                    active
                      ? "bg-bg-surface text-primary shadow-sm ring-1 ring-border/60"
                      : "text-text-muted hover:bg-bg-surface-hover hover:text-text-main"
                  )}
                >
                  {v === "all" ? "Tous" : v === "pending" ? "En attente" : "Traités"}
                </button>
              );
            })}
          </div>
          <Button
            variant="primary"
            className="w-full sm:w-auto"
            onClick={() => {
              setScanKey((k) => k + 1);
              setScannerOpen(true);
            }}
          >
            <QrCode className="size-4" />
            Scanner un QR Code
          </Button>
        </div>

        {loading ? (
          <LoadingState
            label="Récupération des cas du laboratoire…"
            className="min-h-64 px-4 py-12 sm:px-6 sm:py-16"
          />
        ) : cases.length === 0 && !hasMore ? (
          <EmptyState
            icon={FlaskConical}
            imageSrc="/images/nothing.svg"
            imageAlt="Aucun cas"
            title="Aucun cas dans cette catégorie"
            description={hasActiveFilters
              ? "Aucun résultat ne correspond à vos filtres."
              : visuel === "pending"
                ? "Aucune analyse n'est actuellement en attente."
                : visuel === "processed"
                  ? "Aucun cas traité par ce laboratoire."
                  : "Aucun cas n'a encore été déclaré."}
          >
            {hasActiveFilters ? (
              <Button variant="outline" onClick={() => changeFilters(EMPTY_FILTERS)}>
                Réinitialiser les filtres
              </Button>
            ) : null}
          </EmptyState>
        ) : (
          <div className="space-y-4 bg-bg-app/40 p-4 sm:p-6">
            {cases.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border bg-bg-surface px-4 py-8 text-center text-sm text-text-muted">
                Recherche de cas correspondant à cet onglet…
              </p>
            ) : null}
            {cases.map((c) => {
              const mine = processedByMe(c);
              return (
                <Card
                  key={c.id}
                  className="overflow-hidden rounded-2xl border border-border/70 bg-bg-surface shadow-card"
                >
                  <div className="flex flex-col gap-5 p-4 sm:p-5 lg:flex-row lg:gap-6">
                    <div className="lab-case-illustration-frame self-center lg:self-stretch">
                      <Image
                        src="/images/File-analyse.svg"
                        alt="Illustration d'une analyse de laboratoire"
                        width={176}
                        height={176}
                        className="lab-case-illustration"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex min-w-0 flex-wrap items-center gap-2.5">
                          <span className="text-base font-semibold tracking-tight text-text-main [overflow-wrap:anywhere] sm:text-lg">
                            {c.patient.anonymousCode}
                          </span>
                          <Badge variant={STATUT_BADGE[c.diagnosticStatus] ?? "secondary"} dot>
                            {statutLabel(c.diagnosticStatus)}
                          </Badge>
                          <Badge variant="outline" className="border-text-muted/30 text-text-muted">
                            {c.maladie.name}
                          </Badge>
                          {mine ? (
                            <Badge variant="info" className="border-primary/20 bg-primary/5 text-primary">
                              Votre analyse
                            </Badge>
                          ) : null}
                        </div>
                        <div className="flex shrink-0 items-center self-start rounded-full border border-border bg-bg-app px-3 py-1 text-xs font-medium text-text-muted">
                          <Calendar className="mr-1.5 size-3.5" />
                          {formatDate(c.diagnosisDate)}
                        </div>
                      </div>

                      <div className="grid gap-4 py-5 sm:grid-cols-2">
                        <div>
                          <p className="mb-1.5 text-xs font-medium text-text-muted">
                            Établissement &amp; Lieu
                          </p>
                          <p className="flex items-start text-sm font-medium text-text-main">
                            <Building2 className="mr-1.5 mt-0.5 size-4 shrink-0 text-text-muted" />
                            <span>
                              {c.centre.name}{" "}
                              {c.centre.zone ? (
                                <span className="font-normal text-text-muted">({c.centre.zone.name})</span>
                              ) : null}
                            </span>
                          </p>
                        </div>
                        <div>
                          <p className="mb-1.5 text-xs font-medium text-text-muted">
                            Déclaré par
                          </p>
                          <p className="text-sm font-medium text-text-main">
                            {c.agent.name}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 max-w-2xl items-start gap-2">
                          <Activity className="mt-0.5 size-4 shrink-0 text-text-muted" />
                          <p className="line-clamp-2 text-sm leading-relaxed text-text-muted">
                            <span className="mr-1 font-medium text-text-main">Symptômes :</span>
                            {c.symptoms || "—"}
                          </p>
                        </div>

                        <Button
                          variant="outline"
                          onClick={() => openCase(c)}
                          className="shrink-0 border-primary mt-4 sm:mt-0 text-primary transition-colors hover:bg-primary/5 hover:text-primary"
                        >
                          <Stethoscope className="mr-2 size-4" />
                          Analyses ({c.analyses.length})
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
            <div
              ref={loadMoreRef}
              className="flex min-h-12 items-center justify-center"
              aria-live="polite"
            >
              {loadingMore ? (
                <LoadingState
                  label="Chargement des cas suivants…"
                  className="w-full rounded-xl border border-dashed border-border bg-bg-surface px-4 py-4"
                />
              ) : null}
            </div>
          </div>
        )}
      </Card>

      {/* Modal analyses du cas */}
      <Modal
        open={selectedCas !== null}
        onClose={() => setSelectedCas(null)}
        title="Analyses"
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
                Aucune analyse demandée pour ce cas.
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
