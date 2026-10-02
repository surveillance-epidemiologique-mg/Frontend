"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  Bell,
  CalendarRange,
  ClipboardList,
  FilterX,
  MapPin,
  RotateCcw,
  Skull,
  type LucideIcon,
} from "lucide-react";
import { StatCard, StatCardSkeleton } from "@/components/stat-card/component";
import { Select } from "@/components/select/component";
import {
  ConfirmedTrendChart,
  DiseasePieChart,
  MonthlyCasesChart,
  StatusDonutChart,
  type BarPoint,
  type SlicePoint,
  type TrendPoint,
} from "@/components/charts/component";
import { cn } from "@/lib/utils";

interface Option {
  id: number;
  name: string;
}

interface KpiData {
  incidence: number;
  letalite: number;
  deces: number;
  confirmed: number;
  total: number;
  activeAlertes: number;
}

interface Filters {
  from: string;
  to: string;
  zoneId: string;
  maladieId: string;
  centreId: string;
}

const EMPTY_FILTERS: Filters = {
  from: "",
  to: "",
  zoneId: "",
  maladieId: "",
  centreId: "all",
};

const KPI_ICONS: Record<string, LucideIcon> = {
  incidence: Activity,
  letality:  Skull,
  alerts:    Bell,
  cases:     ClipboardList,
};

const STAGGER = ["stagger-1", "stagger-2", "stagger-3", "stagger-4"] as const;

/* ── Styles partagés des champs de filtre ─────────────────────────────── */
const FIELD =
  "h-9 w-full rounded-lg border border-border bg-bg-muted px-3 text-sm text-text-main " +
  "transition-all duration-150 " +
  "focus:border-primary focus:bg-bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 " +
  "disabled:cursor-not-allowed disabled:opacity-60 " +
  "placeholder:text-text-subtle";

function buildQuery(f: Filters): string {
  const params = new URLSearchParams();
  if (f.from)     params.set("from", f.from);
  if (f.to)       params.set("to", f.to);
  if (f.zoneId)   params.set("zoneId", f.zoneId);
  if (f.maladieId) params.set("maladieId", f.maladieId);
  if (f.centreId) params.set("centreId", f.centreId === "all" ? "0" : f.centreId);
  const s = params.toString();
  return s ? `?${s}` : "";
}

/* ── Composant ─────────────────────────────────────────────────────────── */

