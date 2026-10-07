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
/*  Échelle à 5 niveaux inspirée des standards de stratification      */
/*  épidémiologique (ref. HMIS Malaria Risk Stratification)           */
/* ================================================================== */

/** Zone sans alerte active : elle conserve le fond neutre de la carte. */
export const NO_ALERT_FILL = "transparent";
export const NO_ALERT_STROKE = "transparent";

/** Zone dont les données sont absentes / non renseignées. */
export const NO_DATA_FILL = "#DBE5F6"; // primary-100 de la charte
export const NO_DATA_STROKE = "#38BDF8"; // primary-400 de la charte

export const GRAVITE_LABEL: Record<string, string> = {
  Faible: "Faible",
  Modere: "Modéré",
  Eleve: "Élevé",
  Critique: "Critique",
};

/** Couleurs de remplissage choroplèthe — du jaune au rouge sang. */
export const GRAVITE_FILL: Record<string, string> = {
  Faible: "#FDD835", // jaune
  Modere: "#FB8C00", // orange
  Eleve: "#E53935", // rouge
  Critique: "#B71C1C", // rouge foncé
};

export const GRAVITE_STROKE: Record<string, string> = {
  Faible: "#F9A825",
  Modere: "#E65100",
  Eleve: "#C62828",
  Critique: "#7F1D1D",
};

export const GRAVITES = ["Faible", "Modere", "Eleve", "Critique"] as const;

/**
 * Source de vérité unique pour la légende choroplèthe.
 * Ordre du risque le plus faible au plus élevé, incluant les cas
 * « Aucune alerte » et « Données insuffisantes ».
 */
export const GRAVITES_LEGEND = [
  {
    key: "aucune",
    label: "Aucune alerte",
    fill: NO_ALERT_FILL,
    stroke: NO_ALERT_STROKE,
  },
  {
    key: "Faible",
    label: GRAVITE_LABEL.Faible,
    fill: GRAVITE_FILL.Faible,
    stroke: GRAVITE_STROKE.Faible,
  },
  {
    key: "Modere",
    label: GRAVITE_LABEL.Modere,
    fill: GRAVITE_FILL.Modere,
    stroke: GRAVITE_STROKE.Modere,
  },
  {
    key: "Eleve",
    label: GRAVITE_LABEL.Eleve,
    fill: GRAVITE_FILL.Eleve,
    stroke: GRAVITE_STROKE.Eleve,
  },
  {
    key: "Critique",
    label: GRAVITE_LABEL.Critique,
    fill: GRAVITE_FILL.Critique,
    stroke: GRAVITE_STROKE.Critique,
  },
] as const;

export function alertStyle(feature?: { properties: Record<string, unknown> }) {
  const severity = String(feature?.properties.gravite ?? "");
  return {
    color: GRAVITE_STROKE[severity] ?? NO_ALERT_STROKE,
    weight: 1.5,
    fillColor: GRAVITE_FILL[severity] ?? NO_ALERT_FILL,
    fillOpacity: 0.75,
  };
}
/* ================================================================== */
/*  Tokens de couleur — Statut des cas                                */
/* ================================================================== */

export const STATUT_LABEL: Record<string, string> = {
  Suspect: "Suspect",
  Probable: "Probable",
  Confirme: "Confirmé",
  Invalide: "Invalidé",
};

export const STATUT_COLOR: Record<string, string> = {
  Suspect: "#F59E0B",
  Probable: "#B45309",
  Confirme: "#DC2626",
  Invalide: "#94A3B8",
};

export const STATUTS = ["Suspect", "Probable", "Confirme", "Invalide"] as const;

/* ================================================================== */
/*  Couches cartographiques                                           */
/* ================================================================== */

export type LayerKey = "cas" | "centres" | "regions" | "limites" | "clusters";

export const LAYER_DEFS: { key: LayerKey; label: string }[] = [
  { key: "regions", label: "Alertes par région" },
  { key: "cas", label: "Cas" },
  { key: "centres", label: "Centres de santé" },
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
  zoneId: number;
  nom: string;
  type: string;
  centreCount: number;
  centres: { id: number; name: string; type: string }[];
  casTotal: number;
  casConfirmes: number;
  alerte: { gravite: string; maladie: string; cas: number } | null;
}

export interface FocusZone {
  id: number;
  name: string;
  bounds: L.LatLngBoundsExpression;
}

export interface FlyTarget {
  center: [number, number];
  zoom: number;
}

/** Alertes agrégées par région (ADM1) — endpoint `/carte/alertes-regions`. */
export interface AlertRegion {
  region_name: string;
  risk_level: string;
}

/** Normalisation pour une correspondance robuste des noms (accents/casse). */
export function normalizeRegionName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Extrait le nom de région depuis les propriétés GeoJSON ADM1. */
export function regionNameFromFeature(
  properties: Record<string, unknown>,
): string {
  return String(
    properties.nom ??
      properties.shapeName ??
      properties.NAME_1 ??
      properties.name ??
      "",
  );
}

/* ================================================================== */
/*  Icônes Leaflet                                                    */
/* ================================================================== */

/**
 * Icône centre de santé — croix blanche sur fond bleu médical.
 * Double ombre + bordure blanche épaisse pour rester lisible
 * sur n'importe quelle couleur choroplèthe.
 */
export const crossIcon = L.divIcon({
  className: "",
  html: `<div style="display:grid;place-items:center;width:24px;height:24px;border-radius:50%;background:#0369A1;border:2.5px solid #fff;box-shadow:0 0 0 1.5px rgba(3,105,161,0.4),0 2px 6px rgba(0,0,0,.5)"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
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
      for (const ring of poly) for (const p of ring) out.push([p[1], p[0]]);
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

  let minLat = 90,
    maxLat = -90,
    minLng = 180,
    maxLng = -180;
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

/* ================================================================== */
/*  Helpers HTML — popups Leaflet                                     */
/* ================================================================== */

export function popupHtml(html: string): string {
  return `<div class="epidemic-map-popup">${html}</div>`;
}

export function statutDot(statut: string, label: string): string {
  return `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${STATUT_COLOR[statut] ?? "#64748b"};margin-right:4px;vertical-align:middle"></span>${label}`;
}
