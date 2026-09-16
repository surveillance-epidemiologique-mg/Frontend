"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import type L from "leaflet";
import { CENTRE_MADAGASCAR } from "@/features/zones/data/map-data";
import { MADAGASCAR_BOUNDS, type FocusZone, type FlyTarget } from "@/features/zones/types/map.types";

interface MapActionsProps {
  bounds:     L.LatLngBoundsExpression | null;
  focusZone:  FocusZone | null;
  flyTarget:  FlyTarget | null;
}

/**
 * Composant Leaflet « invisible » (retourne null) qui pilote la caméra
 * de la carte via `useMap()`. Doit être rendu à l'intérieur de
 * `<MapContainer>`.
 *
 * Priorité des effets :
 *   1. focusZone  → flyToBounds sur la zone sélectionnée
 *   2. bounds     → fitBounds sur l'ensemble des données chargées
 *   3. fallback   → fitBounds sur Madagascar entier
 */
export function MapActions({ bounds, focusZone, flyTarget }: MapActionsProps) {
  const map = useMap();

  // Zoom sur la zone sélectionnée ou ajustement global au chargement
  useEffect(() => {
    if (focusZone) {
      map.flyToBounds(focusZone.bounds, { padding: [24, 24] });
    } else if (bounds) {
      map.fitBounds(bounds, { padding: [24, 24] });
    } else {
      map.fitBounds(MADAGASCAR_BOUNDS, { padding: [24, 24] });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusZone, bounds]);

  // Fly vers un centre de santé (déclenchée depuis ZoneInfoPanel)
  useEffect(() => {
    if (!flyTarget) return;
    map.flyTo(flyTarget.center, flyTarget.zoom, { duration: 0.8 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flyTarget]);

  // Réinitialisation de la vue quand focusZone est supprimé
  useEffect(() => {
    if (!focusZone) {
      map.setView(CENTRE_MADAGASCAR, 6);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusZone]);

  return null;
}
