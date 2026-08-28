"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  Building2,
  Database,
  HeartPulse,
  MapPin,
  Percent,
  Plus,
  Radio,
  Settings2,
  Skull,
  TrendingUp,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { StatCard } from "@/components/ui/stat-card";
import { Switch } from "@/components/ui/switch";
import { NIVEAU_COLORS, NIVEAU_RANGES, NIVEAUX } from "@/features/map/constants";
import {
  fetchMapOptions,
  fetchMapStats,
  type EstablishmentMapData,
  type RegionMapData,
} from "@/features/map/services/map";
import {
  EvolutionChart,
} from "@/features/dashboard/components/evolution-chart";
import { StatusDonut } from "@/features/dashboard/components/status-donut";
import { useTheme } from "@/features/theme/theme-provider";
import {
  fetchSurveillance,
  PERIODS,
  periodRange,
  type PeriodKey,
  type SurveillanceData,
  type Niveau,
} from "@/features/dashboard/services/surveillance";
import type { SignalementOptions } from "@/features/cases/types";
import { useDashboardPreferences, type DashboardPreferences, type DashboardSection } from "@/features/dashboard/hooks/use-dashboard-preferences";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

const NIVEAU_LABEL: Record<Niveau, string> = {
  Aucun: "Aucun cas",
  Faible: "Faible",
  Modere: "Modéré",
  Eleve: "Élevé",
  Critique: "Critique",
};

const MapViewDynamic = dynamic(
  () => import("@/features/map/components/map-view").then((m) => m.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-sm text-text-muted">Chargement de la carte…</p>
      </div>
    ),
  },
);

interface DashboardViewProps {
  user: { name: string; email: string };
}

interface Filters {
  period: PeriodKey;
  customFrom: string;
  customTo: string;
  maladieId: string;
  regionId: string;
  districtId: string;
  centreId: string;
}

const DEFAULT_FILTERS: Filters = {
  period: "30d",
  customFrom: "",
  customTo: "",
  maladieId: "",
  regionId: "",
  districtId: "",
  centreId: "",
};

