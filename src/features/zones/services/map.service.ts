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
 * Charge simultanément les couches visibles GeoJSON de la carte épidémique.
 * En cas d'erreur réseau partielle, les couches indisponibles sont
 * remplacées par une FeatureCollection vide (pas de crash).
 */
export async function fetchAllMapLayers(
  maladieId?: number,
  refresh = false,
  includeCaseLayers = true,
): Promise<{
  regions: GeojsonCollection;
  zones: GeojsonCollection;
  centres: GeojsonCollection;
  clusters: GeojsonCollection;
  cas: GeojsonCollection;
}> {
  const queryParts = [
    ...(maladieId === undefined ? [] : [`id_maladie=${maladieId}`]),
    ...(refresh ? ["refresh=1"] : []),
  ];
  const query = queryParts.length ? `?${queryParts.join("&")}` : "";
  const [regions, zones, centres, clusters, cas] = await Promise.all([
    fetchGeoLayer(`/carte/regions${query}`),
    fetchGeoLayer(`/carte/zones${query}`),
    fetchGeoLayer("/carte/centres"),
    maladieId === undefined || !includeCaseLayers
      ? EMPTY_COLLECTION
      : fetchGeoLayer(`/carte/clusters${query}`),
    maladieId === undefined || !includeCaseLayers
      ? EMPTY_COLLECTION
      : fetchGeoLayer(`/carte/cas${query}`),
  ]);
  return { regions, zones, centres, clusters, cas };
}

/**
 * Récupère le résumé épidémiologique d'une zone (alerte, cas, centres).
 * Lève une erreur si la réponse HTTP n'est pas OK.
 */
export async function fetchZoneSummary(
  id: number,
  maladieId?: number,
): Promise<ZoneInfo> {
  return await apiFetch<ZoneInfo>(
    `/carte/zone/${id}${maladieId === undefined ? "" : `?id_maladie=${maladieId}`}`,
  );
}

/**
 * Alertes par région (ADM1) : `[{ region_name, risk_level }]`.
 * Conservé pour compatibilité ; la couche « Régions » inclut déjà `risk_level`.
 */
export async function fetchAlertesRegions(refresh = false): Promise<AlertRegion[]> {
  try {
    return await apiFetch<AlertRegion[]>(
      `/carte/alertes-regions${refresh ? "?refresh=1" : ""}`,
    );
  } catch {
    return [];
  }
}
