"use client";

import { Select } from "@/components/ui/select";
import { INDICATORS } from "@/features/analytics/types";
import { PERIODS, type PeriodKey } from "@/features/analytics/constants";
import type { AnalyticsOptions } from "@/features/analytics/types";
import type { IndicatorKey } from "@/features/analytics/types";

export interface AnalyticsFiltersState {
  maladieId?: number;
  regionId?: number;
  districtId?: number;
  period: PeriodKey;
  indicator: IndicatorKey;
}

interface AnalyticsFiltersProps {
  options: AnalyticsOptions | null;
  values: AnalyticsFiltersState;
  onChange: (next: AnalyticsFiltersState) => void;
}

export function AnalyticsFilters({
  options,
  values,
  onChange,
}: AnalyticsFiltersProps) {
  const region = options?.regions.find(
    (r) => r.id === values.regionId,
  );
  const districts = region?.districts ?? [];

  function update(patch: Partial<AnalyticsFiltersState>) {
    const next = { ...values, ...patch };
    if (patch.regionId !== undefined && patch.regionId !== values.regionId) {
      next.districtId = undefined;
    }
    if (patch.maladieId !== undefined && patch.maladieId !== values.maladieId) {
      next.regionId = undefined;
      next.districtId = undefined;
    }
    onChange(next);
  }

  return (
    <div className="grid gap-4 rounded-2xl border border-border bg-bg-surface p-4 shadow-sm sm:grid-cols-2 xl:grid-cols-5">
      <Select
        label="Maladie"
        value={values.maladieId ? String(values.maladieId) : ""}
        onChange={(e) =>
          update({ maladieId: e.target.value ? Number(e.target.value) : undefined })
        }
        placeholder="Toutes les maladies"
        options={(options?.maladies ?? []).map((m) => ({
          value: String(m.id),
          label: m.name,
        }))}
      />
      <Select
        label="Région"
        value={values.regionId ? String(values.regionId) : ""}
        onChange={(e) =>
          update({ regionId: e.target.value ? Number(e.target.value) : undefined })
        }
        placeholder="Toutes les régions"
        options={(options?.regions ?? []).map((r) => ({
          value: String(r.id),
          label: r.name,
        }))}
      />
      <Select
        label="District"
        value={values.districtId ? String(values.districtId) : ""}
        onChange={(e) =>
          update({ districtId: e.target.value ? Number(e.target.value) : undefined })
        }
        placeholder="Tous les districts"
        disabled={!values.regionId}
        options={districts.map((d) => ({
          value: String(d.id),
          label: d.name,
        }))}
      />
      <Select
        label="Période"
        value={values.period}
        onChange={(e) => update({ period: e.target.value as PeriodKey })}
        options={PERIODS.map((p) => ({ value: p.value, label: p.label }))}
      />
      <Select
        label="Indicateur"
        value={values.indicator}
        onChange={(e) =>
          update({ indicator: e.target.value as IndicatorKey })
        }
        options={INDICATORS.map((i) => ({
          value: i.key,
          label: i.label,
        }))}
      />
    </div>
  );
}