export function DashboardView({ user }: DashboardViewProps) {
  const { theme } = useTheme();
  const { prefs, toggle, reset } = useDashboardPreferences();
  const [customizeOpen, setCustomizeOpen] = useState(false);

  const [draft, setDraft] = useState<Filters>(DEFAULT_FILTERS);
  const [applied, setApplied] = useState<Filters>(DEFAULT_FILTERS);

  const [options, setOptions] = useState<SignalementOptions | null>(null);
  const [surveillance, setSurveillance] = useState<SurveillanceData | null>(null);
  const [mapRegions, setMapRegions] = useState<RegionMapData[]>([]);
  const [establishments, setEstablishments] = useState<EstablishmentMapData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [selectedEstablishment, setSelectedEstablishment] = useState<EstablishmentMapData | null>(null);

  useEffect(() => {
    let active = true;
    fetchMapOptions()
      .then((data) => {
        if (active) setOptions(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const { from, to } = periodRange(applied.period, applied.customFrom, applied.customTo);

    (async () => {
      setLoading(true);
      try {
        const [surv, map] = await Promise.all([
          fetchSurveillance({
            from,
            to,
            maladieId: applied.maladieId ? Number(applied.maladieId) : undefined,
            regionId: applied.regionId ? Number(applied.regionId) : undefined,
            districtId: applied.districtId ? Number(applied.districtId) : undefined,
            centreId: applied.centreId ? Number(applied.centreId) : undefined,
          }),
          fetchMapStats({
            maladieId: applied.maladieId ? Number(applied.maladieId) : undefined,
            regionId: applied.regionId ? Number(applied.regionId) : undefined,
            districtId: applied.districtId ? Number(applied.districtId) : undefined,
            centreId: applied.centreId ? Number(applied.centreId) : undefined,
            from,
            to,
          }),
        ]);
        if (!active) return;
        setSurveillance(surv);
        setMapRegions(map.regions);
        setEstablishments(map.establishments);
        setError(null);
      } catch (e) {
        if (active) {
          setError(e instanceof Error ? e.message : "Impossible de charger le tableau de bord.");
        }
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [applied]);

  function applyFilters() {
    setSelectedRegionId(null);
    setSelectedEstablishment(null);
    setApplied({ ...draft });
  }

  function resetFilters() {
    setSelectedRegionId(null);
    setSelectedEstablishment(null);
    setDraft(DEFAULT_FILTERS);
    setApplied(DEFAULT_FILTERS);
  }

  function setDiseaseFilter(maladieId: string) {
    setDraft((prev) => ({ ...prev, maladieId }));
    setApplied((prev) => ({ ...prev, maladieId }));
  }

  const selectedRegion = useMemo(() => {
    const mapRegion = mapRegions.find((r) => r.regionId === selectedRegionId);
    const surveilRegion = surveillance?.regions.find(
      (r) => r.regionId === selectedRegionId,
    );
    return { mapRegion, surveilRegion };
  }, [mapRegions, surveillance, selectedRegionId]);

  const selectedRegionOption = options?.regions.find((r) => String(r.id) === draft.regionId);
  const selectedDistrict = selectedRegionOption?.districts.find((d) => String(d.id) === draft.districtId);
  const centreOptions = selectedDistrict?.centres ?? [];

  const kpis = surveillance?.kpis;
  const lastUpdate = surveillance?.meta.generatedAt
    ? formatRelative(new Date(surveillance.meta.generatedAt))
    : null;

  const today = formatDate(new Date(), {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-4">
      {/* ZONE 1 — EN-TÊTE COMPACT */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold tracking-tight text-text-main">
            Surveillance épidémiologique de Madagascar
          </h1>
          <p className="mt-0.5 text-xs text-text-muted">
            Dashboard national · {today}
            {lastUpdate ? ` · Dernière mise à jour : ${lastUpdate}` : ""}
            {" · "}
            Connecté : {user.name}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {surveillance ? (
            <Badge
              variant={surveillance.meta.globalLevel === "Critique" || surveillance.meta.globalLevel === "Eleve" ? "danger" : surveillance.meta.globalLevel === "Modere" ? "warning" : "success"}
              dot
              className="px-2.5 py-1"
            >
              Situation : {NIVEAU_LABEL[surveillance.meta.globalLevel]}
            </Badge>
          ) : null}
          <div className="relative">
            <Button variant="outline" size="sm" onClick={() => setCustomizeOpen((open) => !open)} aria-expanded={customizeOpen}>
              <Settings2 className="size-4" />
              Personnaliser
            </Button>
            {customizeOpen ? (
              <CustomizeMenu prefs={prefs} onToggle={toggle} onReset={reset} onClose={() => setCustomizeOpen(false)} />
            ) : null}
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/reports">
              <Database className="size-4" />
              Exporter
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/cases">
              <Plus className="size-4" />
              Déclarer un cas
            </Link>
          </Button>
        </div>
      </div>

      {error ? <Card className="p-3 text-sm text-error">{error}</Card> : null}

      {/* ZONE 2 — BARRE DE FILTRES */}
      <Card>
        <CardContent className="p-3">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <Select
              label="Période"
              value={draft.period}
              onChange={(e) => setDraft((prev) => ({ ...prev, period: e.target.value as PeriodKey }))}
              options={PERIODS.map((p) => ({ value: p.value, label: p.label }))}
            />
            <Select
              label="Maladie"
              value={draft.maladieId}
              onChange={(e) => setDraft((prev) => ({ ...prev, maladieId: e.target.value }))}
              placeholder="Toutes les maladies"
              options={(options?.maladies ?? []).map((m) => ({ value: String(m.id), label: m.name }))}
            />
            <Select
              label="Région"
              value={draft.regionId}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, regionId: e.target.value, districtId: "", centreId: "" }))
              }
              placeholder="Toutes les régions"
              options={(options?.regions ?? []).map((r) => ({ value: String(r.id), label: r.name }))}
            />
            <Select
              label="District"
              value={draft.districtId}
              onChange={(e) => setDraft((prev) => ({ ...prev, districtId: e.target.value, centreId: "" }))}
              placeholder="Tous les districts"
              disabled={!draft.regionId}
              options={(selectedRegionOption?.districts ?? []).map((d) => ({ value: String(d.id), label: d.name }))}
            />
            <Select
              label="Établissement"
              value={draft.centreId}
              onChange={(e) => setDraft((prev) => ({ ...prev, centreId: e.target.value }))}
              placeholder="Tous les établissements"
              disabled={!draft.districtId}
              options={centreOptions.map((c) => ({ value: String(c.id), label: c.name }))}
            />
            {draft.period === "custom" ? (
              <div className="flex items-end gap-2">
                <input
                  type="date"
                  value={draft.customFrom}
                  onChange={(e) => setDraft((prev) => ({ ...prev, customFrom: e.target.value }))}
                  aria-label="Date de début"
                  className="h-10 w-full rounded-lg border border-border bg-bg-surface px-3 text-sm text-text-main focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <input
                  type="date"
                  value={draft.customTo}
                  onChange={(e) => setDraft((prev) => ({ ...prev, customTo: e.target.value }))}
                  aria-label="Date de fin"
                  className="h-10 w-full rounded-lg border border-border bg-bg-surface px-3 text-sm text-text-main focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            ) : null}
          </div>
          <div className="mt-3 flex items-center justify-end gap-2 border-t border-border pt-3">
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              Réinitialiser
            </Button>
            <Button size="sm" onClick={applyFilters} disabled={loading}>
              {loading ? "Chargement…" : "Appliquer"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ZONE 3 — INDICATEURS PRINCIPAUX (compacts) */}
      {prefs.stats ? (
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-7">
          <StatCard compact title="Total de cas" value={formatNumber(kpis?.total ?? 0)} icon={Database} tone="primary" trend={kpis?.deltas.total} />
          <StatCard compact title="Nouveaux cas" value={String(kpis?.newCases ?? 0)} icon={TrendingUp} tone="info" trend={kpis?.deltas.newCases} hint="7 j" />
          <StatCard compact title="Cas actifs" value={String(kpis?.active ?? 0)} icon={Activity} tone="warning" trend={kpis?.deltas.active} />
          <StatCard compact title="Décès" value={String(kpis?.deceased ?? 0)} icon={Skull} tone="danger" trend={kpis?.deltas.deceased} />
          <StatCard compact title="Guéris" value={String(kpis?.recovered ?? 0)} icon={HeartPulse} tone="success" trend={kpis?.deltas.recovered} />
          <StatCard compact title="Taux de létalité" value={kpis ? `${kpis.cfr}%` : "0%"} icon={Percent} tone="danger" />
          <StatCard compact title="Alertes actives" value={String(kpis?.activeAlerts ?? 0)} icon={Radio} tone="warning" />
        </section>
      ) : null}

      {/* ZONE 4 — ANALYSE : GRAPHIQUES + CARTE */}
      <section className="grid gap-4 xl:grid-cols-5">
        {/* Colonne gauche : évolution + répartition */}
        <div className="space-y-4 xl:order-last xl:col-span-2">
          {prefs.evolution ? (
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-base">Courbe épidémique</CardTitle>
                <CardDescription>Cas confirmés et suspectés par période.</CardDescription>
              </CardHeader>
              <CardContent>
                <EvolutionChart data={surveillance?.evolution ?? []} mode="curve" />
              </CardContent>
            </Card>
          ) : null}

          {prefs.distribution ? (
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-base">Répartition des statuts</CardTitle>
                <CardDescription>Statut des cas sur la période analysée.</CardDescription>
              </CardHeader>
              <CardContent>
                <StatusDonut
                  total={kpis?.total ?? 0}
                  data={[
                    { label: "Cas actifs", value: kpis?.active ?? 0, color: "#276696" },
                    { label: "Guéris", value: kpis?.recovered ?? 0, color: "#00a69c" },
                    { label: "Décès", value: kpis?.deceased ?? 0, color: "#a94442" },
                  ]}
                />
              </CardContent>
            </Card>
          ) : null}
        </div>

        {/* Colonne gauche : carte (dominante) */}
        {prefs.map ? (
          <Card className="overflow-hidden xl:order-first xl:col-span-3">
            <CardHeader className="flex-row items-center justify-between gap-3 space-y-0 py-4">
              <div className="space-y-0.5">
                <CardTitle className="text-base">Carte de Madagascar</CardTitle>
                <CardDescription>Régions colorées selon la situation réelle.</CardDescription>
              </div>
              <Select
                aria-label="Rechercher une région"
                value={selectedRegionId ? String(selectedRegionId) : ""}
                onChange={(e) => {
                  const id = e.target.value ? Number(e.target.value) : null;
                  setSelectedRegionId(id);
                  setSelectedEstablishment(null);
                }}
                placeholder="Rechercher…"
                options={(surveillance?.regions ?? []).map((r) => ({ value: String(r.regionId), label: r.region }))}
                className="w-36"
              />
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative h-[560px] w-full">
                {loading ? (
                  <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-bg-app/60 backdrop-blur-sm">
                    <p className="text-sm text-text-muted">Chargement…</p>
                  </div>
                ) : null}

                <MapViewDynamic
                  regionsData={mapRegions}
                  establishments={establishments}
                  selectedRegionId={selectedRegionId}
                  onSelectRegion={(id) => {
                    setSelectedRegionId(id);
                    setSelectedEstablishment(null);
                  }}
                  onSelectEstablishment={(est) => {
                    setSelectedEstablishment(est);
                    setSelectedRegionId(null);
                  }}
                  theme={theme}
                />

                {selectedRegion.mapRegion ? (
                  <div className="absolute bottom-3 left-3 z-[1000] w-64 rounded-xl border border-border bg-bg-surface/95 p-3 shadow-elevation-dropdown backdrop-blur-sm">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-text-main">{selectedRegion.mapRegion.region}</p>
                      <button type="button" onClick={() => setSelectedRegionId(null)} aria-label="Fermer" className="text-text-muted transition-colors hover:text-text-main">
                        <X className="size-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-muted">Niveau</span>
                      <Badge variant={selectedRegion.mapRegion.niveau === "Critique" || selectedRegion.mapRegion.niveau === "Eleve" ? "danger" : selectedRegion.mapRegion.niveau === "Modere" ? "warning" : "success"} dot>
                        {NIVEAU_LABEL[selectedRegion.mapRegion.niveau]}
                      </Badge>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                      <div><span className="text-text-muted">Cas : </span><span className="font-semibold text-text-main">{selectedRegion.mapRegion.total}</span></div>
                      <div><span className="text-text-muted">Nouveaux : </span><span className="font-semibold text-success">+{selectedRegion.mapRegion.newCases}</span></div>
                      <div><span className="text-text-muted">Actifs : </span><span className="font-semibold text-text-main">{selectedRegion.mapRegion.active}</span></div>
                      <div><span className="text-text-muted">Décès : </span><span className="font-semibold text-error">{selectedRegion.mapRegion.deceased}</span></div>
                      <div className="col-span-2"><span className="text-text-muted">Établissements : </span><span className="font-semibold text-text-main">{selectedRegion.mapRegion.establishmentsCount}</span></div>
                    </div>
                    {selectedRegion.surveilRegion && selectedRegion.surveilRegion.diseases.length > 0 ? (
                      <div className="mt-2 border-t border-border pt-2">
                        {selectedRegion.surveilRegion.diseases.slice(0, 3).map((d) => (
                          <p key={d.maladie} className="truncate text-xs text-text-main">
                            <span className="font-medium">{d.maladie}</span>{" "}
                            <span className="text-text-muted">· {d.newCases} nv · {d.deceased} décès</span>
                          </p>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {selectedEstablishment ? (
                  <div className="absolute bottom-3 left-3 z-[1000] w-64 rounded-xl border border-border bg-bg-surface/95 p-3 shadow-elevation-dropdown backdrop-blur-sm">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-text-main">{selectedEstablishment.name}</p>
                      <button type="button" onClick={() => setSelectedEstablishment(null)} aria-label="Fermer" className="text-text-muted transition-colors hover:text-text-main">
                        <X className="size-4" />
                      </button>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div><span className="text-text-muted">Type : </span><span className="font-medium text-text-main">{selectedEstablishment.type}</span></div>
                      <div><span className="text-text-muted">Région : </span><span className="font-medium text-text-main">{selectedEstablishment.region}</span></div>
                      <div><span className="text-text-muted">District : </span><span className="font-medium text-text-main">{selectedEstablishment.district}</span></div>
                      <div><span className="text-text-muted">Adresse : </span><span className="font-medium text-text-main">{selectedEstablishment.address ?? "—"}</span></div>
                      <div><span className="text-text-muted">Cas : </span><span className="font-semibold text-text-main">{selectedEstablishment.cases}</span></div>
                      <div><span className="text-text-muted">Niveau : </span>
                        <Badge variant={selectedEstablishment.niveau === "Critique" || selectedEstablishment.niveau === "Eleve" ? "danger" : "secondary"}>{NIVEAU_LABEL[selectedEstablishment.niveau]}</Badge>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="mt-2 w-full" asChild>
                      <Link href="/etablissements">Voir l&apos;établissement</Link>
                    </Button>
                  </div>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border px-4 py-2.5">
                <span className="text-[11px] font-medium uppercase tracking-wider text-text-muted">
                  Nombre de cas
                </span>
                {NIVEAUX.map((niveau) => (
                  <span key={niveau} className="flex items-center gap-1.5 text-xs text-text-muted">
                    <span className="size-3 rounded-full border border-black/10" style={{ backgroundColor: NIVEAU_COLORS[niveau] }} />
                    <span className="tabular-nums text-text-main">{NIVEAU_RANGES[niveau]}</span>
                  </span>
                ))}
                <span className="ml-auto flex items-center gap-1 text-xs text-text-muted">
                  <MapPin className="size-3.5" />
                  {establishments.length} établissement(s)
                </span>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </section>

      {/* ZONE 5 — SITUATION DES MALADIES */}
      {prefs.diseases ? (
        <Card>
          <CardHeader className="flex-row items-center justify-between gap-3 space-y-0 py-4">
            <div className="space-y-0.5">
              <CardTitle className="text-base">Situation des maladies</CardTitle>
              <CardDescription>Maladies surveillées et niveau de risque.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/statistiques">Analyses détaillées</Link>
            </Button>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {surveillance && surveillance.diseases.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-sm">
                  <thead>
                    <tr className="border-y border-border bg-bg-muted/60 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                      <th className="px-4 py-2 text-left">Maladie</th>
                      <th className="px-4 py-2 text-right">Cas</th>
                      <th className="px-4 py-2 text-right">Nouveaux</th>
                      <th className="px-4 py-2 text-right">Décès</th>
                      <th className="px-4 py-2 text-left">Région principale</th>
                      <th className="px-4 py-2 text-right">Niveau</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {surveillance.diseases.map((disease) => (
                      <tr
                        key={disease.maladie}
                        onClick={() => {
                          setDiseaseFilter(String(options?.maladies.find((m) => m.name === disease.maladie)?.id ?? ""));
                          setSelectedRegionId(null);
                        }}
                        className="cursor-pointer transition-colors hover:bg-bg-app"
                      >
                        <td className="px-4 py-2 font-medium text-text-main">{disease.maladie}</td>
                        <td className="px-4 py-2 text-right font-semibold tabular-nums text-text-main">{disease.total}</td>
                        <td className="px-4 py-2 text-right font-semibold tabular-nums text-success">+{disease.newCases}</td>
                        <td className="px-4 py-2 text-right font-semibold tabular-nums text-error">{disease.deceased}</td>
                        <td className="px-4 py-2 text-text-muted">{disease.topRegion ?? "—"}</td>
                        <td className="px-4 py-2 text-right">
                          <Badge variant={disease.niveau === "Critique" || disease.niveau === "Eleve" ? "danger" : disease.niveau === "Modere" ? "warning" : "success"}>
                            {NIVEAU_LABEL[disease.niveau]}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="py-6 text-center text-sm text-text-muted">
                {loading ? "Calcul de la situation…" : "Aucune donnée pour cette période."}
              </p>
            )}
          </CardContent>
        </Card>
      ) : null}

      {/* ZONE 6 — CAS PAR RÉGION */}
      {prefs.distribution ? (
        <Card>
          <CardHeader className="flex-row items-center justify-between gap-3 space-y-0 py-4">
            <div className="space-y-0.5">
              <CardTitle className="text-base">Cas par région</CardTitle>
              <CardDescription>Cliquez sur une ligne pour l&apos;afficher sur la carte.</CardDescription>
            </div>
            <Badge variant="secondary">Top {Math.min(10, (surveillance?.regions ?? []).filter((r) => r.total > 0).length)}</Badge>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {(surveillance?.regions ?? []).filter((r) => r.total > 0).length === 0 ? (
              <p className="py-6 text-center text-sm text-text-muted">
                Aucune donnée pour la période affichée.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm">
                  <thead>
                    <tr className="border-y border-border bg-bg-muted/60 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                      <th className="px-4 py-2 text-left">Région</th>
                      <th className="px-4 py-2 text-right">Cas</th>
                      <th className="px-4 py-2 text-right">Nouveaux</th>
                      <th className="px-4 py-2 text-right">Actifs</th>
                      <th className="px-4 py-2 text-right">Décès</th>
                      <th className="px-4 py-2 text-right">Établissements</th>
                      <th className="px-4 py-2 text-right">Niveau</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {(surveillance?.regions ?? [])
                      .filter((r) => r.total > 0)
                      .sort((a, b) => b.total - a.total)
                      .slice(0, 10)
                      .map((region) => (
                        <tr
                          key={region.regionId}
                          onClick={() => {
                            setSelectedRegionId(region.regionId);
                            setSelectedEstablishment(null);
                          }}
                          className={cn(
                            "cursor-pointer transition-colors hover:bg-bg-app",
                            selectedRegionId === region.regionId && "bg-primary-light",
                          )}
                        >
                          <td className="px-4 py-2 font-medium text-text-main">{region.region}</td>
                          <td className="px-4 py-2 text-right font-semibold tabular-nums text-text-main">{region.total}</td>
                          <td className="px-4 py-2 text-right font-semibold tabular-nums text-success">+{region.newCases}</td>
                          <td className="px-4 py-2 text-right tabular-nums text-text-main">{region.active}</td>
                          <td className="px-4 py-2 text-right tabular-nums text-error">{region.deceased}</td>
                          <td className="px-4 py-2 text-right tabular-nums text-text-main">{region.establishmentsCount}</td>
                          <td className="px-4 py-2 text-right">
                            <Badge variant={region.niveau === "Critique" || region.niveau === "Eleve" ? "danger" : region.niveau === "Modere" ? "warning" : "success"}>
                              {NIVEAU_LABEL[region.niveau]}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

      {/* ZONE 7 — ALERTES | ZONES PRIORITAIRES | ÉTABLISSEMENTS */}
      {prefs.alerts || prefs.priorityZones || prefs.establishments ? (
        <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {prefs.alerts && surveillance && surveillance.activeAlerts.length > 0 ? (
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-base">Alertes récentes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {surveillance.activeAlerts.slice(0, 5).map((alert) => (
                  <Link
                    key={alert.id}
                    href="/alerts"
                    className="flex items-start gap-2.5 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-bg-app"
                  >
                    <span
                      className={cn(
                        "mt-0.5 grid size-6 shrink-0 place-items-center rounded-md",
                        alert.niveauRisque === "Critique" || alert.niveauRisque === "Alerte"
                          ? "bg-error/10 text-error"
                          : "bg-warning/10 text-warning",
                      )}
                    >
                      <AlertTriangle className="size-3.5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-text-main">{alert.maladie}</span>
                      <span className="block text-xs text-text-muted">
                        {alert.zone} · {formatDate(new Date(alert.detectionDate))}
                      </span>
                    </span>
                  </Link>
                ))}
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href="/alerts">Voir toutes les alertes</Link>
                </Button>
              </CardContent>
            </Card>
          ) : null}

          {prefs.priorityZones && surveillance && surveillance.priorityZones.length > 0 ? (
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-base">Zones prioritaires</CardTitle>
                <CardDescription>Régions nécessitant une attention immédiate.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {surveillance.priorityZones.map((zone) => (
                  <button
                    key={zone.regionId}
                    type="button"
                    onClick={() => {
                      setSelectedRegionId(zone.regionId);
                      setSelectedEstablishment(null);
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-bg-app"
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="grid size-6 shrink-0 place-items-center rounded-md bg-bg-muted text-xs font-semibold text-text-muted">
                        {zone.rank}
                      </span>
                      <span className="font-medium text-text-main">{zone.region}</span>
                    </span>
                    <Badge variant={zone.niveau === "Critique" || zone.niveau === "Eleve" ? "danger" : "warning"}>
                      {NIVEAU_LABEL[zone.niveau]}
                    </Badge>
                  </button>
                ))}
              </CardContent>
            </Card>
          ) : null}

          {prefs.establishments && surveillance && surveillance.establishments.total > 0 ? (
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-base">Établissements de santé</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <SummaryRow label="Nombre total" value={surveillance.establishments.total} />
                <SummaryRow label="Établissements actifs" value={surveillance.establishments.active} />
                <SummaryRow label="Ont signalé des cas" value={surveillance.establishments.withCases} />
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href="/etablissements">Voir les établissements</Link>
                </Button>
              </CardContent>
            </Card>
          ) : null}

          {prefs.recentCases ? (
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-base">Derniers cas déclarés</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(surveillance?.recentCases ?? []).slice(0, 5).map((cas) => (
                  <div key={cas.id} className="flex items-center justify-between gap-2 px-2 py-1 text-sm">
                    <span className="truncate font-medium text-text-main">{cas.maladie}</span>
                    <span className="truncate text-xs text-text-muted">{cas.zone}</span>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href="/cases">Tous les signalements</Link>
                </Button>
              </CardContent>
            </Card>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("fr-FR").format(value);
}

function SummaryRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-text-muted">{label}</span>
      <span className="font-semibold tabular-nums text-text-main">{value}</span>
    </div>
  );
}

function formatRelative(date: Date): string {
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return "à l'instant";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  return formatDate(date);
}

const SECTION_LABELS: { key: DashboardSection; label: string }[] = [
  { key: "stats", label: "Indicateurs nationaux" },
  { key: "map", label: "Carte de Madagascar" },
  { key: "evolution", label: "Évolution des cas" },
  { key: "distribution", label: "Répartition par région" },
  { key: "diseases", label: "Situation des maladies" },
  { key: "alerts", label: "Alertes actives" },
  { key: "priorityZones", label: "Zones prioritaires" },
  { key: "establishments", label: "Établissements de santé" },
  { key: "recentCases", label: "Derniers cas déclarés" },
];

function CustomizeMenu({
  prefs,
  onToggle,
  onReset,
  onClose,
}: {
  prefs: DashboardPreferences;
  onToggle: (section: DashboardSection) => void;
  onReset: () => void;
  onClose: () => void;
}) {
  return (
    <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-border bg-bg-surface p-3 shadow-elevation-dropdown">
      <p className="px-1 pb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
        Afficher les sections
      </p>
      <div className="space-y-0.5">
        {SECTION_LABELS.map((section) => (
          <div
            key={section.key}
            role="button"
            tabIndex={0}
            onClick={() => onToggle(section.key)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onToggle(section.key);
              }
            }}
            className="flex w-full cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 text-sm text-text-main transition-colors hover:bg-bg-app focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <span>{section.label}</span>
            <Switch checked={prefs[section.key]} onCheckedChange={() => onToggle(section.key)} label={section.label} />
          </div>
        ))}
      </div>
      <div className="mt-2 border-t border-border pt-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={() => {
            onReset();
            onClose();
          }}
        >
          Réinitialiser le tableau de bord
        </Button>
      </div>
    </div>
  );
}