"use client";

import { RotateCcw, X } from "lucide-react";
import { GRAVITE_FILL, GRAVITE_LABEL, type FocusZone, type ZoneInfo } from "@/features/zones/types/map.types";

interface ZoneInfoPanelProps {
  /** Zone actuellement sélectionnée sur la carte (null = panneau caché). */
  focusZone:   FocusZone | null;
  /** Données épidémiologiques de la zone (null = pas encore chargées). */
  zoneInfo:    ZoneInfo | null;
  /** Indique si la requête de résumé est en cours. */
  zoneLoading: boolean;
  /** Rappel pour réinitialiser la vue (ferme le panneau). */
  onReset:     () => void;
  /** Rappel pour faire voler la carte vers un centre de santé. */
  onFlyToCentre: (centreId: number) => void;
}

/**
 * Panneau contextuel flottant (haut-gauche de la carte) qui s'affiche
 * lorsqu'une zone administrative est cliquée.
 * Affiche : alerte en cours, statistiques de cas, liste des centres.
 */
export function ZoneInfoPanel({
  focusZone,
  zoneInfo,
  zoneLoading,
  onReset,
  onFlyToCentre,
}: ZoneInfoPanelProps) {
  if (!focusZone) return null;

  return (
    <div className="absolute left-3 top-14 z-[1000] w-72 max-w-[calc(100%-24px)] rounded-2xl border border-border bg-bg-surface/95 p-4 shadow-card backdrop-blur-md">
      {/* En-tête : nom de zone + bouton fermeture */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-text-main">{focusZone.name}</p>
        <button
          type="button"
          onClick={onReset}
          aria-label="Fermer la sélection de zone"
          className="grid size-7 shrink-0 place-items-center rounded-lg text-text-muted transition-colors hover:bg-bg-app hover:text-text-main"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Corps */}
      {zoneLoading ? (
        <p className="mt-2 text-xs text-text-muted">Chargement…</p>
      ) : zoneInfo ? (
        <div className="mt-2 space-y-2.5 text-sm">
          {/* Alerte */}
          {zoneInfo.alerte ? (
            <div className="flex items-center gap-2">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{
                  backgroundColor: GRAVITE_FILL[zoneInfo.alerte.gravite] ?? "#94a3b8",
                }}
              />
              <span className="text-text-muted">
                Alerte{" "}
                <strong className="text-text-main">
                  {GRAVITE_LABEL[zoneInfo.alerte.gravite] ?? zoneInfo.alerte.gravite}
                </strong>
                {" · "}
                {zoneInfo.alerte.maladie}
              </span>
            </div>
          ) : (
            <p className="text-text-muted">Aucune alerte active.</p>
          )}

          {/* Statistiques cas */}
          <p className="text-text-muted">
            Cas déclarés :{" "}
            <strong className="text-text-main">{zoneInfo.casTotal}</strong>
            {" ("}
            <strong className="text-text-main">{zoneInfo.casConfirmes}</strong>
            {" confirmés)"}
          </p>

          {/* Centres de santé */}
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
                      onClick={() => onFlyToCentre(c.id)}
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

      {/* Bouton réinitialisation */}
      <button
        type="button"
        onClick={onReset}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-bg-surface px-3 py-2 text-xs font-medium text-text-main transition-colors hover:bg-bg-app"
      >
        <RotateCcw className="size-3.5" />
        Réinitialiser la vue
      </button>
    </div>
  );
}
