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
}

const TONE_CLASSES: Record<StatTone, string> = {
  primary: "bg-primary-light text-primary",
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
}: StatCardProps) {
  const trendIsPositive = (trend ?? 0) > 0;
  const trendIsNeutral = (trend ?? 0) === 0;
  const TrendIcon = trendIsNeutral
    ? Minus
    : trendIsPositive
      ? ArrowUpRight
      : ArrowDownRight;

  return (
    <Card className="group p-6 transition-all duration-200 hover:shadow-md">
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium text-text-muted">{title}</span>
        <span
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-xl transition-transform duration-200 group-hover:scale-105",
            TONE_CLASSES[tone],
          )}
        >
          <Icon className="size-5" />
        </span>
      </div>

      <div className="mt-3 text-3xl font-semibold tracking-tight text-text-main">
        {value}
      </div>

      {trend !== undefined ? (
        <div className="mt-2 flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-xs font-semibold",
              trendIsNeutral
                ? "text-text-muted"
                : trendIsPositive
                  ? "text-success"
                  : "text-error",
            )}
          >
            <TrendIcon className="size-3.5" />
            {trend > 0 ? "+" : ""}
            {trend}%
          </span>
          {hint ? (
            <span className="text-xs text-text-muted">{hint}</span>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}