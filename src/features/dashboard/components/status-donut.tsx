interface StatusDonutProps {
  data: { label: string; value: number; color: string }[];
  total: number;
}

export function StatusDonut({ data, total }: StatusDonutProps) {
  const safeTotal = Math.max(1, total);
  const segments = data.filter((d) => d.value > 0);
  const accumulated = data.reduce(
    (acc, d) => {
      acc.push(acc[acc.length - 1] + (d.value / safeTotal) * 100);
      return acc;
    },
    [0],
  );

  const stops = segments
    .map((segment, index) => {
      const from = accumulated[index];
      const to = from + (segment.value / safeTotal) * 100;
      return `${segment.color} ${from}% ${to}%`;
    })
    .join(", ");

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
      <div
        className="relative size-36 shrink-0 rounded-full"
        style={{
          background:
            segments.length > 0
              ? `conic-gradient(${stops})`
              : "var(--bg-muted)",
        }}
        role="img"
        aria-label="Répartition des statuts des cas"
      >
        <div className="absolute inset-3 flex flex-col items-center justify-center rounded-full bg-bg-surface">
          <span className="text-2xl font-semibold tabular-nums text-text-main">
            {total}
          </span>
          <span className="text-[11px] uppercase tracking-wider text-text-muted">
            cas
          </span>
        </div>
      </div>

      <ul className="w-full space-y-1.5">
        {data.map((item) => {
          const percent =
            total > 0 ? Math.round((item.value / total) * 100) : 0;
          return (
            <li key={item.label} className="flex items-center gap-2 text-sm">
              <span
                className="size-3 shrink-0 rounded-sm"
                style={{ backgroundColor: item.color }}
              />
              <span className="min-w-0 flex-1 truncate text-text-main">
                {item.label}
              </span>
              <span className="font-semibold tabular-nums text-text-main">
                {item.value}
              </span>
              <span className="w-9 text-right text-xs tabular-nums text-text-muted">
                {percent}%
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}