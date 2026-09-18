"use client";

import { useState, type ReactNode } from "react";
import {
  ChevronDown,
  Filter,
  Layers,
  MapPin,
  Palette,
  type LucideIcon,
} from "lucide-react";
import {
  GRAVITES_LEGEND,
  LAYER_DEFS,
  RISK_COLOR,
  RISK_LABEL,
  RISK_ORDER,
  STATUT_COLOR,
  STATUT_LABEL,
  STATUTS,
  type LayerKey,
} from "@/features/zones/types/map.types";
import { cn } from "@/lib/utils";

interface MapControlsPanelProps {
  layers: Record<LayerKey, boolean>;
  statuts: Set<string>;
  maladie: string;
  maladieOptions: string[];
  loading: boolean;
  onToggleLayer: (key: LayerKey) => void;
  onToggleStatut: (s: string) => void;
  onSetMaladie: (m: string) => void;
}

interface ControlSectionProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

interface LegendGroupProps {
  title: string;
  children: ReactNode;
}

interface LegendItemProps {
  label: string;
  fill: string;
  stroke?: string;
  shape?: "square" | "dot";
}

function ControlSection({
  icon: Icon,
  title,
  description,
  defaultOpen = true,
  children,
}: ControlSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="overflow-hidden rounded-xl border border-border/80 bg-bg-app/40">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors hover:bg-bg-app/80"
      >
        <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-3.5" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold leading-snug text-text-main">
            {title}
          </span>
          {description ? (
            <span className="mt-0.5 block text-[11px] leading-relaxed text-text-muted">
              {description}
            </span>
          ) : null}
        </span>
        <ChevronDown
          className={cn(
            "mt-1 size-4 shrink-0 text-text-muted transition-transform duration-200",
            open && "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>
      {open ? (
        <div className="space-y-3 border-t border-border/60 px-3 py-3">
          {children}
        </div>
      ) : null}
    </section>
  );
}

function LegendGroup({ title, children }: LegendGroupProps) {
  return (
    <div className="rounded-lg border border-border/60 bg-bg-surface/80 p-2.5">
      <p className="mb-2 text-xs font-semibold text-text-main">{title}</p>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function LegendItem({
  label,
  fill,
  stroke = "transparent",
  shape = "square",
}: LegendItemProps) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className={cn(
          "shrink-0 border",
          shape === "dot" ? "size-2.5 rounded-full" : "size-3.5 rounded-[4px]",
        )}
        style={{ backgroundColor: fill, borderColor: stroke }}
        aria-hidden="true"
      />
      <span className="text-xs leading-snug text-text-main">{label}</span>
    </div>
  );
}

function LayerToggle({
  label,
  active,
  onToggle,
}: {
  label: string;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-left transition-colors",
        active
          ? "bg-primary/8 ring-1 ring-inset ring-primary/25"
          : "hover:bg-bg-surface/80",
      )}
    >
      <span
        className={cn(
          "truncate text-sm",
          active ? "font-medium text-text-main" : "text-text-muted",
        )}
      >
        {label}
      </span>
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
}

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
  const casLayerActive = layers.cas;

  return (
    <div className="absolute bottom-3 left-3 z-[1000] w-[min(100%,20rem)] max-w-[calc(100%-24px)] overflow-hidden rounded-2xl border border-border bg-bg-surface/95 shadow-card backdrop-blur-md">
      <button
        type="button"
        onClick={() => setPanelOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 border-b border-border/60 px-4 py-3 text-left transition-colors hover:bg-bg-app/50"
        aria-expanded={panelOpen}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <MapPin className="size-4" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-text-main">
              Contrôles de la carte
            </span>
            <span className="block text-[11px] text-text-muted">
              {loading ? "Chargement des données…" : "Couches, légende et filtres"}
            </span>
          </span>
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-text-muted transition-transform duration-200",
            panelOpen && "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>

      {panelOpen ? (
        <div className="max-h-[min(70vh,520px)] space-y-3 overflow-y-auto p-3">
          <ControlSection
            icon={Layers}
            title="Couches affichées"
            description="Activez ou masquez chaque niveau de données sur la carte."
            defaultOpen
          >
            <div className="space-y-1">
              {LAYER_DEFS.map((layer) => (
                <LayerToggle
                  key={layer.key}
                  label={layer.label}
                  active={layers[layer.key]}
                  onToggle={() => onToggleLayer(layer.key)}
                />
              ))}
            </div>
          </ControlSection>

          <ControlSection
            icon={Palette}
            title="Légende des couleurs"
            description="Signification des teintes selon le type de couche."
            defaultOpen
          >
            <LegendGroup title="Alertes par région">
              {RISK_ORDER.map((risk) => (
                <LegendItem
                  key={risk}
                  label={RISK_LABEL[risk]}
                  fill={RISK_COLOR[risk]}
                  stroke="rgba(51, 65, 85, 0.35)"
                />
              ))}
              <LegendItem
                label="Aucune alerte"
                fill="#e2e8f0"
                stroke="#94a3b8"
              />
            </LegendGroup>

            <LegendGroup title="Couches PostGIS">
              {GRAVITES_LEGEND.map((g) => (
                <LegendItem
                  key={g.key}
                  label={g.label}
                  fill={g.fill}
                  stroke={g.stroke}
                />
              ))}
            </LegendGroup>

            <LegendGroup title="Statut des cas">
              <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
                {STATUTS.map((s) => (
                  <LegendItem
                    key={s}
                    label={STATUT_LABEL[s]}
                    fill={STATUT_COLOR[s]}
                    shape="dot"
                  />
                ))}
              </div>
            </LegendGroup>
          </ControlSection>

          <ControlSection
            icon={Filter}
            title="Filtres des cas"
            description={
              casLayerActive
                ? "Affinez les points affichés lorsque la couche Cas est active."
                : "Activez la couche Cas pour utiliser ces filtres."
            }
            defaultOpen={casLayerActive}
          >
            {!casLayerActive ? (
              <p className="rounded-lg border border-dashed border-border bg-bg-surface/60 px-3 py-2.5 text-xs leading-relaxed text-text-muted">
                Les filtres s&apos;appliquent uniquement à la couche{" "}
                <span className="font-medium text-text-main">Cas</span>.
              </p>
            ) : (
              <>
                <div>
                  <p className="mb-2 text-xs font-medium text-text-muted">
                    Statut diagnostique
                  </p>
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
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                            active
                              ? "bg-primary/12 text-text-main ring-1 ring-inset ring-primary/30"
                              : "bg-bg-surface text-text-muted ring-1 ring-inset ring-border hover:bg-bg-app",
                          )}
                        >
                          <span
                            className="size-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: STATUT_COLOR[s] }}
                            aria-hidden="true"
                          />
                          {STATUT_LABEL[s]}
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-1.5 text-[11px] text-text-muted">
                    Aucune sélection = tous les statuts.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="carte-maladie"
                    className="mb-1.5 block text-xs font-medium text-text-muted"
                  >
                    Maladie
                  </label>
                  <select
                    id="carte-maladie"
                    value={maladie}
                    onChange={(e) => onSetMaladie(e.target.value)}
                    disabled={!casLayerActive}
                    className="w-full rounded-lg border border-border bg-bg-surface px-3 py-2 text-sm text-text-main focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="">Toutes les maladies</option>
                    {maladieOptions.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </ControlSection>
        </div>
      ) : null}
    </div>
  );
}
