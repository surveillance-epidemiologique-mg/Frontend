"use client";

import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { PeriodComparison } from "@/features/analytics/types";

interface PeriodComparisonProps {
  comparison: PeriodComparison | null;
}

const ROWS: { key: "total" | "active" | "recovered" | "deceased"; label: string }[] = [
  { key: "total", label: "Nouveaux cas" },
  { key: "active", label: "Cas actifs" },
  { key: "recovered", label: "Guéris" },
  { key: "deceased", label: "Décès" },
];

export function PeriodComparison({ comparison }: PeriodComparisonProps) {
  if (!comparison) {
    return (
      <p className="py-8 text-center text-sm text-text-muted">
        Sélectionnez une période pour comparer avec la période précédente.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 border-b border-border pb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
        <span>Période actuelle</span>
        <span className="text-right">Période précédente</span>
      </div>

      {ROWS.map((row) => {
        const current = comparison.current[row.key];
        const previous = comparison.previous[row.key];
        const delta = comparison.delta[row.key];
        const neutral = delta === 0;
        const positive = delta > 0;
        const TrendIcon = neutral ? Minus : positive ? ArrowUpRight : ArrowDownRight;

        return (
          <div key={row.key} className="flex items-center justify-between gap-3">
            <span className="w-28 shrink-0 text-sm font-medium text-text-main">
              {row.label}
            </span>
            <span className="flex-1 text-right text-sm tabular-nums text-text-main">
              {current}
            </span>
            <span className="flex-1 text-right text-sm tabular-nums text-text-muted">
              {previous}
            </span>
            <span
              className={cn(
                "flex w-20 shrink-0 items-center justify-end gap-0.5 text-xs font-semibold",
                neutral
                  ? "text-text-muted"
                  : positive
                    ? "text-success"
                    : "text-error",
              )}
            >
              <TrendIcon className="size-3.5" />
              {delta > 0 ? "+" : ""}
              {delta}%
            </span>
          </div>
        );
      })}

      <Card className="bg-bg-app">
        <CardContent className="space-y-1 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            Lecture
          </p>
          <p className="text-xs leading-relaxed text-text-muted">
            La comparaison oppose la période sélectionnée à la période précédente
            de même durée. Les pourcentages expriment la variation.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}