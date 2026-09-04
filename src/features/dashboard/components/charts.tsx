"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
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

const CHART = {
  grid: "#e2e8f0",
  tick: "#64748b",
  primary: "#0369a1",
  warning: "#f59e0b",
  success: "#16a34a",
};

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

/* ------------------------------------------------------------------ */
/*  Primitives partagées                                              */
/* ------------------------------------------------------------------ */

function ChartCard({
  title,
  description,
  className,
  children,
}: {
  title: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? (
          <CardDescription>{description}</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="flex-1">{children}</CardContent>
    </Card>
  );
}

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
          className="inline-flex items-center gap-1.5 text-xs text-text-muted"
        >
          <span
            className="size-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          {item.label}
        </span>
      ))}
    </div>
  );
}

interface TooltipEntry {
  name?: string;
  value?: number | string;
  dataKey?: string | number;
  payload?: { couleur?: string; fill?: string };
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
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-xl border border-border bg-bg-surface px-3.5 py-2.5 text-xs shadow-dropdown">
      {label ? (
        <p className="mb-1.5 font-semibold text-text-main">{label}</p>
      ) : null}
      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div
            key={`${entry.dataKey ?? entry.name ?? index}`}
            className="flex items-center gap-2 text-text-muted"
          >
            <span
              className="size-2 shrink-0 rounded-full"
              style={{
                backgroundColor:
                  entry.payload?.couleur ?? entry.payload?.fill ?? "#0369a1",
              }}
            />
            <span>{entry.name}</span>
            <span className="ml-auto pl-3 font-medium tabular-nums text-text-main">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const AXIS_TICK = { fill: CHART.tick, fontSize: 12 };

/* ------------------------------------------------------------------ */
/*  DASH-01 · Courbe : évolution des cas confirmés (30 jours)         */
/* ------------------------------------------------------------------ */

export function ConfirmedTrendChart({
  data,
  className,
}: {
  data: TrendPoint[];
  className?: string;
}) {
  return (
    <ChartCard
      title="Évolution des cas confirmés"
      description="30 derniers jours"
      className={className}
    >
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="jour" tick={AXIS_TICK} tickLine={false} axisLine={false} />
            <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} width={36} />
            <Tooltip content={<ChartTooltip />} />
            <Line
              type="monotone"
              dataKey="valeur"
              name="Cas confirmés"
              stroke={CHART.primary}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

/* ------------------------------------------------------------------ */
/*  DASH-01 · Histogramme : nombre de cas par mois                    */
/* ------------------------------------------------------------------ */

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
    >
      <ChartLegend
        items={[
          { label: "Confirmés", color: CHART.primary },
          { label: "Suspects", color: CHART.warning },
          { label: "Guéris", color: CHART.success },
        ]}
      />
      <div className="mt-4 h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={formatted} barGap={2}>
            <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="mois" tick={AXIS_TICK} tickLine={false} axisLine={false} />
            <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} width={36} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(148,163,184,0.08)" }} />
            <Bar dataKey="confirmes" name="Confirmés" fill={CHART.primary} radius={[3, 3, 0, 0]} maxBarSize={14} />
            <Bar dataKey="suspects" name="Suspects" fill={CHART.warning} radius={[3, 3, 0, 0]} maxBarSize={14} />
            <Bar dataKey="gueris" name="Guéris" fill={CHART.success} radius={[3, 3, 0, 0]} maxBarSize={14} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

/* ------------------------------------------------------------------ */
/*  DASH-01 · Camembert / Donut                                        */
/* ------------------------------------------------------------------ */

function PieDonut({
  data,
  totalLabel,
}: {
  data: SlicePoint[];
  totalLabel: string;
}) {
  const total = data.reduce((sum, slice) => sum + slice.valeur, 0);
  const slices = data.map((slice, index) => ({
    ...slice,
    couleur: PIE_COLORS[index % PIE_COLORS.length],
  }));

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={slices}
              dataKey="valeur"
              nameKey="nom"
              cx="50%"
              cy="50%"
              innerRadius="62%"
              outerRadius="88%"
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
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold tabular-nums tracking-tight text-text-main">
            {total.toLocaleString("fr-FR")}
          </span>
          <span className="text-xs text-text-muted">{totalLabel}</span>
        </div>
      </div>

      <ChartLegend
        items={slices.map((slice) => ({
          label: slice.nom,
          color: slice.couleur,
        }))}
        className="mt-4 justify-center"
      />
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