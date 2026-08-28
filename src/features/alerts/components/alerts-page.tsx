"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Eye, Plus, RefreshCw, Zap } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { AlertForm } from "@/features/alerts/components/alert-form";
import { AlertStatusBadge, RiskBadge } from "@/features/alerts/components/alert-badges";
import { DataFreshness } from "@/features/alerts/components/data-freshness";
import { RulesPanel } from "@/features/alerts/components/rules-panel";
import { cn } from "@/lib/utils";
import {
  createAlerte,
  detectAlertes,
  fetchAlerte,
  fetchAlertes,
  fetchAlertOptions,
  resolveAlerte,
  takeChargeAlerte,
} from "@/features/alerts/services/alerts";
import type {
  Alerte,
  AlerteFreshness,
  AlerteOptions,
} from "@/features/alerts/types";
import { DiseaseIcon } from "@/features/dashboard/components/disease-icon";
import { formatDate } from "@/lib/utils";

interface AlertsPageProps {
  isAdmin: boolean;
}

const ACTION_LABEL: Record<string, string> = {
  Creation: "Création",
  Detection: "Détection automatique",
  PriseEnCharge: "Prise en charge",
  Resolution: "Résolution",
  Reouverture: "Réouverture",
  MiseAJour: "Mise à jour",
};

const NIVEAU_ROW: Record<string, { accent: string; icon: string }> = {
  Normal: { accent: "border-l-text-subtle", icon: "bg-bg-app text-text-muted" },
  Surveillance: { accent: "border-l-info", icon: "bg-info/10 text-info" },
  Alerte: { accent: "border-l-warning", icon: "bg-warning/10 text-warning" },
  Critique: { accent: "border-l-error", icon: "bg-error/10 text-error" },
};

