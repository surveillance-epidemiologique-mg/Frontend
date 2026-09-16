import L from "leaflet";

/* ================================================================== */
/*  Constantes géographiques                                          */
/* ================================================================== */

export const MADAGASCAR_BOUNDS: L.LatLngBoundsExpression = [
  [-25.6, 43.0],
  [-11.9, 50.6],
];

/* ================================================================== */
/*  Tokens de couleur — Gravité des alertes                           */
/* ================================================================== */

export const GRAVITE_LABEL: Record<string, string> = {
  Faible:   "Faible",
  Modere:   "Modéré",
  Eleve:    "Élevé",
  Critique: "Critique",
};

export const GRAVITE_FILL: Record<string, string> = {
  Faible:   "#eab308",
  Modere:   "#f97316",
  Eleve:    "#dc2626",
  Critique: "#7f1d1d",
};

export const GRAVITE_STROKE: Record<string, string> = {
  Faible:   "#ca8a04",
  Modere:   "#ea580c",
  Eleve:    "#b91c1c",
  Critique: "#450a0a",
};

export const GRAVITES = ["Faible", "Modere", "Eleve", "Critique"] as const;

/* ================================================================== */
/*  Tokens de couleur — Statut des cas                                */
/* ================================================================== */

export const STATUT_LABEL: Record<string, string> = {
  Suspect:  "Suspect",
  Probable: "Probable",
  Confirme: "Confirmé",
  Invalide: "Invalidé",
};

export const STATUT_COLOR: Record<string, string> = {
  Suspect:  "#eab308",
  Probable: "#f97316",
  Confirme: "#dc2626",
  Invalide: "#94a3b8",
};

export const STATUTS = ["Suspect", "Probable", "Confirme", "Invalide"] as const;

/* ================================================================== */
/*  Couches cartographiques                                           */
/* ================================================================== */

export type LayerKey = "cas" | "centres" | "alertes" | "limites" | "clusters";

export const LAYER_DEFS: { key: LayerKey; label: string }[] = [
  { key: "cas",      label: "Cas" },
  { key: "centres",  label: "Centres de santé" },
  { key: "alertes",  label: "Alertes" },
  { key: "limites",  label: "Limites administratives" },
  { key: "clusters", label: "Clusters de cas" },
];

/* ================================================================== */
/*  Interfaces TypeScript                                             */
/* ================================================================== */

export interface GeojsonCollection {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    geometry: { type: string; coordinates: unknown } | null;
    properties: Record<string, unknown>;
  }>;
}

export interface ZoneInfo {
  zoneId:       number;
  nom:          string;
  type:         string;
  centreCount:  number;
  centres:      { id: number; name: string; type: string }[];
  casTotal:     number;
  casConfirmes: number;
  alerte:       { gravite: string; maladie: string; cas: number } | null;
}

export interface FocusZone {
  id:     number;
  name:   string;
  bounds: L.LatLngBoundsExpression;
}

export interface FlyTarget {
  center: [number, number];
  zoom:   number;
}

/* ================================================================== */
/*  Icônes Leaflet                                                    */
/* ================================================================== */

export const crossIcon = L.divIcon({
  className: "",
  html: `<div style="display:grid;place-items:center;width:22px;height:22px;border-radius:50%;background:#0369a1;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4)"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></div>`,
  iconSize:    [22, 22],
  iconAnchor:  [11, 11],
  popupAnchor: [0, -10],
});

/* ================================================================== */
/*  Helpers GeoJSON — calcul de bounding box                         */
/* ================================================================== */

function walkCoords(geometry: unknown, out: [number, number][]) {
  const g = geometry as {
    type?: string;
    coordinates?: unknown;
    geometries?: unknown[];
  } | null;
  if (!g) return;
  const c = g.coordinates as unknown;

  if (g.type === "Point") {
    const p = c as [number, number];
    out.push([p[1], p[0]]);
  } else if (g.type === "MultiPoint" || g.type === "LineString") {
    for (const p of c as [number, number][]) out.push([p[1], p[0]]);
  } else if (g.type === "Polygon" || g.type === "MultiLineString") {
    for (const ring of c as [number, number][][])
      for (const p of ring) out.push([p[1], p[0]]);
  } else if (g.type === "MultiPolygon") {
    for (const poly of c as [number, number][][][])
      for (const ring of poly)
        for (const p of ring) out.push([p[1], p[0]]);
  } else if (g.type === "GeometryCollection") {
    for (const sub of g.geometries ?? []) walkCoords(sub, out);
  }
}

export function computeBounds(
  collections: (GeojsonCollection | null)[],
): L.LatLngBoundsExpression | null {
  const pts: [number, number][] = [];
  for (const fc of collections) {
    if (!fc) continue;
    for (const f of fc.features) walkCoords(f.geometry, pts);
  }
  if (pts.length === 0) return null;

  let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
  for (const [lat, lng] of pts) {
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  }
  return [[minLat, minLng], [maxLat, maxLng]];
}

/* ================================================================== */
/*  Helpers HTML — popups Leaflet                                     */
/* ================================================================== */

export function popupHtml(html: string): string {
  return `<div style="font-family:system-ui,sans-serif;font-size:12px;line-height:1.5;min-width:160px">${html}</div>`;
}

export function statutDot(statut: string, label: string): string {
  return `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${STATUT_COLOR[statut] ?? "#64748b"};margin-right:4px;vertical-align:middle"></span>${label}`;
}
