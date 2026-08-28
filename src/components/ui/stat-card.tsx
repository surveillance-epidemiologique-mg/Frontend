import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatTone =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "info";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  tone?: StatTone;
  trend?: number;
  hint?: string;
  compact?: boolean;
}

const TONE_CLASSES: Record<StatTone, string> = {
  primary: "bg-primary/10 text-primary",
  secondary: "bg-secondary/10 text-secondary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-error/10 text-error",
  info: "bg-info/10 text-info",
};

export function StatCard({
  title,
  value,
  icon: Icon,
  tone = "primary",
  trend,
  hint,
  compact = false,
}: StatCardProps) {
  const trendIsPositive = (trend ?? 0) > 0;
  const trendIsNeutral = (trend ?? 0) === 0;
  const TrendIcon = trendIsNeutral
    ? Minus
    : trendIsPositive
      ? ArrowUpRight
      : ArrowDownRight;

  return (
    <Card
      className={cn(
        "group transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover",
        compact ? "p-3.5" : "p-5",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
          {title}
        </span>
        <span
          className={cn(
            "grid shrink-0 place-items-center rounded-lg transition-transform duration-200 group-hover:scale-105",
            TONE_CLASSES[tone],
            compact ? "size-8" : "size-9",
          )}
        >
          <Icon className={compact ? "size-4" : "size-[18px]"} strokeWidth={1.75} />
        </span>
      </div>

      <div
        className={cn(
          "mt-1 font-semibold leading-tight tabular-nums tracking-tight text-text-main",
          compact ? "text-2xl" : "mt-2 text-[28px]",
        )}
      >
        {value}
      </div>

      <div className={cn("flex items-center gap-2", compact ? "mt-1" : "mt-2")}>
        {trend !== undefined ? (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
              trendIsNeutral
                ? "bg-bg-app text-text-muted"
                : trendIsPositive
                  ? "bg-success/10 text-success"
                  : "bg-error/10 text-error",
            )}
          >
            <TrendIcon className="size-3" />
            {trend > 0 ? "+" : ""}
            {trend}%
          </span>
        ) : null}
        {hint ? (
          <span className="truncate text-xs text-text-muted">{hint}</span>
        ) : null}
      </div>
    </Card>
  );
}