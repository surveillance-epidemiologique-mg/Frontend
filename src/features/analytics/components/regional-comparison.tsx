"use client";

import {
  formatIndicator,
  indicatorColor,
} from "@/features/analytics/constants";
import type { IndicatorKey, RegionStat } from "@/features/analytics/types";
import { cn } from "@/lib/utils";

interface RegionalComparisonProps {
  regions: RegionStat[];
  indicator: IndicatorKey;
}

function valueOf(region: RegionStat, indicator: IndicatorKey): number {
  return region[indicator];
}

export function RegionalComparison({
  regions,
  indicator,
}: RegionalComparisonProps) {
  if (regions.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-text-muted">
        Aucune donnée géographique pour la sélection actuelle.
      </p>
    );
  }

  const total = regions.reduce((sum, r) => sum + valueOf(r, indicator), 0);
  const max = Math.max(1, ...regions.map((r) => valueOf(r, indicator)));

  return (
    <div className="space-y-4">
      {regions.map((region) => {
        const value = valueOf(region, indicator);
        const share = total > 0 ? Math.round((value / total) * 100) : 0;
        return (
          <div key={region.regionId}>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="truncate font-medium text-text-main">
                {region.region}
              </span>
              <span className="shrink-0 text-xs text-text-muted">
                {formatIndicator(indicator, value)} · {share}%
              </span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-bg-app">
              <div
                className="h-full rounded-full transition-[width] duration-500"
                style={{
                  width: `${(value / max) * 100}%`,
                  backgroundColor: indicatorColor(indicator, 1),
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ComparisonLegend({
  indicator,
}: {
  indicator: IndicatorKey;
}) {
  return (
    <span className="inline-flex items-center gap-2 text-xs text-text-muted">
      <span
        className={cn("size-2.5 rounded-full")}
        style={{ backgroundColor: indicatorColor(indicator, 1) }}
      />
      Valeur affichée : indicateur sélectionné
    </span>
  );
}