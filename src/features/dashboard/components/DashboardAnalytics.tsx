"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Bell,
  ClipboardList,
  RotateCcw,
  Skull,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import {
  ConfirmedTrendChart,
  DiseasePieChart,
  MonthlyCasesChart,
  StatusDonutChart,
  type BarPoint,
  type SlicePoint,
  type TrendPoint,
} from "@/features/dashboard/components/charts";

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
}

const EMPTY_FILTERS: Filters = {
  from: "",
  to: "",
  zoneId: "",
  maladieId: "",
};

const KPI_ICONS: Record<string, LucideIcon> = {
  incidence: Activity,
  letality: Skull,
  alerts: Bell,
  cases: ClipboardList,
};

const FIELD_CLASSES =
  "h-10 w-full rounded-lg border border-border bg-bg-surface px-3 text-sm text-text-main transition-colors duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60";

function buildQuery(f: Filters): string {
  const params = new URLSearchParams();
  if (f.from) params.set("from", f.from);
  if (f.to) params.set("to", f.to);
  if (f.zoneId) params.set("zoneId", f.zoneId);
  if (f.maladieId) params.set("maladieId", f.maladieId);
  const s = params.toString();
  return s ? `?${s}` : "";
}

export function DashboardAnalytics() {
  const [zones, setZones] = useState<Option[]>([]);
  const [maladies, setMaladies] = useState<Option[]>([]);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [loading, setLoading] = useState(true);

  const [kpi, setKpi] = useState<KpiData | null>(null);
  const [monthly, setMonthly] = useState<BarPoint[]>([]);
  const [evolution, setEvolution] = useState<TrendPoint[]>([]);
  const [byDisease, setByDisease] = useState<SlicePoint[]>([]);
  const [byStatus, setByStatus] = useState<SlicePoint[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [z, m] = await Promise.all([
          fetch("/api/centres/zones").then((r) => (r.ok ? r.json() : [])),
          fetch("/api/maladies").then((r) => (r.ok ? r.json() : [])),
        ]);
        if (!active) return;
        setZones(z);
        setMaladies(m);
      } catch {
        // API indisponible : listes vides
      }
    })();
    return () => {
      active = false;
    };
  }, []);

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
    setFilters(EMPTY_FILTERS);
  }

  const hasActive = useMemo(
    () => Object.values(filters).some(Boolean),
    [filters],
  );

  const kpis = useMemo(() => {
    if (!kpi) return [];
    return [
      {
        key: "incidence",
        title: "Taux d'incidence",
        value: kpi.incidence.toLocaleString("fr-FR"),
        unit: "cas confirmés",
        tone: "info" as const,
        hint: "période filtrée",
      },
      {
        key: "letality",
        title: "Taux de létalité",
        value: String(kpi.letalite),
        unit: "%",
        tone: "danger" as const,
        hint: `${kpi.deces} décès`,
      },
      {
        key: "alerts",
        title: "Alertes actives",
        value: String(kpi.activeAlertes),
        unit: "alertes",
        tone: "warning" as const,
        hint: "détectées",
      },
      {
        key: "cases",
        title: "Cas déclarés",
        value: kpi.total.toLocaleString("fr-FR"),
        unit: "cas",
        tone: "primary" as const,
        hint: `${kpi.confirmed} confirmés`,
      },
    ];
  }, [kpi]);

  return (
    <div className="space-y-6">
      {/* DASH-02 · Barre de filtres spatio-temporels */}
      <Card>
        <CardContent className="pt-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-12">
            <div className="space-y-1.5 sm:col-span-2 xl:col-span-4">
              <label
                htmlFor="filter-periode"
                className="block text-sm font-medium text-text-main"
              >
                Période
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="filter-periode-debut"
                  type="date"
                  value={filters.from}
                  onChange={(e) => update("from", e.target.value)}
                  className={FIELD_CLASSES}
                  aria-label="Date de début"
                />
                <span className="shrink-0 text-text-muted">→</span>
                <input
                  type="date"
                  value={filters.to}
                  onChange={(e) => update("to", e.target.value)}
                  className={FIELD_CLASSES}
                  aria-label="Date de fin"
                />
              </div>
            </div>

            <div className="space-y-1.5 xl:col-span-3">
              <label
                htmlFor="filter-zone"
                className="block text-sm font-medium text-text-main"
              >
                Région / District
              </label>
              <select
                id="filter-zone"
                value={filters.zoneId}
                onChange={(e) => update("zoneId", e.target.value)}
                className={FIELD_CLASSES}
              >
                <option value="">Toutes</option>
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5 xl:col-span-3">
              <label
                htmlFor="filter-maladie"
                className="block text-sm font-medium text-text-main"
              >
                Maladie
              </label>
              <select
                id="filter-maladie"
                value={filters.maladieId}
                onChange={(e) => update("maladieId", e.target.value)}
                className={FIELD_CLASSES}
              >
                <option value="">Toutes</option>
                {maladies.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end xl:col-span-2">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={resetFilters}
                disabled={!hasActive}
              >
                <RotateCcw className="size-4" />
                Réinitialiser
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* DASH-01 · Cartes KPI */}
      <section
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Indicateurs clés"
      >
        {loading && !kpi ? (
          <Card className="p-5 text-sm text-text-muted xl:col-span-4">
            Chargement des indicateurs…
          </Card>
        ) : (
          kpis.map((item) => (
            <StatCard
              key={item.key}
              title={item.title}
              value={item.value}
              unit={item.unit}
              icon={KPI_ICONS[item.key]}
              tone={item.tone}
              hint={item.hint}
            />
          ))
        )}
      </section>

      {/* DASH-01 · Graphiques */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <ConfirmedTrendChart data={evolution} className="xl:col-span-2" />
        <DiseasePieChart data={byDisease} />
        <MonthlyCasesChart data={monthly} className="xl:col-span-2" />
        <StatusDonutChart data={byStatus} />
      </section>
    </div>
  );
}