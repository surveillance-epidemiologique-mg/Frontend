"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

/* ── Tokens de chart ─────────────────────────────────────────────────── */

const CHART = {
  grid:    "#e2e8f0",
  tick:    "#94a3b8",
  primary: "#0369a1",
  warning: "#f59e0b",
  success: "#16a34a",
  danger:  "#ef4444",
};

const AXIS_TICK = { fill: CHART.tick, fontSize: 11 };

export interface TrendPoint {
  jour: string;
  valeur: number;
}

export interface BarPoint {
  mois: string;
  confirmes: number;
  suspects: number;
  gueris: number;
  decedes?: number;
}

export interface SlicePoint {
  nom: string;
  valeur: number;
}

const PIE_COLORS = [
  "#0ea5e9",
  "#8b5cf6",
  "#f59e0b",
  "#ef4444",
  "#10b981",
  "#f43f5e",
  "#14b8a6",
  "#6366f1",
];

const MOIS_FR = [
  "Janv", "Févr", "Mars", "Avr", "Mai", "Juin",
  "Juil", "Août", "Sept", "Oct", "Nov", "Déc",
];

export function formatMois(iso: string): string {
  const [annee, mois] = iso.split("-");
  const index = Number(mois) - 1;
  return `${MOIS_FR[index] ?? mois} ${annee}`;
}

/* ── Primitives partagées ──────────────────────────────────────────── */

function ChartCard({
  title,
  description,
  className,
  children,
  action,
}: {
  title: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="text-base">{title}</CardTitle>
            {description ? (
              <CardDescription className="mt-0.5 text-[13px]">
                {description}
              </CardDescription>
            ) : null}
          </div>
          {action}
        </div>
      </CardHeader>
      <CardContent className="flex-1 pt-0">{children}</CardContent>
    </Card>
  );
}

/* Légende compacte réutilisable */
function ChartLegend({
  items,
  className,
}: {
  items: { label: string; color: string }[];
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-1.5", className)}>
      {items.map((item) => (
        <span
          key={item.label}
          className="inline-flex items-center gap-1.5 text-[11px] font-medium text-text-muted"
        >
          <span
            className="size-2 shrink-0 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          {item.label}
        </span>
      ))}
    </div>
  );
}

/* Tooltip glassmorphism */
interface TooltipEntry {
  name?: string;
  value?: number | string;
  dataKey?: string | number;
  payload?: { couleur?: string; fill?: string; stroke?: string };
}

