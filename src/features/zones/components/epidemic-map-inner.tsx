"use client";

import { useEffect, useMemo, useState } from "react";
import {
  GeoJSON,
  MapContainer,
  TileLayer,
  useMap,
} from "react-leaflet";
import L, { type GeoJSON as LeafletGeoJSON } from "leaflet";
import "leaflet/dist/leaflet.css";
import { ChevronDown, Filter, Layers, Palette, RotateCcw, X } from "lucide-react";
import { CENTRE_MADAGASCAR } from "@/features/zones/data/map-data";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Couleurs                                                          */
/* ------------------------------------------------------------------ */

const GRAVITE_LABEL: Record<string, string> = {
  Faible: "Faible",
  Modere: "Modéré",
  Eleve: "Élevé",
  Critique: "Critique",
};

const GRAVITE_FILL: Record<string, string> = {
  Faible: "#eab308",
  Modere: "#f97316",
  Eleve: "#dc2626",
  Critique: "#7f1d1d",
};

const GRAVITE_STROKE: Record<string, string> = {
  Faible: "#ca8a04",
  Modere: "#ea580c",
  Eleve: "#b91c1c",
  Critique: "#450a0a",
};

const STATUT_LABEL: Record<string, string> = {
  Suspect: "Suspect",
  Probable: "Probable",
  Confirme: "Confirmé",
  Invalide: "Invalidé",
};

const STATUT_COLOR: Record<string, string> = {
  Suspect: "#eab308",
  Probable: "#f97316",
  Confirme: "#dc2626",
  Invalide: "#94a3b8",
};

const STATUTS = ["Suspect", "Probable", "Confirme", "Invalide"];

const GRAVITES = ["Faible", "Modere", "Eleve", "Critique"];

const MADAGASCAR_BOUNDS: L.LatLngBoundsExpression = [
  [-25.6, 43.0],
  [-11.9, 50.6],
];

/* ------------------------------------------------------------------ */
/*  Icônes                                                             */
/* ------------------------------------------------------------------ */

