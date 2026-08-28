import { useId } from "react";

export type EvolutionMetric = "cases" | "active" | "recovered" | "deceased";

export interface EvolutionPoint {
  date: string;
  count?: number;
  cases?: number;
  active?: number;
  recovered?: number;
  deceased?: number;
  confirmed?: number;
  suspected?: number;
}

interface EvolutionChartProps {
  data: EvolutionPoint[];
  metric?: EvolutionMetric;
  mode?: "single" | "curve";
}

const W = 640;
const H = 200;
const PAD_X = 34;
const PAD_Y = 24;

const METRIC_COLOR: Record<EvolutionMetric, string> = {
  cases: "var(--chart-1)",
  active: "var(--chart-2)",
  recovered: "var(--success)",
  deceased: "var(--error)",
};

const CURVE_COLORS = {
  confirmed: "#276696",
  suspected: "#f0ad4e",
};

function formatLabel(iso: string): string {
  const parts = iso.split("-");
  if (parts.length === 2) {
    return `${Number(parts[1])}/${parts[0].slice(2)}`;
  }
  return `${Number(parts[1])}/${Number(parts[2])}`;
}

function toPoints(
  data: EvolutionPoint[],
  valueOf: (point: EvolutionPoint) => number,
  max: number,
) {
  const innerW = W - PAD_X * 2;
  const innerH = H - PAD_Y * 2;
  const step = data.length > 1 ? innerW / (data.length - 1) : 0;
  return data.map((point, index) => ({
    x: PAD_X + index * step,
    y: PAD_Y + innerH - (valueOf(point) / max) * innerH,
    date: point.date,
  }));
}

function linePath(points: { x: number; y: number }[]): string {
  return points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"}${point.x.toFixed(1)},${point.y.toFixed(1)}`,
    )
    .join(" ");
}

export function EvolutionChart({
  data,
  metric = "cases",
  mode = "single",
}: EvolutionChartProps) {
  const gradientId = useId();

  if (data.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-text-muted">
        Aucune donnée disponible pour la période affichée.
      </p>
    );
  }

  const curve = mode === "curve";
  const color = METRIC_COLOR[metric];

  const valueOf = (point: EvolutionPoint) =>
    point[metric] ?? point.count ?? point.cases ?? 0;

  const values =
    curve
      ? data.map((p) => Math.max(p.confirmed ?? 0, p.suspected ?? 0))
      : data.map(valueOf);
  const max = Math.max(1, ...values);

  const points = curve
    ? {
        confirmed: toPoints(data, (p) => p.confirmed ?? 0, max),
        suspected: toPoints(data, (p) => p.suspected ?? 0, max),
      }
    : { confirmed: toPoints(data, valueOf, max), suspected: [] };

  const mainPath = curve
    ? linePath(points.confirmed)
    : linePath(points.confirmed);
  const secondaryPath = curve ? linePath(points.suspected) : "";

  const baselineY = PAD_Y + (H - PAD_Y * 2);
  const lastX = points.confirmed[points.confirmed.length - 1]?.x ?? PAD_X;
  const firstX = points.confirmed[0]?.x ?? PAD_X;
  const areaPath = `${mainPath} L${lastX.toFixed(1)},${baselineY.toFixed(1)} L${firstX.toFixed(1)},${baselineY.toFixed(1)} Z`;

  const labelEvery = Math.ceil(data.length / 7);
  const visiblePoints = curve ? points.confirmed : points.confirmed;

  return (
    <div className="w-full">
      {curve ? (
        <div className="mb-2 flex items-center gap-4 text-xs text-text-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded-full" style={{ backgroundColor: CURVE_COLORS.confirmed }} />
            Confirmés
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded-full border-t-2 border-dashed" style={{ borderColor: CURVE_COLORS.suspected }} />
            Suspectés
          </span>
        </div>
      ) : null}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label={`Évolution des cas dans le temps`}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0, 0.5, 1].map((fraction) => {
          const y = PAD_Y + (H - PAD_Y * 2) * fraction;
          const value = Math.round(max * (1 - fraction));
          return (
            <g key={fraction}>
              <line
                x1={PAD_X}
                x2={W - PAD_X}
                y1={y}
                y2={y}
                stroke="var(--border)"
                strokeWidth="1"
              />
              <text
                x={PAD_X - 8}
                y={y + 3}
                textAnchor="end"
                fontSize="10"
                fill="var(--text-subtle)"
              >
                {value}
              </text>
            </g>
          );
        })}

        {!curve ? <path d={areaPath} fill={`url(#${gradientId})`} /> : null}
        {!curve ? (
          <path
            d={mainPath}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <>
            <path
              d={mainPath}
              fill="none"
              stroke={CURVE_COLORS.confirmed}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={secondaryPath}
              fill="none"
              stroke={CURVE_COLORS.suspected}
              strokeWidth="2"
              strokeDasharray="5 4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        )}

        {visiblePoints.map((point, index) => (
          <g key={point.date}>
            {index % labelEvery === 0 || index === visiblePoints.length - 1 ? (
              <text
                x={point.x}
                y={H - 6}
                textAnchor="middle"
                fontSize="10"
                fill="var(--text-subtle)"
              >
                {formatLabel(point.date)}
              </text>
            ) : null}
            <circle
              cx={point.x}
              cy={point.y}
              r="3"
              fill={curve ? CURVE_COLORS.confirmed : color}
              stroke="var(--bg-surface)"
              strokeWidth="1.5"
            />
          </g>
        ))}
      </svg>
    </div>
  );
}