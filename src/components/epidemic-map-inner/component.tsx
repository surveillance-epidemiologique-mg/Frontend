"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiFetch } from "@/services/api";
import { GeoJSON, MapContainer, TileLayer } from "react-leaflet";
import L, { type GeoJSON as LeafletGeoJSON } from "leaflet";
import "leaflet/dist/leaflet.css";

import { CENTRE_MADAGASCAR } from "@/features/zones/data/map-data";
import {
  type FlyTarget,
  type FocusZone,
  type GeojsonCollection,
  type LayerKey,
  type ZoneInfo,
  alertStyle,
  GRAVITE_FILL,
  GRAVITE_LABEL,
  NO_ALERT_FILL,
  STATUT_COLOR,
  STATUT_LABEL,
  MADAGASCAR_BOUNDS,
  crossIcon,
  popupHtml,
  regionNameFromFeature,
  statutDot,
} from "@/features/zones/types/map.types";
import {
  fetchAllMapLayers,
  fetchZoneSummary,
} from "@/features/zones/services/map.service";
import { MapActions } from "@/components/map-actions/component";
import { ZoneInfoPanel } from "@/components/zone-info-panel/component";
import { MapControlsPanel } from "@/components/map-controls-panel/component";
import { MAP_DATA_CHANGED_EVENT } from "@/services/live-events";

/* ================================================================== */
/*  EpidemicMapInner — Orchestrateur                                  */
/* ================================================================== */

