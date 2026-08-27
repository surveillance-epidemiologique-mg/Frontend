"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import madagascarRegions from "@/data/madagascar-regions.json";
import {
  ETABLISSEMENT_COLORS,
  ETABLISSEMENT_LABELS,
  NIVEAU_COLORS,
} from "@/features/map/constants";
import type {
  EstablishmentMapData,
  RegionMapData,
} from "@/features/map/services/map";

interface MapViewProps {
  regionsData: RegionMapData[];
  establishments: EstablishmentMapData[];
  selectedRegionId: number | null;
  onSelectRegion: (regionId: number) => void;
  onSelectEstablishment: (establishment: EstablishmentMapData) => void;
  theme: "light" | "dark";
}

function FitBounds() {
  const map = useMap();
  useEffect(() => {
    map.setView([-19.5, 46.9], 6);
    map.fitBounds([
      [-26.0, 42.5],
      [-11.5, 51.0],
    ]);
  }, [map]);
  return null;
}

export function MapView({
  regionsData,
  establishments,
  selectedRegionId,
  onSelectRegion,
  onSelectEstablishment,
  theme,
}: MapViewProps) {
  const regionByName = useMemo(() => {
    const map = new Map<string, RegionMapData>();
    for (const region of regionsData) {
      map.set(region.region, region);
    }
    return map;
  }, [regionsData]);

  const tileUrl =
    theme === "dark"
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

  const geoStyle = (feature?: GeoJSON.Feature) => {
    const name = String(feature?.properties?.name ?? "");
    const region = regionByName.get(name);
    const niveau = region?.niveau ?? "Aucun";
    const selected = region?.regionId === selectedRegionId;
    return {
      color: selected ? "#2563eb" : "#475569",
      weight: selected ? 2 : 1,
      fillColor: NIVEAU_COLORS[niveau],
      fillOpacity: selected ? 0.7 : 0.55,
    };
  };

  const onEachFeature = (feature: GeoJSON.Feature, layer: L.Layer) => {
    const name = String(feature?.properties?.name ?? "");
    const region = regionByName.get(name);
    const niveau = region?.niveau ?? "Aucun";
    layer.on({
      click: () => {
        if (region) {
          onSelectRegion(region.regionId);
        }
      },
    });
    layer.bindTooltip(
      `<strong>${name}</strong><br/>Niveau : ${niveau} · ${region?.total ?? 0} cas`,
      { sticky: true },
    );
  };

  return (
    <MapContainer
      center={[-19.5, 46.9]}
      zoom={6}
      minZoom={5}
      maxZoom={12}
      scrollWheelZoom
      className="h-full w-full"
      style={{ minHeight: 480 }}
    >
      <FitBounds />
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>' url={tileUrl} />

      <GeoJSON data={madagascarRegions as GeoJSON.FeatureCollection} style={geoStyle} onEachFeature={onEachFeature} />

      {establishments
        .filter((e) => e.latitude != null && e.longitude != null)
        .map((establishment) => {
          const color = ETABLISSEMENT_COLORS[establishment.type] ?? ETABLISSEMENT_COLORS.Autres;
          const icon = L.divIcon({
            className: "",
            html: `<div style="width:18px;height:18px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;"><span style="width:6px;height:6px;border-radius:50%;background:#fff;"></span></div>`,
            iconSize: [18, 18],
            iconAnchor: [9, 9],
            popupAnchor: [0, -9],
          });
          return (
            <Marker
              key={establishment.id}
              position={[establishment.latitude!, establishment.longitude!]}
              icon={icon}
              eventHandlers={{ click: () => onSelectEstablishment(establishment) }}
            >
              <Popup>
                <strong>{establishment.name}</strong>
                <br />
                {ETABLISSEMENT_LABELS[establishment.type] ?? establishment.type} ·{" "}
                {establishment.region}
                <br />
                {establishment.cases} cas · Niveau {establishment.niveau}
              </Popup>
            </Marker>
          );
        })}
    </MapContainer>
  );
}