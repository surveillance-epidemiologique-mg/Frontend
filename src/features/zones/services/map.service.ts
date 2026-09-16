import type { GeojsonCollection, ZoneInfo } from "@/features/zones/types/map.types";

/* ================================================================== */
/*  Helpers internes                                                  */
/* ================================================================== */

const EMPTY_COLLECTION: GeojsonCollection = {
  type: "FeatureCollection",
  features: [],
};

async function fetchGeoLayer(url: string): Promise<GeojsonCollection> {
  const res = await fetch(url);
  if (!res.ok) return EMPTY_COLLECTION;
  return res.json();
}

/* ================================================================== */
/*  API publique                                                      */
/* ================================================================== */

/**
 * Charge simultanément les 5 couches GeoJSON de la carte épidémique.
 * En cas d'erreur réseau partielle, les couches indisponibles sont
 * remplacées par une FeatureCollection vide (pas de crash).
 */
export async function fetchAllMapLayers(): Promise<{
  zones:    GeojsonCollection;
  centres:  GeojsonCollection;
  alertes:  GeojsonCollection;
  clusters: GeojsonCollection;
  cas:      GeojsonCollection;
}> {
  const [zones, centres, alertes, clusters, cas] = await Promise.all([
    fetchGeoLayer("/api/carte/zones"),
    fetchGeoLayer("/api/carte/centres"),
    fetchGeoLayer("/api/carte/alertes"),
    fetchGeoLayer("/api/carte/clusters"),
    fetchGeoLayer("/api/carte/cas"),
  ]);
  return { zones, centres, alertes, clusters, cas };
}

/**
 * Récupère le résumé épidémiologique d'une zone (alerte, cas, centres).
 * Lève une erreur si la réponse HTTP n'est pas OK.
 */
export async function fetchZoneSummary(id: number): Promise<ZoneInfo> {
  const res = await fetch(`/api/carte/zone/${id}`);
  if (!res.ok) throw new Error("Résumé de zone indisponible.");
  return res.json();
}
