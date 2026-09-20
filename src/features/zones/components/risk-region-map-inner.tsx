"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/services/api";
import { GeoJSON, MapContainer, TileLayer } from "react-leaflet";
import type { GeoJSON as LeafletGeoJSON } from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  alertStyle,
  GRAVITE_FILL,
  GRAVITE_LABEL,
  GRAVITES_LEGEND,
  NO_ALERT_FILL,
} from "@/features/zones/types/map.types";
import { CENTRE_MADAGASCAR } from "@/features/zones/data/map-data";

interface GeoFeatureCollection {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    geometry: unknown;
    properties: Record<string, unknown>;
  }>;
}

export function RiskRegionMapInner() {
  const [geo, setGeo] = useState<GeoFeatureCollection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await apiFetch<GeoFeatureCollection>("/carte/regions");
        if (!active) return;
        setGeo(data);
      } catch {
        // API indisponible
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  function onEachFeature(
    feature: { properties: Record<string, unknown> },
    layer: LeafletGeoJSON,
  ) {
    const name = String(feature.properties?.nom ?? "—");
    const gravite = (feature.properties?.gravite as string) ?? null;
    const label = GRAVITE_LABEL[gravite ?? ""] ?? "Aucune alerte";
    const color = GRAVITE_FILL[gravite ?? ""] ?? NO_ALERT_FILL;
    layer.bindPopup(
      `<div style="font-family:system-ui,sans-serif;font-size:13px;line-height:1.5">
        <strong>${name}</strong><br/>
        Niveau d&apos;alerte :
        <span style="display:inline-flex;align-items:center;gap:4px;vertical-align:middle">
          <span style="width:9px;height:9px;border-radius:50%;background:${color};display:inline-block"></span>
          <strong>${label}</strong>
        </span>
        ${gravite ? `<br/><span style="font-size:11px;color:#64748b">Gravité : ${gravite}</span>` : ""}
      </div>`,
    );
    layer.on("mouseover", () => layer.openPopup());
    layer.on("mouseout", () => layer.closePopup());
  }

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={CENTRE_MADAGASCAR}
        zoom={6}
        minZoom={4}
        maxZoom={12}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {geo ? (
          <GeoJSON
            data={geo}
            style={alertStyle}
            onEachFeature={onEachFeature}
          />
        ) : null}
      </MapContainer>

      {/* Légende */}
      <div className="absolute bottom-3 right-3 z-[1000] w-44 rounded-xl border border-border bg-bg-surface/95 p-3 shadow-card backdrop-blur-md">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
          Niveau d&apos;alerte
        </p>
        <div className="space-y-1">
          {GRAVITES_LEGEND.map((entry) => (
            <span
              key={entry.key}
              className="flex items-center gap-2 text-xs text-text-muted"
            >
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: entry.fill }}
              />
              {entry.label}
            </span>
          ))}
        </div>
        {loading ? (
          <p className="mt-2 text-[11px] text-text-muted">Chargement…</p>
        ) : null}
      </div>
    </div>
  );
}
