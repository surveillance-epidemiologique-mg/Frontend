export const MAP_DATA_CHANGED_EVENT = "episuivi:map-data-changed";

/**
 * Notifie les vues déjà ouvertes qu'une opération métier a modifié les
 * données utilisées par la carte épidémique.
 */
export function notifyMapDataChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(MAP_DATA_CHANGED_EVENT));
  }
}
