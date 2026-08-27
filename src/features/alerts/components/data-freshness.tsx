"use client";

import { Clock } from "lucide-react";
import type { AlerteFreshness } from "@/features/alerts/types";
import { cn } from "@/lib/utils";

function relativeTime(iso: string | null): string {
  if (!iso) {
    return "jamais";
  }
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) {
    return "à l'instant";
  }
  if (minutes < 60) {
    return `il y a ${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `il y a ${hours} h`;
  }
  const days = Math.floor(hours / 24);
  return `il y a ${days} j`;
}

export function DataFreshness({ freshness }: { freshness: AlerteFreshness }) {
  const dataOk = !freshness?.dataStale;
  const detectionOk = !freshness?.detectionStale;

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium",
          dataOk ? "bg-success/10 text-success" : "bg-warning/10 text-warning",
        )}
      >
        <Clock className="size-3" />
        Données épidémiologiques : {relativeTime(freshness?.dataMaxDate)}
      </span>
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium",
          detectionOk
            ? "bg-info/10 text-info"
            : "bg-warning/10 text-warning",
        )}
      >
        <Clock className="size-3" />
        Dernière détection : {relativeTime(freshness?.lastDetectionAt)}
      </span>
    </div>
  );
}