export function DashboardAnalytics() {
  const [zones,    setZones]    = useState<Option[]>([]);
  const [centres,  setCentres]  = useState<Option[]>([]);
  const [maladies, setMaladies] = useState<Option[]>([]);
  const [filters,  setFilters]  = useState<Filters>(EMPTY_FILTERS);
  const [defaultCentreId, setDefaultCentreId] = useState("all");
  const defaultsApplied = useRef(false);
  const [loading,  setLoading]  = useState(true);

  const [kpi,       setKpi]       = useState<KpiData | null>(null);
  const [monthly,   setMonthly]   = useState<BarPoint[]>([]);
  const [evolution, setEvolution] = useState<TrendPoint[]>([]);
  const [byDisease, setByDisease] = useState<SlicePoint[]>([]);
  const [byStatus,  setByStatus]  = useState<SlicePoint[]>([]);

  /* Chargement listes de sélection */
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [me, z, c, m] = await Promise.all([
          fetch("/api/auth/me").then((r) => (r.ok ? r.json() : null)),
          fetch("/api/centres/zones").then((r) => (r.ok ? r.json() : [])),
          fetch("/api/centres").then((r) => (r.ok ? r.json() : [])),
          fetch("/api/maladies").then((r) => (r.ok ? r.json() : [])),
        ]);
        if (!active) return;
        const role = me?.role?.name;
        const ownCentreId = me?.centreId != null ? String(me.centreId) : "all";
        const initialCentreId =
          role === "Medecin" || role === "Laboratoire" ? ownCentreId : "all";
        setDefaultCentreId(initialCentreId);
        setFilters((previous) => {
          if (defaultsApplied.current) return previous;
          defaultsApplied.current = true;
          return { ...previous, centreId: initialCentreId };
        });
        setZones(z);
        setCentres(c);
        setMaladies(m);
      } catch {
        // API indisponible : listes vides
      }
    })();
    return () => { active = false; };
  }, []);

  /* Chargement KPI + graphiques */
  useEffect(() => {
    const id = setTimeout(() => {
      void (async () => {
        const qs = buildQuery(filters);
        try {
          const [k, mo, ev, bd, bs] = await Promise.all([
            fetch(`/api/dashboard/kpi${qs}`).then((r) => (r.ok ? r.json() : null)),
            fetch(`/api/dashboard/monthly${qs}`).then((r) => (r.ok ? r.json() : [])),
            fetch(`/api/dashboard/evolution${qs}`).then((r) => (r.ok ? r.json() : [])),
            fetch(`/api/dashboard/repartition${qs}&dimension=maladie`).then((r) =>
              r.ok ? r.json() : [],
            ),
            fetch(`/api/dashboard/repartition${qs}&dimension=statut`).then((r) =>
              r.ok ? r.json() : [],
            ),
          ]);
          setKpi(k);
          setMonthly(mo);
          setEvolution(ev);
          setByDisease(bd);
          setByStatus(bs);
        } catch {
          // erreur : on garde les données précédentes
        } finally {
          setLoading(false);
        }
      })();
    }, 300);
    return () => clearTimeout(id);
  }, [filters]);

  function update<K extends keyof Filters>(key: K, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function resetFilters() {
    setFilters({ ...EMPTY_FILTERS, centreId: defaultCentreId });
  }

  const activeCount = useMemo(
    () => Object.entries(filters).filter(([key, value]) =>
      Boolean(value) && !(key === "centreId" && value === defaultCentreId),
    ).length,
    [filters, defaultCentreId],
  );
  const hasActive = activeCount > 0;

  const kpis = useMemo(() => {
    if (!kpi) return [];
    return [
      {
        key:   "incidence",
        title: "Taux d'incidence",
        value: kpi.incidence.toLocaleString("fr-FR"),
        unit:  "cas confirmés",
        tone:  "info" as const,
        hint:  "période filtrée",
      },
      {
        key:   "letality",
        title: "Taux de létalité",
        value: String(kpi.letalite),
        unit:  "%",
        tone:  "danger" as const,
        hint:  `${kpi.deces} décès`,
      },
      {
        key:   "alerts",
        title: "Alertes actives",
        value: String(kpi.activeAlertes),
        unit:  "alertes",
        tone:  "warning" as const,
        hint:  "détectées",
      },
      {
        key:   "cases",
        title: "Cas déclarés",
        value: kpi.total.toLocaleString("fr-FR"),
        unit:  "cas",
        tone:  "primary" as const,
        hint:  `${kpi.confirmed} confirmés`,
      },
    ];
  }, [kpi]);

  return (
    <div className="space-y-6">

      {/* ── DASH-02 · Barre de filtres ─────────────────────────────── */}
      <div
        className={cn(
          "rounded-2xl border border-border bg-bg-surface/95 px-4 py-4 shadow-card",
          "backdrop-blur-md",
        )}
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FilterX className="size-4 text-text-muted" />
            <span className="text-sm font-semibold text-text-main">Filtres</span>
            {hasActive && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                {activeCount} actif{activeCount > 1 ? "s" : ""}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={resetFilters}
            disabled={!hasActive}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150",
              hasActive
                ? "text-error hover:bg-error/10 cursor-pointer"
                : "cursor-not-allowed text-text-subtle opacity-50",
            )}
          >
            <RotateCcw className="size-3" />
            Réinitialiser
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-12">
          {/* Période */}
          <div className="space-y-1.5 sm:col-span-2 xl:col-span-5">
            <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
              <CalendarRange className="size-3" />
              Période
            </label>
            <div className="flex items-center gap-2">
              <input
                id="filter-periode-debut"
                type="date"
                value={filters.from}
                onChange={(e) => update("from", e.target.value)}
                className={FIELD}
                aria-label="Date de début"
              />
              <span className="shrink-0 text-xs font-medium text-text-muted">→</span>
              <input
                type="date"
                value={filters.to}
                onChange={(e) => update("to", e.target.value)}
                className={FIELD}
                aria-label="Date de fin"
              />
            </div>
          </div>

          {/* Zone */}
          <div className="space-y-1.5 xl:col-span-3">
            <label
              htmlFor="filter-zone"
              className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-text-muted"
            >
              <MapPin className="size-3" />
              Région / District
            </label>
            <Select
              id="filter-zone"
              options={[
                { value: "", label: "Toutes les zones" },
                ...zones.map((z) => ({ value: String(z.id), label: z.name })),
              ]}
              value={filters.zoneId}
              onChange={(e) => update("zoneId", e.target.value)}
              className={FIELD}
            />
          </div>

          {/* Centre de santé */}
          <div className="space-y-1.5 xl:col-span-2">
            <label
              htmlFor="filter-centre"
              className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-text-muted"
            >
              <MapPin className="size-3" />
              Centre de santé
            </label>
            <Select
              id="filter-centre"
              options={[
                { value: "all", label: "Tous les centres" },
                ...centres.map((centre) => ({
                  value: String(centre.id),
                  label: centre.name,
                })),
              ]}
              value={filters.centreId}
              onChange={(e) => update("centreId", e.target.value)}
              className={FIELD}
            />
          </div>

          {/* Maladie */}
          <div className="space-y-1.5 xl:col-span-2">
            <label
              htmlFor="filter-maladie"
              className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-text-muted"
            >
              <Activity className="size-3" />
              Maladie
            </label>
            <Select
              id="filter-maladie"
              options={[
                { value: "", label: "Toutes" },
                ...maladies.map((m) => ({ value: String(m.id), label: m.name })),
              ]}
              value={filters.maladieId}
              onChange={(e) => update("maladieId", e.target.value)}
              className={FIELD}
            />
          </div>
        </div>
      </div>

      {/* ── DASH-01 · Cartes KPI ───────────────────────────────────── */}
      <section
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Indicateurs clés"
      >
        {loading && !kpi
          ? /* Skeleton loaders en stagger */
            (["stagger-1", "stagger-2", "stagger-3", "stagger-4"] as const).map(
              (cls) => (
                <div key={cls} className={cn("animate-fade-up", cls)}>
                  <StatCardSkeleton />
                </div>
              ),
            )
          : kpis.map((item, i) => (
              <div
                key={item.key}
                className={cn("animate-fade-up", STAGGER[i])}
              >
                <StatCard
                  title={item.title}
                  value={item.value}
                  unit={item.unit}
                  icon={KPI_ICONS[item.key]!}
                  tone={item.tone}
                  hint={item.hint}
                />
              </div>
            ))}
      </section>

      {/* ── DASH-01 · Graphiques ───────────────────────────────────── */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <ConfirmedTrendChart data={evolution} className="xl:col-span-2" />
        <DiseasePieChart     data={byDisease} />
        <MonthlyCasesChart  data={monthly}   className="xl:col-span-2" />
        <StatusDonutChart   data={byStatus}  />
      </section>

    </div>
  );
}
