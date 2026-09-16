"use client";

import { useState } from "react";
import { ChevronDown, Filter, Layers, Palette } from "lucide-react";
import {
  GRAVITES_LEGEND,
  LAYER_DEFS,
  STATUT_COLOR,
  STATUT_LABEL,
  STATUTS,
  type LayerKey,
} from "@/features/zones/types/map.types";
import { cn } from "@/lib/utils";

interface MapControlsPanelProps {
  /** État on/off de chaque couche cartographique. */
  layers:         Record<LayerKey, boolean>;
  /** Ensemble des statuts actuellement sélectionnés pour le filtrage des cas. */
  statuts:        Set<string>;
  /** Maladie sélectionnée pour le filtrage (vide = toutes). */
  maladie:        string;
  /** Liste des maladies disponibles extraites des données GeoJSON. */
  maladieOptions: string[];
  /** Indique si les données initiales sont en cours de chargement. */
  loading:        boolean;
  /** Active ou désactive une couche cartographique. */
  onToggleLayer:  (key: LayerKey) => void;
  /** Active ou désactive le filtre d'un statut de cas. */
  onToggleStatut: (s: string) => void;
  /** Met à jour le filtre de maladie. */
  onSetMaladie:   (m: string) => void;
}

/**
 * Panneau flottant bas-gauche de la carte.
 * Contient trois sections collapsibles :
 *   1. Filtres des cas (statuts + maladie)
 *   2. Légende des couleurs (gravité + statut)
 *   3. Visibilité des couches (toggles)
 */
export function MapControlsPanel({
  layers,
  statuts,
  maladie,
  maladieOptions,
  loading,
  onToggleLayer,
  onToggleStatut,
  onSetMaladie,
}: MapControlsPanelProps) {
  const [panelOpen, setPanelOpen] = useState(true);

  return (
    <div className="absolute bottom-3 left-3 z-[1000] w-64 max-w-[calc(100%-24px)] overflow-hidden rounded-2xl border border-border bg-bg-surface/95 shadow-card backdrop-blur-md">
      {/* Bouton titre / collapse */}
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

          {/* ── Section : Filtres des cas ─────────────────────────── */}
          <section>
            <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
              <Filter className="size-3" />
              Filtres des cas
            </p>

            {/* Boutons statut (pills toggle) */}
            <div className="flex flex-wrap gap-1.5">
              {STATUTS.map((s) => {
                const active = statuts.has(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => onToggleStatut(s)}
                    aria-pressed={active}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset transition-colors",
                      active
                        ? "bg-bg-app text-text-main ring-primary/40"
                        : "bg-transparent text-text-muted ring-border hover:bg-bg-app",
                    )}
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

            {/* Sélecteur de maladie */}
            <label
              htmlFor="carte-maladie"
              className="mt-2.5 block text-xs font-medium text-text-main"
            >
              Maladie
            </label>
            <select
              id="carte-maladie"
              value={maladie}
              onChange={(e) => onSetMaladie(e.target.value)}
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

          {/* ── Section : Légende choroplèthe ─────────────────────── */}
          <section className="border-t border-border pt-3">
            <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
              <Palette className="size-3" />
              Légende — Niveau de risque
            </p>

            {/* Échelle 5 niveaux : aucune alerte → critique */}
            <div className="space-y-1.5">
              {GRAVITES_LEGEND.map((g) => (
                <span key={g.key} className="flex items-center gap-2 text-xs">
                  <span
                    className="size-3.5 shrink-0 rounded-sm border"
                    style={{ backgroundColor: g.fill, borderColor: g.stroke }}
                  />
                  <span className="font-medium text-text-main">{g.label}</span>
                </span>
              ))}
            </div>

            {/* Statuts des cas individuels */}
            <p className="mb-1.5 mt-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
              Statut des cas
            </p>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
              {STATUTS.map((s) => (
                <span key={s} className="flex items-center gap-1.5 text-xs text-text-muted">
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: STATUT_COLOR[s] }}
                  />
                  {STATUT_LABEL[s]}
                </span>
              ))}
            </div>
          </section>

          {/* ── Section : Couches ─────────────────────────────────── */}
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
                    onClick={() => onToggleLayer(layer.key)}
                    aria-pressed={active}
                    className="flex w-full items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-left text-sm text-text-main transition-colors hover:bg-bg-app"
                  >
                    <span className="truncate">{layer.label}</span>
                    {/* Toggle pill */}
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
  );
}
