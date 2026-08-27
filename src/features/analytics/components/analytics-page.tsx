"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  HeartPulse,
  RefreshCw,
  Skull,
  TrendingUp,
  Percent,
  FlaskConical,
} from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { EvolutionChart } from "@/features/dashboard/components/evolution-chart";
import { AnalyticsFilters, type AnalyticsFiltersState } from "@/features/analytics/components/analytics-filters";
import { EpidemioMap } from "@/features/analytics/components/epidemio-map";
import { PeriodComparison } from "@/features/analytics/components/period-comparison";
import { RegionalComparison } from "@/features/analytics/components/regional-comparison";
import { periodToRange } from "@/features/analytics/constants";
import {
  fetchAnalyticsOptions,
  fetchAnalyticsSummary,
} from "@/features/analytics/services/analytics";
import type {
  AnalyticsOptions,
  AnalyticsSummary,
  IndicatorKey,
} from "@/features/analytics/types";
import { INDICATORS } from "@/features/analytics/types";

const DEFAULT_FILTERS: AnalyticsFiltersState = {
  period: "30d",
  indicator: "total",
};

export function AnalyticsPage() {
  const [filters, setFilters] = useState<AnalyticsFiltersState>(DEFAULT_FILTERS);
  const [options, setOptions] = useState<AnalyticsOptions | null>(null);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const data = await fetchAnalyticsOptions();
        if (active) {
          setOptions(data);
        }
      } catch {
        // Les options sont rafraîchies avec le summary
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const { from, to } = periodToRange(filters.period);

    (async () => {
      setLoading(true);
      try {
        const data = await fetchAnalyticsSummary({
          maladieId: filters.maladieId,
          regionId: filters.regionId,
          districtId: filters.districtId,
          from,
          to,
        });
        if (active) {
          setSummary(data);
          setError(null);
        }
      } catch (e) {
        if (active) {
          setError(
            e instanceof Error ? e.message : "Impossible de charger les analyses.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [filters.maladieId, filters.regionId, filters.districtId, filters.period]);

  const indicator = filters.indicator as IndicatorKey;
  const totals = summary?.totals;
  const indicatorLabel =
    INDICATORS.find((i) => i.key === filters.indicator)?.label ?? "";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analyses avancées"
        description="Analysez les données épidémiologiques par maladie, zone et période."
      />

      <AnalyticsFilters
        options={options}
        values={filters}
        onChange={setFilters}
      />

      {error ? (
        <Alert variant="error">
          <span className="flex items-center justify-between gap-3">
            {error}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilters({ ...filters })}
            >
              <RefreshCw className="size-4" />
              Réessayer
            </Button>
          </span>
        </Alert>
      ) : null}

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        <StatCard
          title="Nouveaux cas"
          value={String(totals?.total ?? 0)}
          icon={TrendingUp}
          tone="info"
          hint="période"
        />
        <StatCard
          title="Cas actifs"
          value={String(totals?.active ?? 0)}
          icon={Activity}
          tone="warning"
          hint="en cours"
        />
        <StatCard
          title="Guéris"
          value={String(totals?.recovered ?? 0)}
          icon={HeartPulse}
          tone="success"
          hint="issue clinique"
        />
        <StatCard
          title="Décès"
          value={String(totals?.deceased ?? 0)}
          icon={Skull}
          tone="danger"
          hint="issue clinique"
        />
        <StatCard
          title="Létalité"
          value={`${totals?.lethalityRate ?? 0}%`}
          icon={Percent}
          tone="danger"
          hint="décès / cas"
        />
        <StatCard
          title="Guérison"
          value={`${totals?.recoveryRate ?? 0}%`}
          icon={FlaskConical}
          tone="success"
          hint="guéris / cas"
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Carte épidémiologique interactive</CardTitle>
            <CardDescription>
              Intensité par région selon l&apos;indicateur « {indicatorLabel} ».
              Cliquez sur une région pour filtrer.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="py-8 text-center text-sm text-text-muted">
                Calcul des agrégations...
              </p>
            ) : (
              <EpidemioMap
                regions={summary?.byRegion ?? []}
                indicator={indicator}
                selectedRegionId={filters.regionId}
                onSelectRegion={(id) =>
                  setFilters((prev) => ({
                    ...prev,
                    regionId: id ?? undefined,
                    districtId: undefined,
                  }))
                }
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Comparaison entre régions</CardTitle>
            <CardDescription>
              Répartition par région pour l&apos;indicateur sélectionné.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RegionalComparison
              regions={summary?.byRegion ?? []}
              indicator={indicator}
            />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Évolution temporelle</CardTitle>
            <CardDescription>
              Nombre de cas déclarés par {filters.period === "all" ? "semaine" : "jour"}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EvolutionChart data={summary?.evolution ?? []} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Comparaison entre périodes</CardTitle>
            <CardDescription>
              Période actuelle vs période précédente de même durée.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PeriodComparison comparison={summary?.comparison ?? null} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}