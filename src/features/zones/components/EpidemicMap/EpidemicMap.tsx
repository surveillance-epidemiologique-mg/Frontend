"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/skeleton/component";

const EpidemicMapInner = dynamic(
  () =>
    import("@/features/zones/components/EpidemicMapInner/EpidemicMapInner").then(
      (mod) => mod.EpidemicMapInner,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full flex-col gap-4 bg-bg-surface p-4 sm:p-6">
        <Skeleton className="h-9 w-44 rounded-xl" />
        <Skeleton className="h-full w-full flex-1 rounded-2xl" />
        <Skeleton className="h-12 w-60 rounded-xl" />
      </div>
    ),
  },
);

export function EpidemicMap() {
  return (
    <div className="epidemic-map relative isolate h-[calc(100dvh-12rem)] min-h-[520px] max-h-[900px] w-full overflow-hidden rounded-3xl border border-border/80 bg-bg-surface shadow-card sm:h-[calc(100dvh-11rem)]">
      <EpidemicMapInner />
    </div>
  );
}