export function EpidemicMapInner() {
  /* ── State : couches & filtres ────────────────────────────────── */
  // Seule la couche « Alertes » (choroplèthe par zone) est activée
  // au chargement initial, conformément au cahier des charges.
  const [layers, setLayers] = useState<Record<LayerKey, boolean>>({
    regions: true,
    cas: false,
    centres: false,
    limites: false,
    clusters: false,
  });
  const [statuts, setStatuts] = useState<Set<string>>(new Set());
  const [maladie, setMaladie] = useState("");

  /* ── State : données GeoJSON ──────────────────────────────────── */
  const [regions, setRegions] = useState<GeojsonCollection | null>(null);
  const [zones, setZones] = useState<GeojsonCollection | null>(null);
  const [centres, setCentres] = useState<GeojsonCollection | null>(null);
  const [clusters, setClusters] = useState<GeojsonCollection | null>(null);
  const [cas, setCas] = useState<GeojsonCollection | null>(null);
  const [mapVersion, setMapVersion] = useState(0);
  const [loadedMaladie, setLoadedMaladie] = useState<string | null>(null);
  const loading = loadedMaladie !== maladie;
  const [maladieOptions, setMaladieOptions] = useState<
    { id: number; name: string }[]
  >([]);
  const layersRequestRef = useRef(0);

  /* ── State : navigation & panneau zone ────────────────────────── */
  const [focusZone, setFocusZone] = useState<FocusZone | null>(null);
  const [flyTarget, setFlyTarget] = useState<FlyTarget | null>(null);
  const [zoneInfo, setZoneInfo] = useState<ZoneInfo | null>(null);
  const [zoneLoading, setZoneLoading] = useState(false);

  /* ── Chargement initial des couches ───────────────────────────── */
  const refreshMapLayers = useCallback(async () => {
    const requestId = ++layersRequestRef.current;
    const selectedMaladie = maladie;
    try {
      const data = await fetchAllMapLayers(
        selectedMaladie ? Number(selectedMaladie) : undefined,
        true,
      );
      if (requestId !== layersRequestRef.current) return;
      setRegions(data.regions);
      setZones(data.zones);
      setCentres(data.centres);
      setClusters(data.clusters);
      setCas(data.cas);
      setMapVersion((version) => version + 1);
    } catch {
      // API indisponible : conserver les dernières données affichées
    } finally {
      if (requestId === layersRequestRef.current) {
        setLoadedMaladie(selectedMaladie);
      }
    }
  }, [maladie]);

  useEffect(() => {
    void refreshMapLayers();
  }, [refreshMapLayers]);

  // Le polling couvre les autres onglets/utilisateurs. L'événement local
  // rend la mise à jour immédiate après une action effectuée dans cet onglet.
  useEffect(() => {
    const refresh = () => void refreshMapLayers();
    window.addEventListener(MAP_DATA_CHANGED_EVENT, refresh);
    const interval = window.setInterval(refresh, 15_000);
    return () => {
      window.removeEventListener(MAP_DATA_CHANGED_EVENT, refresh);
      window.clearInterval(interval);
    };
  }, [refreshMapLayers]);
  /* ── Chargement des maladies (pour le filtre) ─────────────────── */
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await apiFetch<{ id: number; name: string }[]>("/maladies");
        if (active)
          setMaladieOptions(data.sort((a, b) => a.name.localeCompare(b.name)));
      } catch {
        // indisponible : pas de filtre maladie
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  /* ── Données dérivées ─────────────────────────────────────────── */
  const bounds = MADAGASCAR_BOUNDS;

  const zoneName = focusZone?.name ?? "";

  const filteredCas = useMemo(() => {
    if (!cas || !maladie || loading || (focusZone && !zoneInfo)) return null;
    return {
      type: "FeatureCollection" as const,
      features: cas.features.filter((f) => {
        const statut = String(f.properties.statut ?? "");
        if (statuts.size > 0 && !statuts.has(statut)) return false;
        if (String(f.properties.maladieId) !== maladie) return false;
        if (
          focusZone &&
          (!zoneInfo ||
            zoneInfo.zoneId !== focusZone.id ||
            !zoneInfo.centres.some(
              (c) => c.id === Number(f.properties.centreId),
            ))
        )
          return false;
        return true;
      }),
    };
  }, [cas, statuts, maladie, loading, focusZone, zoneInfo]);

  const filteredCentres = useMemo(() => {
    if (!centres || (focusZone && !zoneInfo)) return null;
    if (!zoneName) return centres;
    return {
      type: "FeatureCollection" as const,
      features: centres.features.filter((f) =>
        zoneInfo?.centres.some((c) => c.id === Number(f.properties.id)),
      ),
    };
  }, [centres, zoneName, zoneInfo, focusZone]);

  /* ── Handlers ─────────────────────────────────────────────────── */
  function toggleLayer(key: LayerKey) {
    if ((key === "cas" || key === "clusters") && !maladie) return;
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function toggleStatut(s: string) {
    setStatuts((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  }

  function handleZoneClick(
    id: number,
    name: string,
    layerBounds: L.LatLngBoundsExpression,
  ) {
    setZoneInfo(null);
    setFocusZone({ id, name, bounds: layerBounds });
  }

  useEffect(() => {
    if (!focusZone) return;
    let active = true;
    (async () => {
      setZoneLoading(true);
      setZoneInfo(null);
      try {
        const data = await fetchZoneSummary(
          focusZone.id,
          maladie ? Number(maladie) : undefined,
        );
        if (active) setZoneInfo(data);
      } catch {
        if (active) setZoneInfo(null);
      } finally {
        if (active) setZoneLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [focusZone, maladie]);
  function resetView() {
    setFocusZone(null);
    setZoneInfo(null);
    setFlyTarget(null);
  }

  function flyToCentre(centreId: number) {
    const feature = centres?.features.find(
      (f) => Number(f.properties.id) === centreId,
    );
    const geom = feature?.geometry as {
      type?: string;
      coordinates?: unknown;
    } | null;
    if (geom?.type === "Point") {
      const [lng, lat] = geom.coordinates as [number, number];
      setFlyTarget({ center: [lat, lng], zoom: 10 });
    }
  }

  /* ── Styles & popups des couches GeoJSON ──────────────────────── */

  const regionStyle = alertStyle;

  function regionEach(
    feature: { properties: Record<string, unknown> },
    layer: LeafletGeoJSON,
  ) {
    const name = regionNameFromFeature(feature.properties);
    const gravite = String(feature.properties.gravite ?? "");
    const label = GRAVITE_LABEL[gravite] ?? "Aucune alerte";
    const color = GRAVITE_FILL[gravite] ?? NO_ALERT_FILL;
    layer.bindPopup(
      popupHtml(
        `<strong>${name}</strong><br/>
        Niveau d'alerte :
        <span style="display:inline-flex;align-items:center;gap:4px;vertical-align:middle">
          <span style="width:9px;height:9px;border-radius:50%;background:${color};display:inline-block"></span>
          <strong>${label}</strong>
        </span>`,
      ),
    );
    layer.on("mouseover", () => {
      layer.setStyle({ weight: 2.5, fillOpacity: 0.75 });
      layer.openPopup();
    });
    layer.on("mouseout", () => {
      layer.setStyle(regionStyle(feature) as L.PathOptions);
      layer.closePopup();
    });
    layer.on("click", () => {
      layer.openPopup();
      const id = Number(feature.properties.id);
      if (id) handleZoneClick(id, name, layer.getBounds());
    });
  }

  const zoneStyle = alertStyle;

  function zoneEach(
    feature: { properties: Record<string, unknown> },
    layer: LeafletGeoJSON,
  ) {
    const p = feature.properties;
    const gravite = String(p.gravite ?? "");
    const html = gravite
      ? `<strong>${p.nom}</strong><br/>Alerte : ${p.alerteMaladie}<br/>Gravité : <strong>${GRAVITE_LABEL[gravite] ?? gravite}</strong><br/>Cas détectés : <strong>${p.alerteCas}</strong><br/>Détectée le : ${new Date(String(p.alerteDate)).toLocaleDateString("fr-FR")}`
      : `<strong>${p.nom}</strong><br/><span style="color:#64748b">Aucune alerte active</span>`;
    layer.bindPopup(popupHtml(html));
    layer.on("mouseover", () => {
      layer.setStyle({ weight: 2.5, fillOpacity: 0.9 });
      layer.bringToFront();
    });
    layer.on("mouseout", () => {
      layer.setStyle(zoneStyle(feature) as L.PathOptions);
    });
    layer.on("click", () => {
      const id = Number(p.id ?? 0);
      const name = String(p.nom ?? "");
      if (!id) return;
      void handleZoneClick(id, name, layer.getBounds());
    });
  }

  const casPoint = (
    feature?: { properties: Record<string, unknown> },
    latlng?: L.LatLng,
  ) => {
    const statut = String(feature?.properties?.statut ?? "");
    return L.circleMarker(latlng ?? [0, 0], {
      radius: 6,
      color: "#ffffff",
      weight: 1.5,
      fillColor: STATUT_COLOR[statut] ?? "#64748b",
      fillOpacity: 0.9,
    });
  };

  function casEach(
    feature: { properties: Record<string, unknown> },
    layer: LeafletGeoJSON,
  ) {
    const p = feature.properties;
    const statut = String(p.statut ?? "");
    layer.bindPopup(
      popupHtml(
        `<strong style="font-family:monospace">${p.code}</strong><br/>Maladie : ${p.maladie}<br/>Centre : ${p.centre}<br/>${statutDot(statut, STATUT_LABEL[statut] ?? statut)}`,
      ),
    );
  }

  const centrePoint = (
    _feature?: { properties: Record<string, unknown> },
    latlng?: L.LatLng,
  ) => L.marker(latlng ?? [0, 0], { icon: crossIcon });

  function centreEach(
    feature: { properties: Record<string, unknown> },
    layer: LeafletGeoJSON,
  ) {
    const p = feature.properties;
    layer.bindPopup(
      popupHtml(
        `<strong>${p.nom}</strong><br/>${p.type}<br/>Zone : ${p.zone ?? "—"}`,
      ),
    );
  }

  const clusterPoint = (
    feature?: { properties: Record<string, unknown> },
    latlng?: L.LatLng,
  ) => {
    const nb = Number(feature?.properties?.nb ?? 1);
    const size = 28 + Math.min(nb, 8) * 2;
    return L.marker(latlng ?? [0, 0], {
      icon: L.divIcon({
        className: "",
        html: `<div style="display:grid;place-items:center;width:${size}px;height:${size}px;border-radius:50%;background:#0369A1;color:#ffffff;font-weight:600;font-size:12px;border:2px solid #ffffff;box-shadow:0 1px 4px rgba(0,0,0,.35)">${nb}</div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      }),
    });
  };

  function clusterEach(
    feature: { properties: Record<string, unknown> },
    layer: LeafletGeoJSON,
  ) {
    layer.bindPopup(
      popupHtml(
        `<strong>Cluster</strong><br/>Cas confirmés : <strong>${feature.properties.nb}</strong>`,
      ),
    );
  }

  /* ── Rendu ────────────────────────────────────────────────────── */
  return (
    <div className="relative h-full w-full">
      <style>{`
        .leaflet-control-attribution {
          font-size: 10px; line-height: 1.4; color: #64748b;
          background: rgba(255,255,255,0.72); padding: 2px 6px;
          border-radius: 6px 0 0 0; backdrop-filter: blur(2px);
        }
        .leaflet-control-attribution a { color: #0369A1; }
      `}</style>

      <MapContainer
        center={CENTRE_MADAGASCAR}
        zoom={6}
        minZoom={4}
        maxZoom={15}
        maxBounds={MADAGASCAR_BOUNDS}
        maxBoundsViscosity={1}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapActions
          bounds={bounds}
          focusZone={focusZone}
          flyTarget={flyTarget}
        />

        {layers.regions && !loading && regions ? (
          <GeoJSON
            key={`regions-${loadedMaladie}-${mapVersion}`}
            data={regions}
            style={regionStyle}
            onEachFeature={regionEach}
          />
        ) : null}
        {layers.limites && !loading && zones ? (
          <GeoJSON
            key={`zones-${loadedMaladie}-${mapVersion}`}
            data={zones}
            style={zoneStyle}
            onEachFeature={zoneEach}
          />
        ) : null}
        {layers.centres && filteredCentres ? (
          <GeoJSON
            key={`centres-${zoneName}-${mapVersion}`}
            data={filteredCentres}
            pointToLayer={centrePoint}
            onEachFeature={centreEach}
          />
        ) : null}
        {layers.cas && filteredCas ? (
          <GeoJSON
            key={`cas-${Array.from(statuts).sort().join("|")}-${maladie}-${zoneName}-${mapVersion}`}
            data={filteredCas}
            pointToLayer={casPoint}
            onEachFeature={casEach}
          />
        ) : null}
        {layers.clusters && maladie && !loading && clusters && !focusZone ? (
          <GeoJSON
            key={`clusters-${loadedMaladie}-${mapVersion}`}
            data={clusters}
            pointToLayer={clusterPoint}
            onEachFeature={clusterEach}
          />
        ) : null}
      </MapContainer>

      <ZoneInfoPanel
        focusZone={focusZone}
        zoneInfo={zoneInfo}
        zoneLoading={zoneLoading}
        onReset={resetView}
        onFlyToCentre={flyToCentre}
      />

      <MapControlsPanel
        layers={{
          ...layers,
          cas: Boolean(maladie) && layers.cas,
          clusters: Boolean(maladie) && layers.clusters,
        }}
        statuts={statuts}
        maladie={maladie}
        maladieOptions={maladieOptions}
        loading={loading}
        onToggleLayer={toggleLayer}
        onToggleStatut={toggleStatut}
        onSetMaladie={(value) => {
          setMaladie(value);
          setZoneInfo(null);
          if (!value)
            setLayers((previous) => ({
              ...previous,
              cas: false,
              clusters: false,
            }));
        }}
      />
    </div>
  );
}
