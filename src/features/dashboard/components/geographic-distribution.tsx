import type { ZoneDistribution } from "@/services/dashboard";
import { cn } from "@/lib/utils";

const BAR_COLORS = [
  "bg-chart-1",
  "bg-chart-2",
  "bg-chart-3",
  "bg-chart-4",
  "bg-chart-5",
  "bg-chart-6",
  "bg-chart-7",
  "bg-chart-8",
];

interface GeographicDistributionProps {
  data: ZoneDistribution[];
}

export function GeographicDistribution({
  data,
}: GeographicDistributionProps) {
  if (data.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-text-muted">
        Aucune donnée géographique disponible.
      </p>
    );
  }

  const max = Math.max(1, ...data.map((item) => item.count));
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="space-y-4">
      {data.map((item, index) => {
        const percent = Math.round((item.count / total) * 100);
        return (
          <div key={item.zone}>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="truncate font-medium text-text-main">
                {item.zone}
              </span>
              <span className="shrink-0 text-xs text-text-muted">
                {item.count} cas · {percent}%
              </span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-bg-app">
              <div
                className={cn(
                  "h-full rounded-full transition-[width] duration-500",
                  BAR_COLORS[index % BAR_COLORS.length],
                )}
                style={{ width: `${(item.count / max) * 100}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}