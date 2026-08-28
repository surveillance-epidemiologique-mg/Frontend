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

const SATELLITE_URL =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

function tileUrl(): string {
  const override = process.env.NEXT_PUBLIC_MAP_TILE_URL;
  return override && override.length > 0 ? override : SATELLITE_URL;
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
}: MapViewProps) {
  const regionByName = useMemo(() => {
    const map = new Map<string, RegionMapData>();
    for (const region of regionsData) {
      map.set(region.region, region);
    }
    return map;
  }, [regionsData]);

  const geoStyle = (feature?: GeoJSON.Feature) => {
    const name = String(feature?.properties?.name ?? "");
    const region = regionByName.get(name);
    const niveau = region?.niveau ?? "Aucun";
    const selected = region?.regionId === selectedRegionId;
    return {
      color: selected ? "#2563eb" : "rgba(255,255,255,0.85)",
      weight: selected ? 2.5 : 1.25,
      fillColor: NIVEAU_COLORS[niveau],
      fillOpacity: selected ? 0.75 : 0.6,
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
      <TileLayer
        attribution='&copy; <a href="https://www.esri.com/en-us/home">Esri</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url={tileUrl()}
      />

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