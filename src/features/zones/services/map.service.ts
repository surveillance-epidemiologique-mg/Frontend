import { apiFetch } from "@/services/api";
import type {
  AlertRegion,
  GeojsonCollection,
  ZoneInfo,
} from "@/features/zones/types/map.types";

/* ================================================================== */
/*  Helpers internes                                                  */
/* ================================================================== */

const EMPTY_COLLECTION: GeojsonCollection = {
  type: "FeatureCollection",
  features: [],
};

async function fetchGeoLayer(path: string): Promise<GeojsonCollection> {
  try {
    return await apiFetch<GeojsonCollection>(path);
  } catch {
    return EMPTY_COLLECTION;
  }
}

/* ================================================================== */
/*  API publique                                                      */
/* ================================================================== */

/**
 * Charge simultanément les 6 couches GeoJSON de la carte épidémique.
 * En cas d'erreur réseau partielle, les couches indisponibles sont
 * remplacées par une FeatureCollection vide (pas de crash).
 */
export async function fetchAllMapLayers(): Promise<{
  regions:  GeojsonCollection;
  zones:    GeojsonCollection;
  centres:  GeojsonCollection;
  alertes:  GeojsonCollection;
  clusters: GeojsonCollection;
  cas:      GeojsonCollection;
}> {
  const [regions, zones, centres, alertes, clusters, cas] = await Promise.all([
    fetchGeoLayer("/carte/regions"),
    fetchGeoLayer("/carte/zones"),
    fetchGeoLayer("/carte/centres"),
    fetchGeoLayer("/carte/alertes"),
    fetchGeoLayer("/carte/clusters"),
    fetchGeoLayer("/carte/cas"),
  ]);
  return { regions, zones, centres, alertes, clusters, cas };
}

/**
 * Récupère le résumé épidémiologique d'une zone (alerte, cas, centres).
 * Lève une erreur si la réponse HTTP n'est pas OK.
 */
export async function fetchZoneSummary(id: number): Promise<ZoneInfo> {
  return await apiFetch<ZoneInfo>(`/carte/zone/${id}`);
}

/**
 * Alertes par région (ADM1) : `[{ region_name, risk_level }]`.
 * Conservé pour compatibilité ; la couche « Régions » inclut déjà `risk_level`.
 */
export async function fetchAlertesRegions(): Promise<AlertRegion[]> {
  try {
    return await apiFetch<AlertRegion[]>("/carte/alertes-regions");
  } catch {
    return [];
  }
}
