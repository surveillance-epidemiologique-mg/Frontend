"use client";

import dynamic from "next/dynamic";

const MapPage = dynamic(
  () => import("@/features/map/components/map-page").then((m) => m.MapPage),
  {
    ssr: false,
    loading: () => (
      <p className="py-12 text-center text-sm text-text-muted">
        Chargement de la carte…
      </p>
    ),
  },
);

export default function MapPageLoader() {
  return <MapPage />;
}