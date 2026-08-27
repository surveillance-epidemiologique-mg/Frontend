"use client";

import { MapPin } from "lucide-react";
import {
  formatIndicator,
  indicatorColor,
} from "@/features/analytics/constants";
import type { IndicatorKey, RegionStat } from "@/features/analytics/types";
import { cn } from "@/lib/utils";

interface EpidemioMapProps {
  regions: RegionStat[];
  indicator: IndicatorKey;
  selectedRegionId?: number;
  onSelectRegion: (id: number | null) => void;
}

function valueOf(region: RegionStat, indicator: IndicatorKey): number {
  return region[indicator];
}

export function EpidemioMap({
  regions,
  indicator,
  selectedRegionId,
  onSelectRegion,
}: EpidemioMapProps) {
  const max = Math.max(
    1,
    ...regions.map((region) => valueOf(region, indicator)),
  );

  if (regions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-center">
        <MapPin className="size-6 text-text-subtle" />
        <p className="text-sm text-text-muted">
          Aucune donnée pour la sélection actuelle.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {regions.map((region) => {
          const value = valueOf(region, indicator);
          const alpha = 0.15 + 0.75 * (value / max);
          const active = region.regionId === selectedRegionId;

          return (
            <button
              key={region.regionId}
              type="button"
              onClick={() => onSelectRegion(active ? null : region.regionId)}
              aria-pressed={active}
              className={cn(
                "group flex items-center justify-between gap-3 rounded-xl border p-4 text-left transition-all duration-200 hover:-translate-y-px hover:shadow-md",
                active
                  ? "border-primary ring-2 ring-primary/30"
                  : "border-border hover:border-primary/40",
              )}
              style={{ backgroundColor: indicatorColor(indicator, alpha) }}
            >
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-sm font-semibold text-text-main">
                  <MapPin className="size-3.5 shrink-0 text-text-muted" />
                  <span className="truncate">{region.region}</span>
                </p>
                <p className="mt-0.5 text-xs text-text-muted">
                  {active ? "Cliquer pour retirer le filtre" : "Cliquer pour filtrer"}
                </p>
              </div>
              <span className="shrink-0 text-lg font-bold tabular-nums text-text-main">
                {formatIndicator(indicator, value)}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3 text-xs text-text-muted">
        <span>Intensité</span>
        <div className="h-2 flex-1 rounded-full bg-gradient-to-r from-primary/10 to-primary" />
        <span>
          {formatIndicator(indicator, 0)} → {formatIndicator(indicator, max)}
        </span>
      </div>
    </div>
  );
}