const crossIcon = L.divIcon({
  className: "",
  html: `<div style="display:grid;place-items:center;width:22px;height:22px;border-radius:50%;background:#0369a1;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4)"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
  popupAnchor: [0, -10],
});

/* ------------------------------------------------------------------ */
/*  Helpers GeoJSON                                                    */
/* ------------------------------------------------------------------ */

interface GeojsonCollection {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    geometry: { type: string; coordinates: unknown } | null;
    properties: Record<string, unknown>;
  }>;
}

interface ZoneInfo {
  zoneId: number;
  nom: string;
  type: string;
  centreCount: number;
  centres: { id: number; name: string; type: string }[];
  casTotal: number;
  casConfirmes: number;
  alerte: { gravite: string; maladie: string; cas: number } | null;
}

function walkCoords(geometry: unknown, out: [number, number][]) {
  const g = geometry as { type?: string; coordinates?: unknown; geometries?: unknown[] } | null;
  if (!g) return;
  const c = g.coordinates as unknown;
  if (g.type === "Point") {
    const p = c as [number, number];
    out.push([p[1], p[0]]);
  } else if (g.type === "MultiPoint" || g.type === "LineString") {
    for (const p of c as [number, number][]) out.push([p[1], p[0]]);
  } else if (g.type === "Polygon" || g.type === "MultiLineString") {
    for (const ring of c as [number, number][][]) {
      for (const p of ring) out.push([p[1], p[0]]);
    }
  } else if (g.type === "MultiPolygon") {
    for (const poly of c as [number, number][][][]) {
      for (const ring of poly) for (const p of ring) out.push([p[1], p[0]]);
    }
  } else if (g.type === "GeometryCollection") {
    for (const sub of g.geometries ?? []) walkCoords(sub, out);
  }
}

function computeBounds(
  collections: (GeojsonCollection | null)[],
): L.LatLngBoundsExpression | null {
  const pts: [number, number][] = [];
  for (const fc of collections) {
    if (!fc) continue;
    for (const f of fc.features) walkCoords(f.geometry, pts);
  }
  if (pts.length === 0) return null;
  let minLat = 90;
  let maxLat = -90;
  let minLng = 180;
  let maxLng = -180;
  for (const [lat, lng] of pts) {
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  }
  return [
    [minLat, minLng],
    [maxLat, maxLng],
  ];
}

async function fetchGeo(url: string): Promise<GeojsonCollection> {
  const res = await fetch(url);
  if (!res.ok) return { type: "FeatureCollection", features: [] };
  return res.json();
}

/* ------------------------------------------------------------------ */
/*  Actions carte (fitBounds / flyTo)                                  */
/* ------------------------------------------------------------------ */

function MapActions({
  bounds,
  focusZone,
  flyTarget,
}: {
  bounds: L.LatLngBoundsExpression | null;
  focusZone: {
    id: number;
    name: string;
    bounds: L.LatLngBoundsExpression;
  } | null;
  flyTarget: { center: [number, number]; zoom: number } | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (focusZone) {
      map.flyToBounds(focusZone.bounds, { padding: [24, 24] });
    } else if (bounds) {
      map.fitBounds(bounds, { padding: [24, 24] });
    } else {
      map.fitBounds(MADAGASCAR_BOUNDS, { padding: [24, 24] });
    }
  }, [map, bounds, focusZone]);

  useEffect(() => {
    if (flyTarget) {
      map.flyTo(flyTarget.center, flyTarget.zoom, { duration: 0.8 });
    }
  }, [map, flyTarget]);

  return null;
}

/* ------------------------------------------------------------------ */
/*  Types de couches                                                   */
/* ------------------------------------------------------------------ */

type LayerKey = "cas" | "centres" | "alertes" | "limites" | "clusters";

const LAYER_DEFS: { key: LayerKey; label: string }[] = [
  { key: "cas", label: "Cas" },
  { key: "centres", label: "Centres de santé" },
  { key: "alertes", label: "Alertes" },
  { key: "limites", label: "Limites administratives" },
  { key: "clusters", label: "Clusters de cas" },
];

function popupHtml(html: string) {
  return `<div style="font-family:system-ui,sans-serif;font-size:12px;line-height:1.5;min-width:160px">${html}</div>`;
}

function statutDot(statut: string, label: string) {
  return `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${STATUT_COLOR[statut] ?? "#64748b"};margin-right:4px;vertical-align:middle"></span>${label}`;
}

export function EpidemicMapInner() {
  const [layers, setLayers] = useState<Record<LayerKey, boolean>>({
    cas: true,
    centres: true,
    alertes: true,
    limites: true,
    clusters: true,
  });
  const [statuts, setStatuts] = useState<Set<string>>(new Set());
  const [maladie, setMaladie] = useState("");
  const [panelOpen, setPanelOpen] = useState(true);

  const [zones, setZones] = useState<GeojsonCollection | null>(null);
  const [centres, setCentres] = useState<GeojsonCollection | null>(null);
  const [alertes, setAlertes] = useState<GeojsonCollection | null>(null);
  const [clusters, setClusters] = useState<GeojsonCollection | null>(null);
  const [cas, setCas] = useState<GeojsonCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const [focusZone, setFocusZone] = useState<{
    id: number;
    name: string;
    bounds: L.LatLngBoundsExpression;
  } | null>(null);
  const [flyTarget, setFlyTarget] = useState<{
    center: [number, number];
    zoom: number;
  } | null>(null);
  const [zoneInfo, setZoneInfo] = useState<ZoneInfo | null>(null);
  const [zoneLoading, setZoneLoading] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [z, c, a, k, cs] = await Promise.all([
          fetchGeo("/api/carte/zones"),
          fetchGeo("/api/carte/centres"),
          fetchGeo("/api/carte/alertes"),
          fetchGeo("/api/carte/clusters"),
          fetchGeo("/api/carte/cas"),
        ]);
        if (!active) return;
        setZones(z);
        setCentres(c);
        setAlertes(a);
        setClusters(k);
        setCas(cs);
      } catch {
        // API indisponible : couches vides
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const bounds = useMemo(
    () => computeBounds([zones, centres, alertes, clusters, cas]),
    [zones, centres, alertes, clusters, cas],
  );

  const maladieOptions = useMemo(() => {
    const names = new Set<string>();
    for (const f of cas?.features ?? []) {
      const n = String(f.properties.maladie ?? "");
      if (n) names.add(n);
    }
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [cas]);

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
      features: centres.features.filter(
        (f) => f.properties.zone === zoneName,
      ),
    };
  }, [centres, zoneName]);

  const filteredAlertes = useMemo(() => {
    if (!alertes) return null;
    if (!zoneName) return alertes;
    return {
      type: "FeatureCollection" as const,
      features: alertes.features.filter(
        (f) => f.properties.zone === zoneName,
      ),
    };
  }, [alertes, zoneName]);

  function toggle(key: LayerKey) {
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

  async function loadZoneSummary(id: number, name: string) {
    setZoneLoading(true);
    try {
      const res = await fetch(`/api/carte/zone/${id}`);
      if (!res.ok) throw new Error("Résumé indisponible.");
      const data = await res.json();
      setZoneInfo(data as ZoneInfo);
      void name;
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
    const geom = feature?.geometry as {
      type?: string;
      coordinates?: unknown;
    } | null;
    if (geom?.type === "Point") {
      const [lng, lat] = geom.coordinates as [number, number];
      setFlyTarget({ center: [lat, lng], zoom: 10 });
    }
  }

  /* ---------- Styles & popups des couches ---------- */

  const zoneStyle = (feature?: { properties: Record<string, unknown> }) => {
    const gravite = String(feature?.properties?.gravite ?? "");
    if (!gravite || !GRAVITE_FILL[gravite]) {
      return {
        color: "#94a3b8",
        weight: 1.5,
        fill: false,
        dashArray: "6 6",
      };
    }
    return {
      color: GRAVITE_STROKE[gravite],
      weight: 2,
      fillColor: GRAVITE_FILL[gravite],
      fillOpacity: 0.35,
    };
  };

  function zoneEach(feature: { properties: Record<string, unknown> }, layer: LeafletGeoJSON) {
    const p = feature.properties;
    const gravite = String(p.gravite ?? "");
    const html = gravite
      ? `<strong>${p.nom}</strong><br/>Alerte : ${p.alerteMaladie}<br/>Gravité : <strong>${GRAVITE_LABEL[gravite] ?? gravite}</strong><br/>Cas détectés : <strong>${p.alerteCas}</strong><br/>Détectée le : ${new Date(String(p.alerteDate)).toLocaleDateString("fr-FR")}`
      : `<strong>${p.nom}</strong>`;
    layer.bindPopup(popupHtml(html));
    layer.on("mouseover", () => {
      layer.setStyle({ weight: 3, fillOpacity: 0.5 });
      layer.bringToFront();
    });
    layer.on("mouseout", () => {
      layer.setStyle(zoneStyle(feature) as L.PathOptions);
    });
    // Navigation par clic : zoom sur la zone + filtrage contextuel + panneau info.
    layer.on("click", () => {
      const bounds = layer.getBounds();
      const id = Number(p.id ?? 0);
      const name = String(p.nom ?? "");
      if (!id) return;
      setFocusZone({ id, name, bounds });
      void loadZoneSummary(id, name);
    });
  }

  const alerteStyle = (feature?: { properties: Record<string, unknown> }) => {
    const gravite = String(feature?.properties?.gravite ?? "");
    const color = GRAVITE_FILL[gravite] ?? "#fdba74";
    const stroke = GRAVITE_STROKE[gravite] ?? "#ea580c";
    return {
      color: stroke,
      weight: 2,
      fillColor: color,
      fillOpacity: 0.4,
    };
  };

  function alerteEach(feature: { properties: Record<string, unknown> }, layer: LeafletGeoJSON) {
    const p = feature.properties;
    const gravite = String(p.gravite ?? "");
    const html = `<strong>${p.maladie}</strong><br/>Zone : ${p.zone}<br/>Gravité : <strong>${GRAVITE_LABEL[gravite] ?? gravite}</strong><br/>Cas détectés : <strong>${p.cas}</strong><br/>Détectée le : ${new Date(String(p.date)).toLocaleDateString("fr-FR")}`;
    layer.bindPopup(popupHtml(html));
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

  function casEach(feature: { properties: Record<string, unknown> }, layer: LeafletGeoJSON) {
    const p = feature.properties;
    const statut = String(p.statut ?? "");
    const html = `<strong style="font-family:monospace">${p.code}</strong><br/>Maladie : ${p.maladie}<br/>Centre : ${p.centre}<br/>${statutDot(statut, STATUT_LABEL[statut] ?? statut)}`;
    layer.bindPopup(popupHtml(html));
  }

  const centrePoint = (
    feature?: { properties: Record<string, unknown> },
    latlng?: L.LatLng,
  ) => L.marker(latlng ?? [0, 0], { icon: crossIcon });

  function centreEach(feature: { properties: Record<string, unknown> }, layer: LeafletGeoJSON) {
    const p = feature.properties;
    layer.bindPopup(
      popupHtml(`<strong>${p.nom}</strong><br/>${p.type}<br/>Zone : ${p.zone ?? "—"}`),
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
        html: `<div style="display:grid;place-items:center;width:${size}px;height:${size}px;border-radius:50%;background:#0369a1;color:#ffffff;font-weight:600;font-size:12px;border:2px solid #ffffff;box-shadow:0 1px 4px rgba(0,0,0,.35)">${nb}</div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      }),
    });
  };

  function clusterEach(feature: { properties: Record<string, unknown> }, layer: LeafletGeoJSON) {
    layer.bindPopup(
      popupHtml(`<strong>Cluster</strong><br/>Cas confirmés : <strong>${feature.properties.nb}</strong>`),
    );
  }

  return (
    <div className="relative h-full w-full">
      <style>{`
        .leaflet-control-attribution {
          font-size: 10px;
          line-height: 1.4;
          color: #64748b;
          background: rgba(255, 255, 255, 0.72);
          padding: 2px 6px;
          border-radius: 6px 0 0 0;
          backdrop-filter: blur(2px);
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

        <MapActions
          bounds={bounds}
          focusZone={focusZone}
          flyTarget={flyTarget}
        />

        {layers.limites && zones ? (
          <GeoJSON data={zones} style={zoneStyle} onEachFeature={zoneEach} />
        ) : null}

        {layers.alertes && filteredAlertes ? (
          <GeoJSON
            data={filteredAlertes}
            style={alerteStyle}
            onEachFeature={alerteEach}
          />
        ) : null}

        {layers.centres && filteredCentres ? (
          <GeoJSON
            data={filteredCentres}
            pointToLayer={centrePoint}
            onEachFeature={centreEach}
          />
        ) : null}

        {layers.cas && filteredCas ? (
          <GeoJSON
            key={`cas-${Array.from(statuts).sort().join("|")}-${maladie}-${zoneName}`}
            data={filteredCas}
            pointToLayer={casPoint}
            onEachFeature={casEach}
          />
        ) : null}

        {layers.clusters && clusters && !focusZone ? (
          <GeoJSON
            data={clusters}
            pointToLayer={clusterPoint}
            onEachFeature={clusterEach}
          />
        ) : null}
      </MapContainer>

      {/* Panneau contextuel de zone sélectionnée */}
      {focusZone ? (
        <div className="absolute left-3 top-14 z-[1000] w-72 max-w-[calc(100%-24px)] rounded-2xl border border-border bg-bg-surface/95 p-4 shadow-card backdrop-blur-md">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-text-main">
              {focusZone.name}
            </p>
            <button
              type="button"
              onClick={resetView}
              aria-label="Fermer la sélection de zone"
              className="grid size-7 shrink-0 place-items-center rounded-lg text-text-muted transition-colors hover:bg-bg-app hover:text-text-main"
            >
              <X className="size-4" />
            </button>
          </div>

          {zoneLoading ? (
            <p className="mt-2 text-xs text-text-muted">Chargement…</p>
          ) : zoneInfo ? (
            <div className="mt-2 space-y-2.5 text-sm">
              {zoneInfo.alerte ? (
                <div className="flex items-center gap-2">
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{
                      backgroundColor:
                        GRAVITE_FILL[zoneInfo.alerte.gravite] ?? "#94a3b8",
                    }}
                  />
                  <span className="text-text-muted">
                    Alerte{" "}
                    <strong className="text-text-main">
                      {GRAVITE_LABEL[zoneInfo.alerte.gravite] ??
                        zoneInfo.alerte.gravite}
                    </strong>{" "}
                    · {zoneInfo.alerte.maladie}
                  </span>
                </div>
              ) : (
                <p className="text-text-muted">Aucune alerte active.</p>
              )}

              <p className="text-text-muted">
                Cas déclarés :{" "}
                <strong className="text-text-main">{zoneInfo.casTotal}</strong>
                {" ("}
                <strong className="text-text-main">
                  {zoneInfo.casConfirmes}
                </strong>{" "}
                confirmés)
              </p>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                  Centres de santé ({zoneInfo.centreCount})
                </p>
                {zoneInfo.centreCount === 0 ? (
                  <p className="mt-1 text-xs text-text-muted">Aucun centre.</p>
                ) : (
                  <ul className="mt-1 max-h-32 space-y-1 overflow-y-auto pr-1">
                    {zoneInfo.centres.map((c) => (
                      <li key={c.id}>
                        <button
                          type="button"
                          onClick={() => flyToCentre(c.id)}
                          className="block w-full truncate rounded px-1.5 py-0.5 text-left text-xs text-text-muted transition-colors hover:bg-bg-app hover:text-primary hover:underline"
                          title={`Centrer sur ${c.name}`}
                        >
                          {c.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ) : (
            <p className="mt-2 text-xs text-text-muted">
              Données indisponibles pour cette zone.
            </p>
          )}

          <button
            type="button"
            onClick={resetView}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-bg-surface px-3 py-2 text-xs font-medium text-text-main transition-colors hover:bg-bg-app"
          >
            <RotateCcw className="size-3.5" />
            Réinitialiser la vue
          </button>
        </div>
      ) : null}

      {/* Panneau flottant : Filtres + Légende + Couches (bas gauche,
          laissant l'attribution des fonds de carte visible en bas à droite) */}
      <div className="absolute bottom-3 left-3 z-[1000] w-64 max-w-[calc(100%-24px)] overflow-hidden rounded-2xl border border-border bg-bg-surface/95 shadow-card backdrop-blur-md">
        <button
          type="button"
          onClick={() => setPanelOpen((o) => !o)}
          className="flex w-full items-center justify-between gap-2 px-4 py-3 text-sm font-semibold text-text-main transition-colors hover:bg-bg-app"
          aria-expanded={panelOpen}
        >
          <span className="flex items-center gap-2">
            <Filter className="size-4 text-primary" />
            Filtres &amp; Légende
            {loading ? (
              <span className="text-[11px] font-normal text-text-muted">
                Chargement…
              </span>
            ) : null}
          </span>
          <ChevronDown
            className={cn(
              "size-4 text-text-muted transition-transform duration-200",
              panelOpen && "rotate-180",
            )}
          />
        </button>

        {panelOpen ? (
          <div className="space-y-4 border-t border-border px-4 py-3">
            {/* Filtres */}
            <section>
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                <Filter className="size-3" />
                Filtres des cas
              </p>
              <div className="flex flex-wrap gap-1.5">
                {STATUTS.map((s) => {
                  const active = statuts.has(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleStatut(s)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset transition-colors",
                        active
                          ? "bg-bg-app text-text-main ring-primary/40"
                          : "bg-transparent text-text-muted ring-border hover:bg-bg-app",
                      )}
                      aria-pressed={active}
                    >
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: STATUT_COLOR[s] }}
                      />
                      {STATUT_LABEL[s]}
                    </button>
                  );
                })}
              </div>

              <label
                htmlFor="carte-maladie"
                className="mt-2.5 block text-xs font-medium text-text-main"
              >
                Maladie
              </label>
              <select
                id="carte-maladie"
                value={maladie}
                onChange={(e) => setMaladie(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-bg-surface px-3 py-2 text-sm text-text-main focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Toutes les maladies</option>
                {maladieOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </section>

            {/* Légende */}
            <section className="border-t border-border pt-3">
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                <Palette className="size-3" />
                Légende
              </p>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                {GRAVITES.map((g) => (
                  <span
                    key={g}
                    className="flex items-center gap-1.5 text-xs text-text-muted"
                  >
                    <span
                      className="size-2.5 shrink-0 rounded-full border"
                      style={{
                        backgroundColor: GRAVITE_FILL[g],
                        borderColor: GRAVITE_STROKE[g],
                      }}
                    />
                    {GRAVITE_LABEL[g]}
                  </span>
                ))}
              </div>
              <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 border-t border-border pt-2">
                {STATUTS.map((s) => (
                  <span
                    key={s}
                    className="flex items-center gap-1.5 text-xs text-text-muted"
                  >
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: STATUT_COLOR[s] }}
                    />
                    {STATUT_LABEL[s]}
                  </span>
                ))}
              </div>
            </section>

            {/* Couches */}
            <section className="border-t border-border pt-3">
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                <Layers className="size-3" />
                Couches
              </p>
              <div className="space-y-0.5">
                {LAYER_DEFS.map((layer) => {
                  const active = layers[layer.key];
                  return (
                    <button
                      key={layer.key}
                      type="button"
                      onClick={() => toggle(layer.key)}
                      className="flex w-full items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-left text-sm text-text-main transition-colors hover:bg-bg-app"
                      aria-pressed={active}
                    >
                      <span className="truncate">{layer.label}</span>
                      <span
                        className={cn(
                          "relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200",
                          active ? "bg-primary" : "bg-border",
                        )}
                        aria-hidden="true"
                      >
                        <span
                          className={cn(
                            "absolute top-0.5 size-4 rounded-full bg-white shadow-sm transition-all duration-200",
                            active ? "left-[18px]" : "left-0.5",
                          )}
                        />
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </div>
  );
}