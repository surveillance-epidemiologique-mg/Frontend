"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/skeleton/component";

const RiskRegionMapInner = dynamic(
  () =>
    import("@/components/risk-region-map-inner/component").then(
      (mod) => mod.RiskRegionMapInner,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full p-4">
        <Skeleton className="h-full w-full rounded-xl" />
      </div>
    ),
  },
);

export function RiskRegionMap() {
  return (
    <div className="relative isolate h-[480px] w-full overflow-hidden rounded-2xl border border-border bg-bg-surface shadow-sm">
      <RiskRegionMapInner />
    </div>
  );
}