"use client";

import { useEffect, useState } from "react";
import { GeoJSON, MapContainer, TileLayer } from "react-leaflet";
import type { GeoJSON as LeafletGeoJSON } from "leaflet";
import "leaflet/dist/leaflet.css";
import { CENTRE_MADAGASCAR } from "@/features/zones/data/map-data";

interface GeoFeatureCollection {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    geometry: unknown;
    properties: Record<string, unknown>;
  }>;
}

const RISK_COLOR: Record<string, string> = {
  High: "#dc2626",
  Moderate: "#f97316",
  Low: "#eab308",
  "Very low": "#16a34a",
};

const RISK_LABEL: Record<string, string> = {
  High: "Élevé",
  Moderate: "Modéré",
  Low: "Faible",
  "Very low": "Très faible",
};

const RISK_ORDER = ["High", "Moderate", "Low", "Very low"];

export function RiskRegionMapInner() {
  const [geo, setGeo] = useState<GeoFeatureCollection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/carte/regions");
        if (!active) return;
        if (res.ok) {
          const data = await res.json();
          setGeo(data as GeoFeatureCollection);
        }
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

  const featureStyle = (feature?: { properties: Record<string, unknown> }) => {
    const risk = feature?.properties?.risk_level as string | undefined;
    const color = risk ? RISK_COLOR[risk] : undefined;
    if (!color) {
      return {
        color: "#94a3b8",
        weight: 1,
        fillColor: "#e2e8f0",
        fillOpacity: 0.5,
      };
    }
    return {
      color: "#334155",
      weight: 1.2,
      fillColor: color,
      fillOpacity: 0.55,
    };
  };

  function onEachFeature(
    feature: { properties: Record<string, unknown> },
    layer: LeafletGeoJSON,
  ) {
    const name = String(feature.properties?.nom ?? "—");
    const risk = (feature.properties?.risk_level as string) ?? null;
    const gravite = (feature.properties?.gravite as string) ?? null;
    const label = risk ? RISK_LABEL[risk] ?? risk : "Aucune alerte";
    const color = risk ? RISK_COLOR[risk] ?? "#94a3b8" : "#94a3b8";
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
            style={featureStyle}
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
          {RISK_ORDER.map((risk) => (
            <span
              key={risk}
              className="flex items-center gap-2 text-xs text-text-muted"
            >
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: RISK_COLOR[risk] }}
              />
              {RISK_LABEL[risk]}
            </span>
          ))}
          <span className="flex items-center gap-2 text-xs text-text-muted">
            <span className="size-2.5 shrink-0 rounded-full bg-slate-300" />
            Aucune alerte
          </span>
        </div>
        {loading ? (
          <p className="mt-2 text-[11px] text-text-muted">Chargement…</p>
        ) : null}
      </div>
    </div>
  );
}