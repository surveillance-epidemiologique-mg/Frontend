import type { IndicatorKey } from "@/features/analytics/types";

export type PeriodKey = "7d" | "30d" | "90d" | "year" | "all";

export interface PeriodDef {
  value: PeriodKey;
  label: string;
}

export const PERIODS: PeriodDef[] = [
  { value: "7d", label: "7 derniers jours" },
  { value: "30d", label: "30 derniers jours" },
  { value: "90d", label: "90 derniers jours" },
  { value: "year", label: "Cette année" },
  { value: "all", label: "Toutes les périodes" },
];

export function periodToRange(
  period: PeriodKey,
): { from?: string; to?: string } {
  const to = new Date();
  if (period === "all") {
    return {};
  }

  const from = new Date();
  if (period === "7d") {
    from.setDate(to.getDate() - 7);
  } else if (period === "30d") {
    from.setDate(to.getDate() - 30);
  } else if (period === "90d") {
    from.setDate(to.getDate() - 90);
  } else if (period === "year") {
    from.setFullYear(to.getFullYear(), 0, 1);
  }

  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

const COLOR_RGB: Record<IndicatorKey, string> = {
  total: "37, 99, 235", // chart-1 bleu
  confirmed: "245, 158, 11", // chart-4 ambre
  suspect: "139, 92, 246", // chart-6 violet
  active: "14, 165, 233", // chart-2 ciel
  recovered: "16, 185, 129", // chart-3 émeraude
  deceased: "239, 68, 68", // chart-5 rouge
  lethalityRate: "239, 68, 68",
  recoveryRate: "16, 185, 129",
};

export function indicatorColor(key: IndicatorKey, alpha = 1): string {
  return `rgba(${COLOR_RGB[key]}, ${alpha})`;
}

export function formatIndicator(
  key: IndicatorKey,
  value: number,
): string {
  if (key === "lethalityRate" || key === "recoveryRate") {
    return `${value.toFixed(1)} %`;
  }
  return new Intl.NumberFormat("fr-FR").format(value);
}