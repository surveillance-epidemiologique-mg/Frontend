"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/skeleton/component";

const EpidemicMapInner = dynamic(
  () =>
    import("@/components/epidemic-map-inner/component").then(
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
    <div className="relative isolate h-[calc(90vh-5rem)] w-full overflow-hidden rounded-2xl border border-border bg-bg-surface shadow-sm">
      <EpidemicMapInner />
    </div>
  );
}
