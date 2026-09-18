"use client";

import { useEffect, useMemo, useState } from "react";
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
  GRAVITE_FILL,
  GRAVITE_LABEL,
  GRAVITE_STROKE,
  NO_ALERT_FILL,
  NO_ALERT_STROKE,
  NO_DATA_FILL,
  NO_DATA_STROKE,
  RISK_COLOR,
  RISK_LABEL,
  STATUT_COLOR,
  STATUT_LABEL,
  MADAGASCAR_BOUNDS,
  crossIcon,
  computeBounds,
  normalizeRegionName,
  popupHtml,
  regionNameFromFeature,
  statutDot,
} from "@/features/zones/types/map.types";
import {
  fetchAdm1GeoJson,
  fetchAlertesRegions,
  fetchAllMapLayers,
  fetchZoneSummary,
} from "@/features/zones/services/map.service";
import { MapActions }       from "@/features/zones/components/map-actions";
import { ZoneInfoPanel }    from "@/features/zones/components/zone-info-panel";
import { MapControlsPanel } from "@/features/zones/components/map-controls-panel";

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
    alertes: false,
    limites: false,
    clusters: false,
  });
  const [statuts, setStatuts] = useState<Set<string>>(new Set());
  const [maladie, setMaladie] = useState("");

  /* ── State : données GeoJSON ──────────────────────────────────── */
  const [zones,    setZones]    = useState<GeojsonCollection | null>(null);
  const [centres,  setCentres]  = useState<GeojsonCollection | null>(null);
  const [alertes,  setAlertes]  = useState<GeojsonCollection | null>(null);
  const [clusters, setClusters] = useState<GeojsonCollection | null>(null);
  const [cas,      setCas]      = useState<GeojsonCollection | null>(null);
  const [adm1Geo,  setAdm1Geo]  = useState<GeojsonCollection | null>(null);
  const [regionRisks, setRegionRisks] = useState<Record<string, string>>({});
  const [loading,  setLoading]  = useState(true);
  const [maladieOptions, setMaladieOptions] = useState<string[]>([]);

  /* ── State : navigation & panneau zone ────────────────────────── */
  const [focusZone,   setFocusZone]   = useState<FocusZone | null>(null);
  const [flyTarget,   setFlyTarget]   = useState<FlyTarget | null>(null);
  const [zoneInfo,    setZoneInfo]    = useState<ZoneInfo | null>(null);
  const [zoneLoading, setZoneLoading] = useState(false);

  /* ── Chargement initial des couches ───────────────────────────── */
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [data, geoData, alertData] = await Promise.all([
          fetchAllMapLayers(),
          fetchAdm1GeoJson(),
          fetchAlertesRegions(),
        ]);
        if (!active) return;
        setZones(data.zones);
        setCentres(data.centres);
        setAlertes(data.alertes);
        setClusters(data.clusters);
        setCas(data.cas);
        setAdm1Geo(geoData);
        const risks: Record<string, string> = {};
        for (const a of alertData) {
          if (a?.region_name) {
            risks[normalizeRegionName(a.region_name)] = a.risk_level;
          }
        }
        setRegionRisks(risks);
      } catch {
        // API indisponible : les couches restent vides
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  /* ── Chargement des maladies (pour le filtre) ─────────────────── */
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/maladies");
        if (!res.ok || !active) return;
        const data: { name: string }[] = await res.json();
        if (active) setMaladieOptions(data.map((m) => m.name).sort());
      } catch {
        // indisponible : pas de filtre maladie
      }
    })();
    return () => { active = false; };
  }, []);

  /* ── Données dérivées ─────────────────────────────────────────── */
  const bounds = useMemo(
    () => computeBounds([adm1Geo, zones, centres, alertes, clusters, cas]),
    [adm1Geo, zones, centres, alertes, clusters, cas],
  );

  function regionRiskOf(feature: { properties: Record<string, unknown> }) {
    return regionRisks[normalizeRegionName(regionNameFromFeature(feature.properties))];
  }

  const zoneName = focusZone?.name ?? "";

  const filteredCas = useMemo(() => {
    if (!cas) return null;
    return {
      type: "FeatureCollection" as const,
      features: cas.features.filter((f) => {
        const statut = String(f.properties.statut ?? "");
        if (statuts.size > 0 && !statuts.has(statut)) return false;
        if (maladie && f.properties.maladie !== maladie) return false;
        if (zoneName && f.properties.zone !== zoneName) return false;
        return true;
      }),
    };
  }, [cas, statuts, maladie, zoneName]);

  const filteredCentres = useMemo(() => {
    if (!centres) return null;
    if (!zoneName) return centres;
    return {
      type: "FeatureCollection" as const,
      features: centres.features.filter((f) => f.properties.zone === zoneName),
    };
  }, [centres, zoneName]);

  const filteredAlertes = useMemo(() => {
    if (!alertes) return null;
    if (!zoneName) return alertes;
    return {
      type: "FeatureCollection" as const,
      features: alertes.features.filter((f) => f.properties.zone === zoneName),
    };
  }, [alertes, zoneName]);

  /* ── Handlers ─────────────────────────────────────────────────── */
  function toggleLayer(key: LayerKey) {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function toggleStatut(s: string) {
    setStatuts((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s); else next.add(s);
      return next;
    });
  }

  async function handleZoneClick(id: number, name: string, layerBounds: L.LatLngBoundsExpression) {
    setFocusZone({ id, name, bounds: layerBounds });
    setZoneLoading(true);
    try {
      const data = await fetchZoneSummary(id);
      setZoneInfo(data);
    } catch {
      setZoneInfo(null);
    } finally {
      setZoneLoading(false);
    }
  }

  function resetView() {
    setFocusZone(null);
    setZoneInfo(null);
    setFlyTarget(null);
  }

  function flyToCentre(centreId: number) {
    const feature = centres?.features.find(
      (f) => Number(f.properties.id) === centreId,
    );
    const geom = feature?.geometry as { type?: string; coordinates?: unknown } | null;
    if (geom?.type === "Point") {
      const [lng, lat] = geom.coordinates as [number, number];
      setFlyTarget({ center: [lat, lng], zoom: 10 });
    }
  }

  /* ── Styles & popups des couches GeoJSON ──────────────────────── */

  const regionStyle = (feature?: { properties: Record<string, unknown> }) => {
    const risk = feature ? regionRiskOf(feature) : undefined;
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

  function regionEach(
    feature: { properties: Record<string, unknown> },
    layer: LeafletGeoJSON,
  ) {
    const name = regionNameFromFeature(feature.properties);
    const risk = regionRiskOf(feature);
    const label = risk ? (RISK_LABEL[risk] ?? risk) : "Aucune alerte";
    const color = risk ? (RISK_COLOR[risk] ?? "#94a3b8") : "#94a3b8";
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
    layer.on("click", () => layer.openPopup());
  }

  /**
   * Style choroplèthe pour la couche « Limites administratives ».
   * Toutes les zones reçoivent un remplissage :
   *   • Gravité connue   → palette jaune–rouge selon l'échelle à 5 niveaux
   *   • Aucune alerte    → vert clair (risque très faible confirmé)
   *   • Données absentes → bleu-lavande neutre (« données insuffisantes »)
   */
  const zoneStyle = (feature?: { properties: Record<string, unknown> }) => {
    const gravite = String(feature?.properties?.gravite ?? "");
    const hasData = feature !== undefined; // le feature existe, juste sans alerte

    if (gravite && GRAVITE_FILL[gravite]) {
      // Zone avec alerte active : couleur de risque pleine
      return {
        color:       GRAVITE_STROKE[gravite],
        weight:      1,
        fillColor:   GRAVITE_FILL[gravite],
        fillOpacity: 0.72,
      };
    }
    if (hasData) {
      // Zone sans alerte active (donnée présente mais aucune alerte)
      return {
        color:       NO_ALERT_STROKE,
        weight:      1,
        fillColor:   NO_ALERT_FILL,
        fillOpacity: 0.55,
      };
    }
    // Zone dont les données sont absentes (« données insuffisantes »)
    return {
      color:       NO_DATA_STROKE,
      weight:      1,
      fillColor:   NO_DATA_FILL,
      fillOpacity: 0.50,
    };
  };

  function zoneEach(feature: { properties: Record<string, unknown> }, layer: LeafletGeoJSON) {
    const p       = feature.properties;
    const gravite = String(p.gravite ?? "");
    const html    = gravite
      ? `<strong>${p.nom}</strong><br/>Alerte : ${p.alerteMaladie}<br/>Gravité : <strong>${GRAVITE_LABEL[gravite] ?? gravite}</strong><br/>Cas détectés : <strong>${p.alerteCas}</strong><br/>Détectée le : ${new Date(String(p.alerteDate)).toLocaleDateString("fr-FR")}`
      : `<strong>${p.nom}</strong><br/><span style="color:#64748b">Aucune alerte active</span>`;
    layer.bindPopup(popupHtml(html));
    layer.on("mouseover", () => {
      layer.setStyle({ weight: 2.5, fillOpacity: 0.9 });
      layer.bringToFront();
    });
    layer.on("mouseout",  () => { layer.setStyle(zoneStyle(feature) as L.PathOptions); });
    layer.on("click", () => {
      const id   = Number(p.id ?? 0);
      const name = String(p.nom ?? "");
      if (!id) return;
      void handleZoneClick(id, name, layer.getBounds());
    });
  }

  /**
   * Style choroplèthe pour la couche « Alertes » (zones avec alerte uniquement).
   * Utilise la même échelle de couleurs que zoneStyle,
   * avec une opacité légèrement plus élevée pour marquer la distinction.
   */
  const alerteStyle = (feature?: { properties: Record<string, unknown> }) => {
    const gravite = String(feature?.properties?.gravite ?? "");
    return {
      color:       GRAVITE_STROKE[gravite] ?? NO_ALERT_STROKE,
      weight:      1.5,
      fillColor:   GRAVITE_FILL[gravite]   ?? NO_ALERT_FILL,
      fillOpacity: 0.75,
    };
  };

  function alerteEach(feature: { properties: Record<string, unknown> }, layer: LeafletGeoJSON) {
    const p       = feature.properties;
    const gravite = String(p.gravite ?? "");
    layer.bindPopup(popupHtml(
      `<strong>${p.maladie}</strong><br/>Zone : ${p.zone}<br/>Gravité : <strong>${GRAVITE_LABEL[gravite] ?? gravite}</strong><br/>Cas détectés : <strong>${p.cas}</strong><br/>Détectée le : ${new Date(String(p.date)).toLocaleDateString("fr-FR")}`,
    ));
    layer.on("mouseover", () => { layer.setStyle({ weight: 2.5, fillOpacity: 0.9 }); layer.bringToFront(); });
    layer.on("mouseout",  () => { layer.setStyle(alerteStyle(feature) as L.PathOptions); });
  }

  const casPoint = (
    feature?: { properties: Record<string, unknown> },
    latlng?: L.LatLng,
  ) => {
    const statut = String(feature?.properties?.statut ?? "");
    return L.circleMarker(latlng ?? [0, 0], {
      radius: 6, color: "#ffffff", weight: 1.5,
      fillColor: STATUT_COLOR[statut] ?? "#64748b", fillOpacity: 0.9,
    });
  };

  function casEach(feature: { properties: Record<string, unknown> }, layer: LeafletGeoJSON) {
    const p      = feature.properties;
    const statut = String(p.statut ?? "");
    layer.bindPopup(popupHtml(
      `<strong style="font-family:monospace">${p.code}</strong><br/>Maladie : ${p.maladie}<br/>Centre : ${p.centre}<br/>${statutDot(statut, STATUT_LABEL[statut] ?? statut)}`,
    ));
  }

  const centrePoint = (
    _feature?: { properties: Record<string, unknown> },
    latlng?: L.LatLng,
  ) => L.marker(latlng ?? [0, 0], { icon: crossIcon });

  function centreEach(feature: { properties: Record<string, unknown> }, layer: LeafletGeoJSON) {
    const p = feature.properties;
    layer.bindPopup(popupHtml(`<strong>${p.nom}</strong><br/>${p.type}<br/>Zone : ${p.zone ?? "—"}`));
  }

  const clusterPoint = (
    feature?: { properties: Record<string, unknown> },
    latlng?: L.LatLng,
  ) => {
    const nb   = Number(feature?.properties?.nb ?? 1);
    const size = 28 + Math.min(nb, 8) * 2;
    return L.marker(latlng ?? [0, 0], {
      icon: L.divIcon({
        className: "",
        html: `<div style="display:grid;place-items:center;width:${size}px;height:${size}px;border-radius:50%;background:#0369a1;color:#ffffff;font-weight:600;font-size:12px;border:2px solid #ffffff;box-shadow:0 1px 4px rgba(0,0,0,.35)">${nb}</div>`,
        iconSize: [size, size], iconAnchor: [size / 2, size / 2],
      }),
    });
  };

  function clusterEach(feature: { properties: Record<string, unknown> }, layer: LeafletGeoJSON) {
    layer.bindPopup(popupHtml(`<strong>Cluster</strong><br/>Cas confirmés : <strong>${feature.properties.nb}</strong>`));
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
        .leaflet-control-attribution a { color: #0369a1; }
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

        <MapActions bounds={bounds} focusZone={focusZone} flyTarget={flyTarget} />

        {layers.regions   && adm1Geo        ? <GeoJSON data={adm1Geo}         style={regionStyle}  onEachFeature={regionEach}  /> : null}
        {layers.limites   && zones          ? <GeoJSON data={zones}           style={zoneStyle}    onEachFeature={zoneEach}    /> : null}
        {layers.alertes   && filteredAlertes ? <GeoJSON data={filteredAlertes} style={alerteStyle}  onEachFeature={alerteEach}  /> : null}
        {layers.centres   && filteredCentres ? <GeoJSON data={filteredCentres} pointToLayer={centrePoint} onEachFeature={centreEach}  /> : null}
        {layers.cas       && filteredCas    ? (
          <GeoJSON
            key={`cas-${Array.from(statuts).sort().join("|")}-${maladie}-${zoneName}`}
            data={filteredCas}
            pointToLayer={casPoint}
            onEachFeature={casEach}
          />
        ) : null}
        {layers.clusters  && clusters && !focusZone ? <GeoJSON data={clusters} pointToLayer={clusterPoint} onEachFeature={clusterEach} /> : null}
      </MapContainer>

      <ZoneInfoPanel
        focusZone={focusZone}
        zoneInfo={zoneInfo}
        zoneLoading={zoneLoading}
        onReset={resetView}
        onFlyToCentre={flyToCentre}
      />

      <MapControlsPanel
        layers={layers}
        statuts={statuts}
        maladie={maladie}
        maladieOptions={maladieOptions}
        loading={loading}
        onToggleLayer={toggleLayer}
        onToggleStatut={toggleStatut}
        onSetMaladie={setMaladie}
      />
    </div>
  );
}