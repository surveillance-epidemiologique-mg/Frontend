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
    <div className="absolute left-3 top-20 z-[900] max-h-[calc(100%-6rem)] w-80 max-w-[calc(100%-24px)] overflow-y-auto rounded-2xl border border-border/80 bg-bg-surface/95 p-4 shadow-dropdown backdrop-blur-xl sm:left-4 sm:top-4 sm:max-h-[calc(100%-2rem)] sm:max-w-[calc(100%-32px)]">
      {/* En-tête : nom de zone + bouton fermeture */}
      <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Région sélectionnée</p>
          <p className="mt-1 break-words text-base font-semibold leading-6 tracking-tight text-text-main">{focusZone.name}</p>
        </div>
        <button
          type="button"
          onClick={onReset}
          aria-label="Fermer la sélection de zone"
          className="grid size-8 shrink-0 place-items-center rounded-lg text-text-muted transition-colors hover:bg-bg-app hover:text-text-main focus-visible:outline-2 focus-visible:outline-primary"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Corps */}
      {zoneLoading ? (
        <p className="py-5 text-center text-sm text-text-muted">Chargement des données…</p>
      ) : zoneInfo ? (
        <div className="mt-3 space-y-3 text-sm">
          {/* Alerte */}
          {zoneInfo.alerte ? (
            <div className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-bg-app/60 px-3 py-2.5">
              <span
                className="mt-1 size-2.5 shrink-0 rounded-full ring-2 ring-bg-surface"
                style={{
                  backgroundColor: GRAVITE_FILL[zoneInfo.alerte.gravite] ?? "var(--text-muted)",
                }}
              />
              <span className="leading-5 text-text-muted">
                Alerte <strong className="font-semibold text-text-main">
                  {GRAVITE_LABEL[zoneInfo.alerte.gravite] ?? zoneInfo.alerte.gravite}
                </strong>
                {" · "}
                {zoneInfo.alerte.maladie}
              </span>
            </div>
          ) : (
            <p className="rounded-xl border border-border/60 bg-bg-app/60 px-3 py-2.5 text-sm text-text-muted">Aucune alerte active.</p>
          )}

          {/* Statistiques cas */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-border/60 px-3 py-2.5">
              <p className="text-xs text-text-muted">Cas déclarés</p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-text-main">{zoneInfo.casTotal}</p>
            </div>
            <div className="rounded-xl border border-border/60 px-3 py-2.5">
              <p className="text-xs text-text-muted">Confirmés</p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-primary">{zoneInfo.casConfirmes}</p>
            </div>
          </div>

          {/* Centres de santé */}
          <div className="border-t border-border/60 pt-3">
            <p className="text-xs font-semibold text-text-main">
              Centres de santé ({zoneInfo.centreCount})
            </p>
            {zoneInfo.centreCount === 0 ? (
              <p className="mt-1 text-xs text-text-muted">Aucun centre.</p>
            ) : (
              <ul className="mt-2 max-h-36 space-y-1 overflow-y-auto pr-1">
                {zoneInfo.centres.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => onFlyToCentre(c.id)}
                      className="block min-h-8 w-full rounded-lg px-2 py-1.5 text-left text-xs leading-5 text-text-muted transition-colors hover:bg-bg-app hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"
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
        <p className="py-5 text-center text-sm text-text-muted">
          Données indisponibles pour cette zone.
        </p>
      )}

      {/* Bouton réinitialisation */}
      <button
        type="button"
        onClick={onReset}
        className="mt-3 flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-border bg-bg-surface px-3 py-2 text-xs font-semibold text-text-main transition-colors hover:border-primary/40 hover:bg-bg-app focus-visible:outline-2 focus-visible:outline-primary"
      >
        <RotateCcw className="size-3.5" />
        Réinitialiser la vue
      </button>
    </div>
  );
}