function ChartTooltip({
  active,
  label,
  payload,
}: {
  active?: boolean;
  label?: string | number;
  payload?: TooltipEntry[];
}) {
  if (!active || !payload?.length) return null;

  return (
    <div
      className={cn(
        "min-w-[140px] rounded-xl border border-border/60 px-3.5 py-2.5 text-xs shadow-dropdown",
        "bg-bg-surface/90 backdrop-blur-md",
      )}
    >
      {label ? (
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
          {label}
        </p>
      ) : null}
      <div className="space-y-1.5">
        {payload.map((entry, index) => (
          <div
            key={`${entry.dataKey ?? entry.name ?? index}`}
            className="flex items-center gap-2"
          >
            <span
              className="size-2 shrink-0 rounded-full"
              style={{
                backgroundColor:
                  entry.payload?.couleur ??
                  entry.payload?.fill ??
                  entry.payload?.stroke ??
                  CHART.primary,
              }}
            />
            <span className="text-text-muted">{entry.name}</span>
            <span className="ml-auto pl-4 font-semibold tabular-nums text-text-main">
              {typeof entry.value === "number"
                ? entry.value.toLocaleString("fr-FR")
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── DASH-01 · Area chart : évolution des cas confirmés ──────────────── */

export function ConfirmedTrendChart({
  data,
  className,
}: {
  data: TrendPoint[];
  className?: string;
}) {
  const gradientId = "trend-gradient";

  return (
    <ChartCard
      title="Évolution des cas confirmés"
      description="30 derniers jours"
      className={className}
    >
      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={CHART.primary} stopOpacity={0.22} />
                <stop offset="85%"  stopColor={CHART.primary} stopOpacity={0.03} />
                <stop offset="100%" stopColor={CHART.primary} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke={CHART.grid}
              strokeDasharray="4 4"
              vertical={false}
              strokeOpacity={0.7}
            />
            <XAxis
              dataKey="jour"
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={false}
              width={34}
            />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ stroke: CHART.primary, strokeWidth: 1, strokeDasharray: "4 4" }}
            />
            <Area
              type="monotone"
              dataKey="valeur"
              name="Cas confirmés"
              stroke={CHART.primary}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{ r: 5, fill: CHART.primary, strokeWidth: 2, stroke: "#fff" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

/* ── DASH-01 · Histogramme : cas par mois ────────────────────────────── */

const BAR_LEGEND = [
  { label: "Confirmés", color: CHART.primary },
  { label: "Suspects",  color: CHART.warning },
  { label: "Guéris",    color: CHART.success },
];

export function MonthlyCasesChart({
  data,
  className,
}: {
  data: BarPoint[];
  className?: string;
}) {
  const formatted = data.map((d) => ({ ...d, mois: formatMois(d.mois) }));

  return (
    <ChartCard
      title="Cas par mois"
      description="Agrégation par date de diagnostic"
      className={className}
      action={<ChartLegend items={BAR_LEGEND} />}
    >
      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={formatted}
            barGap={2}
            barCategoryGap="30%"
            margin={{ top: 4, right: 4, left: -12, bottom: 0 }}
          >
            <CartesianGrid
              stroke={CHART.grid}
              strokeDasharray="4 4"
              vertical={false}
              strokeOpacity={0.7}
            />
            <XAxis
              dataKey="mois"
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={false}
              width={34}
            />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ fill: "rgba(148,163,184,0.06)", radius: 4 }}
            />
            <Bar
              dataKey="confirmes"
              name="Confirmés"
              fill={CHART.primary}
              radius={[4, 4, 0, 0]}
              maxBarSize={12}
            />
            <Bar
              dataKey="suspects"
              name="Suspects"
              fill={CHART.warning}
              radius={[4, 4, 0, 0]}
              maxBarSize={12}
            />
            <Bar
              dataKey="gueris"
              name="Guéris"
              fill={CHART.success}
              radius={[4, 4, 0, 0]}
              maxBarSize={12}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

/* ── Donut partagé (maladies + statuts) ──────────────────────────────── */

function PieDonut({
  data,
  totalLabel,
}: {
  data: SlicePoint[];
  totalLabel: string;
}) {
  const total = data.reduce((sum, s) => sum + s.valeur, 0);
  const slices = data.map((slice, i) => ({
    ...slice,
    couleur: PIE_COLORS[i % PIE_COLORS.length],
  }));

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Donut */}
      <div className="relative h-[180px] w-full shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={slices}
              dataKey="valeur"
              nameKey="nom"
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="85%"
              paddingAngle={3}
              strokeWidth={0}
            >
              {slices.map((slice) => (
                <Cell key={slice.nom} fill={slice.couleur} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Centre */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold tabular-nums tracking-tight text-text-main">
            {total.toLocaleString("fr-FR")}
          </span>
          <span className="mt-0.5 text-[11px] font-medium text-text-muted">
            {totalLabel}
          </span>
        </div>
      </div>

      {/* Légende compacte avec barre de proportion */}
      <div className="space-y-1.5 overflow-y-auto">
        {slices.map((slice) => {
          const pct = total > 0 ? Math.round((slice.valeur / total) * 100) : 0;
          return (
            <div key={slice.nom} className="flex items-center gap-2">
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: slice.couleur }}
              />
              <span className="min-w-0 flex-1 truncate text-[12px] text-text-muted">
                {slice.nom}
              </span>
              <span className="shrink-0 text-[12px] font-semibold tabular-nums text-text-main">
                {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function DiseasePieChart({
  data,
  className,
}: {
  data: SlicePoint[];
  className?: string;
}) {
  return (
    <ChartCard
      title="Répartition par maladie"
      description="Cas déclarés"
      className={className}
    >
      <PieDonut data={data} totalLabel="cas" />
    </ChartCard>
  );
}

export function StatusDonutChart({
  data,
  className,
}: {
  data: SlicePoint[];
  className?: string;
}) {
  return (
    <ChartCard
      title="Répartition par statut"
      description="Statut diagnostic"
      className={className}
    >
      <PieDonut data={data} totalLabel="cas" />
    </ChartCard>
  );
}