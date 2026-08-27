import type { Maladie } from "@/features/settings/types";

export type IndicatorKey =
  | "total"
  | "confirmed"
  | "suspect"
  | "active"
  | "recovered"
  | "deceased"
  | "lethalityRate"
  | "recoveryRate";

export interface IndicatorDef {
  key: IndicatorKey;
  label: string;
  unit?: string;
}

export const INDICATORS: IndicatorDef[] = [
  { key: "total", label: "Nouveaux cas" },
  { key: "active", label: "Cas actifs" },
  { key: "recovered", label: "Guéris" },
  { key: "deceased", label: "Décès" },
  { key: "confirmed", label: "Cas confirmés" },
  { key: "suspect", label: "Cas suspects" },
  { key: "lethalityRate", label: "Taux de létalité", unit: "%" },
  { key: "recoveryRate", label: "Taux de guérison", unit: "%" },
];

export interface AnalyticsTotals {
  total: number;
  confirmed: number;
  suspect: number;
  active: number;
  recovered: number;
  deceased: number;
  lethalityRate: number;
  recoveryRate: number;
}

export interface EvolutionPoint {
  date: string;
  count: number;
}

export interface RegionStat {
  regionId: number;
  region: string;
  total: number;
  confirmed: number;
  suspect: number;
  active: number;
  recovered: number;
  deceased: number;
  lethalityRate: number;
  recoveryRate: number;
}

export interface PeriodCounts {
  total: number;
  active: number;
  recovered: number;
  deceased: number;
}

export interface PeriodComparison {
  current: PeriodCounts;
  previous: PeriodCounts;
  delta: Record<keyof PeriodCounts, number>;
}

export interface AnalyticsSummary {
  totals: AnalyticsTotals;
  evolution: EvolutionPoint[];
  byRegion: RegionStat[];
  comparison: PeriodComparison | null;
}

export interface AnalyticsDistrict {
  id: number;
  name: string;
}

export interface AnalyticsRegion {
  id: number;
  name: string;
  districts: AnalyticsDistrict[];
}

export interface AnalyticsOptions {
  maladies: Maladie[];
  regions: AnalyticsRegion[];
}

export interface AnalyticsQuery {
  maladieId?: number;
  regionId?: number;
  districtId?: number;
  from?: string;
  to?: string;
}