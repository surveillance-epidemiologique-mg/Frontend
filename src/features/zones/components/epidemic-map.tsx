"use client";

import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const EpidemicMapInner = dynamic(
  () =>
    import("@/features/zones/components/epidemic-map-inner").then(
      (mod) => mod.EpidemicMapInner,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full flex-col gap-3 p-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-full w-full flex-1 rounded-xl" />
        <Skeleton className="h-10 w-56" />
      </div>
    ),
  },
);

export function EpidemicMap() {
  return (
    <div className="relative h-[calc(90vh-5rem)] w-full overflow-hidden rounded-2xl border border-border bg-bg-surface shadow-sm">
      <EpidemicMapInner />
      <span className="pointer-events-none absolute left-3 top-3 z-[1001] hidden items-center gap-2 rounded-full bg-bg-surface/90 px-3 py-1.5 text-xs font-medium text-text-muted shadow-card backdrop-blur sm:inline-flex">
        <MapPin className="size-3.5 text-primary" />
        Fond de carte : Esri Light Gray
      </span>
    </div>
  );
}