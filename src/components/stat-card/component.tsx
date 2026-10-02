import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
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
  unit?: string;
  icon: LucideIcon;
  tone?: StatTone;
  trend?: number;
  hint?: string;
  compact?: boolean;
}

/* ── Tokens par tone ─────────────────────────────────────────────────── */

const TONE: Record<
  StatTone,
  {
    accent: string;       // bande latérale
    iconBg: string;       // fond icône
    iconText: string;     // couleur icône
    cardBg: string;       // dégradé fond carte (light)
    hintPill: string;     // badge hint
  }
> = {
  primary: {
    accent:   "bg-primary",
    iconBg:   "bg-primary/10",
    iconText: "text-primary",
    cardBg:   "bg-gradient-to-br from-primary/5 via-bg-surface to-bg-surface",
    hintPill: "bg-primary/10 text-primary",
  },
  secondary: {
    accent:   "bg-secondary",
    iconBg:   "bg-secondary/10",
    iconText: "text-secondary",
    cardBg:   "bg-gradient-to-br from-secondary/5 via-bg-surface to-bg-surface",
    hintPill: "bg-secondary/10 text-secondary",
  },
  success: {
    accent:   "bg-success",
    iconBg:   "bg-success/10",
    iconText: "text-success",
    cardBg:   "bg-gradient-to-br from-success/5 via-bg-surface to-bg-surface",
    hintPill: "bg-success/10 text-success",
  },
  warning: {
    accent:   "bg-warning",
    iconBg:   "bg-warning/10",
    iconText: "text-warning",
    cardBg:   "bg-gradient-to-br from-warning/5 via-bg-surface to-bg-surface",
    hintPill: "bg-warning/10 text-warning",
  },
  danger: {
    accent:   "bg-error",
    iconBg:   "bg-error/10",
    iconText: "text-error",
    cardBg:   "bg-gradient-to-br from-error/5 via-bg-surface to-bg-surface",
    hintPill: "bg-error/10 text-error",
  },
  info: {
    accent:   "bg-info",
    iconBg:   "bg-info/10",
    iconText: "text-info",
    cardBg:   "bg-gradient-to-br from-info/5 via-bg-surface to-bg-surface",
    hintPill: "bg-info/10 text-info",
  },
};

/* ── StatCard ────────────────────────────────────────────────────────── */

export function StatCard({
  title,
  value,
  unit,
  icon: Icon,
  tone = "primary",
  trend,
  hint,
  compact = false,
}: StatCardProps) {
  const t = TONE[tone];

  const trendIsPositive = (trend ?? 0) > 0;
  const trendIsNeutral  = (trend ?? 0) === 0;
  const TrendIcon = trendIsNeutral
    ? Minus
    : trendIsPositive
      ? ArrowUpRight
      : ArrowDownRight;

  return (
    <div
      className={cn(
        // structure
        "group relative flex overflow-hidden rounded-2xl border border-border",
        "shadow-card transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-card-hover",
        // fond dégradé selon le tone
        t.cardBg,
        compact ? "p-3.5" : "p-5",
      )}
    >
      {/* ── Bande colorée latérale ── */}
      <span
        className={cn(
          "absolute inset-y-0 left-0 w-[3px] rounded-l-2xl",
          t.accent,
        )}
        aria-hidden="true"
      />

      {/* ── Contenu ── */}
      <div className="flex min-w-0 flex-1 flex-col gap-3 pl-3">
        {/* Titre + Icône */}
        <div className="flex items-start justify-between gap-2">
          <span
            className={cn(
              "text-[11px] font-semibold uppercase tracking-wider text-text-muted",
              compact ? "leading-4" : "leading-4 pt-0.5",
            )}
          >
            {title}
          </span>

          <span
            className={cn(
              "grid shrink-0 place-items-center rounded-xl transition-transform duration-200 group-hover:scale-110",
              t.iconBg,
              t.iconText,
              compact ? "size-8" : "size-10",
            )}
          >
            <Icon
              className={compact ? "size-4" : "size-[18px]"}
              strokeWidth={1.75}
            />
          </span>
        </div>

        {/* Valeur */}
        <div
          className={cn(
            "flex items-baseline gap-1.5 font-bold leading-none tabular-nums tracking-tight text-text-main",
            compact ? "text-2xl" : "text-[32px]",
          )}
        >
          <span>{value}</span>
          {unit ? (
            <span
              className={cn(
                "font-normal text-text-muted",
                compact ? "text-[11px]" : "text-xs",
              )}
            >
              {unit}
            </span>
          ) : null}
        </div>

        {/* Trend + Hint */}
        <div className="flex flex-wrap items-center gap-2">
          {trend !== undefined ? (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
                trendIsNeutral
                  ? "bg-bg-muted text-text-muted"
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
            <span
              className={cn(
                "truncate rounded-full px-2 py-0.5 text-[11px] font-medium",
                t.hintPill,
              )}
            >
              {hint}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ── StatCardSkeleton ────────────────────────────────────────────────── */

export function StatCardSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-bg-surface shadow-card",
        compact ? "p-3.5" : "p-5",
      )}
      aria-hidden="true"
    >
      {/* accent bar placeholder */}
      <span className="skeleton-shimmer absolute inset-y-0 left-0 w-[3px] rounded-l-2xl" />

      <div className="flex min-w-0 flex-1 flex-col gap-3 pl-3">
        {/* titre + icône */}
        <div className="flex items-start justify-between gap-2">
          <span className="skeleton-shimmer h-3 w-28 rounded-full" />
          <span className={cn("skeleton-shimmer rounded-xl", compact ? "size-8" : "size-10")} />
        </div>
        {/* valeur */}
        <span className={cn("skeleton-shimmer rounded-lg", compact ? "h-7 w-20" : "h-9 w-24")} />
        {/* badges */}
        <div className="flex gap-2">
          <span className="skeleton-shimmer h-4 w-12 rounded-full" />
          <span className="skeleton-shimmer h-4 w-20 rounded-full" />
        </div>
      </div>
    </div>
  );
}