export function AlertsPage({ isAdmin }: AlertsPageProps) {
  const { toast } = useToast();
  const [options, setOptions] = useState<AlerteOptions | null>(null);
  const [alerts, setAlerts] = useState<Alerte[]>([]);
  const [freshness, setFreshness] = useState<AlerteFreshness | null>(null);
  const [filters, setFilters] = useState<{
    statut: string;
    niveau: string;
    maladieId: string;
  }>({ statut: "", niveau: "", maladieId: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [detail, setDetail] = useState<Alerte | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await fetchAlertOptions();
        if (active) setOptions(data);
      } catch {
        // les options sont rechargées avec la liste
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    (async () => {
      setLoading(true);
      try {
        const data = await fetchAlertes({
          statut: filters.statut || undefined,
          niveau: filters.niveau || undefined,
          maladieId: filters.maladieId ? Number(filters.maladieId) : undefined,
        });
        if (active) {
          setAlerts(data.alerts);
          setFreshness(data.freshness);
          setError(null);
        }
      } catch (e) {
        if (active) {
          setError(e instanceof Error ? e.message : "Impossible de charger les alertes.");
        }
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [filters, reloadKey]);

  function reload() {
    setReloadKey((key) => key + 1);
  }

  async function openDetail(alert: Alerte) {
    try {
      const data = await fetchAlerte(alert.id);
      setDetail(data);
      setDetailOpen(true);
    } catch (e) {
      toast({
        title: "Erreur",
        description: e instanceof Error ? e.message : "Impossible de charger l'alerte.",
        variant: "error",
      });
    }
  }

  async function handleTakeCharge(id: number) {
    try {
      await takeChargeAlerte(id);
      toast({ title: "Alerte prise en charge", variant: "success" });
      reload();
    } catch (e) {
      toast({
        title: "Erreur",
        description: e instanceof Error ? e.message : "Action impossible.",
        variant: "error",
      });
    }
  }

  async function handleResolve(id: number) {
    try {
      await resolveAlerte(id);
      toast({ title: "Alerte résolue", variant: "success" });
      reload();
    } catch (e) {
      toast({
        title: "Erreur",
        description: e instanceof Error ? e.message : "Action impossible.",
        variant: "error",
      });
    }
  }

  async function handleDetect() {
    try {
      const result = await detectAlertes();
      toast({
        title: "Détection exécutée",
        description: `${result.created} créée(s), ${result.updated} mise(s) à jour, ${result.resolved} résolue(s).`,
        variant: "success",
      });
      reload();
    } catch (e) {
      toast({
        title: "Erreur",
        description: e instanceof Error ? e.message : "Détection impossible.",
        variant: "error",
      });
    }
  }

  async function handleCreate(payload: Parameters<typeof createAlerte>[0]) {
    await createAlerte(payload);
    setCreateOpen(false);
    toast({ title: "Alerte créée", variant: "success" });
    reload();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alertes sanitaires"
        description="Niveaux de risque et prise en charge des alertes."
      >
        {isAdmin ? (
          <>
            <Button variant="outline" onClick={handleDetect}>
              <Zap className="size-4" />
              Lancer la détection
            </Button>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" />
              Créer une alerte
            </Button>
          </>
        ) : null}
      </PageHeader>

      {freshness ? <DataFreshness freshness={freshness} /> : null}

      {error ? (
        <Alert variant="error">
          <span className="flex items-center justify-between gap-3">
            {error}
            <Button variant="ghost" size="sm" onClick={reload}>
              <RefreshCw className="size-4" />
              Réessayer
            </Button>
          </span>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Alertes enregistrées</CardTitle>
          <CardDescription>
            {alerts.length} alerte{alerts.length > 1 ? "s" : ""} · cliquer sur
            une alerte pour l&apos;historique.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Select
              label="Statut"
              value={filters.statut}
              onChange={(e) => setFilters((prev) => ({ ...prev, statut: e.target.value }))}
              placeholder="Tous les statuts"
              options={[
                { value: "Active", label: "Active" },
                { value: "EnPriseEnCharge", label: "En prise en charge" },
                { value: "Resolue", label: "Résolue" },
              ]}
            />
            <Select
              label="Niveau de risque"
              value={filters.niveau}
              onChange={(e) => setFilters((prev) => ({ ...prev, niveau: e.target.value }))}
              placeholder="Tous les niveaux"
              options={["Normal", "Surveillance", "Alerte", "Critique"].map((n) => ({
                value: n,
                label: n,
              }))}
            />
            <Select
              label="Maladie"
              value={filters.maladieId}
              onChange={(e) => setFilters((prev) => ({ ...prev, maladieId: e.target.value }))}
              placeholder="Toutes les maladies"
              options={(options?.maladies ?? []).map((m) => ({
                value: String(m.id),
                label: m.name,
              }))}
            />
          </div>

          {loading ? (
            <p className="py-8 text-center text-sm text-text-muted">Chargement des alertes...</p>
          ) : alerts.length === 0 ? (
            <p className="py-8 text-center text-sm text-text-muted">
              Aucune alerte ne correspond aux critères.
            </p>
          ) : (
            <div className="divide-y divide-border">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    "flex flex-col gap-3 border-l-2 py-3 pl-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center",
                    NIVEAU_ROW[alert.niveauRisque]?.accent ?? "border-l-text-subtle",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => openDetail(alert)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <span
                      className={cn(
                        "grid size-9 shrink-0 place-items-center rounded-lg",
                        NIVEAU_ROW[alert.niveauRisque]?.icon ?? "bg-bg-app text-text-muted",
                      )}
                    >
                      <AlertTriangle className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-sm font-medium text-text-main">
                          {alert.maladie?.name ?? "Toutes maladies"}
                        </span>
                        <RiskBadge niveau={alert.niveauRisque} />
                      </span>
                      <span className="mt-0.5 flex items-center gap-1 text-xs text-text-muted">
                        <DiseaseIcon name={alert.maladie?.iconName} className="size-3" />
                        {alert.zone.name} · {alert.detectedCaseCount} cas ·{" "}
                        {formatDate(alert.detectionDate)}
                      </span>
                    </span>
                  </button>

                  <div className="flex shrink-0 items-center justify-end gap-2">
                    <AlertStatusBadge statut={alert.statut} />
                    {isAdmin && alert.statut === "Active" ? (
                      <Button variant="secondary" size="sm" onClick={() => handleTakeCharge(alert.id)}>
                        Prendre en charge
                      </Button>
                    ) : null}
                    {isAdmin && alert.statut !== "Resolue" ? (
                      <Button variant="outline" size="sm" onClick={() => handleResolve(alert.id)}>
                        <CheckCircle2 className="size-3.5" />
                        Résoudre
                      </Button>
                    ) : null}
                    <Button variant="ghost" size="sm" onClick={() => openDetail(alert)} aria-label="Détails">
                      <Eye className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {isAdmin ? (
        <RulesPanel options={options} onRulesChanged={reload} />
      ) : null}

      {createOpen && options ? (
        <Modal
          open
          onClose={() => setCreateOpen(false)}
          title="Créer une alerte"
          description="Créez manuellement une alerte sanitaire."
          size="lg"
        >
          <AlertForm
            options={options}
            onSubmit={handleCreate}
            onCancel={() => setCreateOpen(false)}
          />
        </Modal>
      ) : null}

      {detail ? (
        <Modal
          open={detailOpen}
          onClose={() => {
            setDetailOpen(false);
            setDetail(null);
          }}
          title={`Alerte ${detail.id} — ${detail.maladie?.name ?? "Toutes maladies"}`}
          description={`${detail.zone.name} · ${formatDate(detail.detectionDate)}`}
          size="lg"
        >
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <RiskBadge niveau={detail.niveauRisque} />
              <AlertStatusBadge statut={detail.statut} />
              <span className="text-sm text-text-muted">
                {detail.detectedCaseCount} cas détectés
              </span>
            </div>

            {detail.commentaire ? (
              <p className="rounded-lg bg-bg-app p-3 text-sm text-text-main">
                {detail.commentaire}
              </p>
            ) : null}

            <div className="text-sm text-text-muted">
              {detail.assignee ? (
                <p>Prise en charge par : {detail.assignee.name}</p>
              ) : null}
              {detail.resolveur ? (
                <p>Résolue par : {detail.resolveur.name}</p>
              ) : null}
              {detail.regle ? (
                <p>Règle : {detail.regle.name}</p>
              ) : null}
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-text-main">
                Historique
              </h3>
              <ol className="space-y-2 border-l border-border pl-4">
                {(detail.historique ?? []).map((entry) => (
                  <li key={entry.id} className="relative">
                    <span className="absolute -left-[21px] top-1.5 size-2.5 rounded-full border-2 border-primary bg-bg-surface" />
                    <p className="text-sm font-medium text-text-main">
                      {ACTION_LABEL[entry.action] ?? entry.action}
                    </p>
                    <p className="text-xs text-text-muted">
                      {entry.detail ?? ""}
                      {entry.utilisateur ? ` — ${entry.utilisateur.name}` : ""} ·{" "}
                      {formatDate(entry.date, {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </li>
                ))}
                {(detail.historique ?? []).length === 0 ? (
                  <p className="text-sm text-text-muted">Aucun événement.</p>
                ) : null}
              </ol>
            </div>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}