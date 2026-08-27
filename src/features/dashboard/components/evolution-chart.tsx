import { useId } from "react";
import type { EvolutionPoint } from "@/services/dashboard";

interface EvolutionChartProps {
  data: EvolutionPoint[];
}

const W = 640;
const H = 200;
const PAD_X = 34;
const PAD_Y = 24;

function formatLabel(iso: string): string {
  const [, month, day] = iso.split("-");
  return `${Number(month)}/${Number(day)}`;
}

export function EvolutionChart({ data }: EvolutionChartProps) {
  const gradientId = useId();

  if (data.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-text-muted">
        Aucune donnée disponible pour la période affichée.
      </p>
    );
  }

  const max = Math.max(1, ...data.map((point) => point.count));
  const innerW = W - PAD_X * 2;
  const innerH = H - PAD_Y * 2;
  const step = data.length > 1 ? innerW / (data.length - 1) : 0;

  const points = data.map((point, index) => ({
    x: PAD_X + index * step,
    y: PAD_Y + innerH - (point.count / max) * innerH,
    ...point,
  }));

  const linePath = points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"}${point.x.toFixed(1)},${point.y.toFixed(1)}`,
    )
    .join(" ");

  const baselineY = PAD_Y + innerH;
  const lastX = points[points.length - 1]?.x ?? PAD_X;
  const firstX = points[0]?.x ?? PAD_X;
  const areaPath = `${linePath} L${lastX.toFixed(1)},${baselineY.toFixed(1)} L${firstX.toFixed(1)},${baselineY.toFixed(1)} Z`;

  const labelEvery = Math.ceil(data.length / 7);

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label="Évolution des cas dans le temps"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--chart-1)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0, 0.5, 1].map((fraction) => {
          const y = PAD_Y + innerH * fraction;
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

        <path d={areaPath} fill={`url(#${gradientId})`} />
        <path
          d={linePath}
          fill="none"
          stroke="var(--chart-1)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map((point, index) => (
          <g key={point.date}>
            {index % labelEvery === 0 || index === points.length - 1 ? (
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
              fill="var(--chart-1)"
              stroke="var(--bg-surface)"
              strokeWidth="1.5"
            />
          </g>
        ))}
      </svg>
    </div>
  );
}