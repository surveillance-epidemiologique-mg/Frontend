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
  STATUT_COLOR,
  STATUT_LABEL,
  STATUTS,
  type LayerKey,
} from "@/features/zones/types/map.types";
import { cn } from "@/lib/utils";
import { Select } from "@/components/select/component";

interface MapControlsPanelProps {
  canViewCaseLayers: boolean;
  layers: Record<LayerKey, boolean>;
  statuts: Set<string>;
  maladie: string;
  maladieOptions: { id: number; name: string }[];
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
    <section className="overflow-hidden rounded-xl border border-border/70 bg-bg-surface">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-start gap-3 px-3.5 py-3 text-left transition-colors hover:bg-bg-app/70 focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-primary"
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-light text-primary">
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold leading-5 text-text-main">
            {title}
          </span>
          {description ? (
            <span className="mt-0.5 block text-xs leading-5 text-text-muted">
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
        <div className="space-y-3 border-t border-border/60 bg-bg-app/30 px-3.5 py-3.5">
          {children}
        </div>
      ) : null}
    </section>
  );
}

function LegendGroup({ title, children }: LegendGroupProps) {
  return (
    <div className="rounded-xl border border-border/60 bg-bg-surface p-3">
      <p className="mb-2.5 text-[13px] font-semibold text-text-main">{title}</p>
      <div className="space-y-2">{children}</div>
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
      {fill === "transparent" && stroke === "transparent" ? (
        <span className="grid size-4 shrink-0 place-items-center text-sm text-text-muted" aria-hidden="true">—</span>
      ) : (
        <span
          className={cn(
            "shrink-0 border",
            shape === "dot" ? "size-3 rounded-full" : "size-4 rounded-[5px]",
          )}
          style={{ backgroundColor: fill, borderColor: stroke }}
          aria-hidden="true"
        />
      )}
      <span className="text-xs leading-5 text-text-main">{label}</span>
    </div>
  );
}

function LayerToggle({
  label,
  active,
  onToggle,
  disabled = false,
  description,
}: {
  label: string;
  active: boolean;
  onToggle: () => void;
  disabled?: boolean;
  description?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={active}
      className={cn(
        "flex min-h-11 w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left transition-colors focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50",
        active
          ? "bg-primary/8 ring-1 ring-inset ring-primary/25"
          : "hover:bg-bg-app",
      )}
    >
      <span
        className={cn(
          "min-w-0 text-sm",
          active ? "font-medium text-text-main" : "text-text-muted",
        )}
      >
        {label}
        {description ? (
          <span className="mt-0.5 block text-xs font-normal leading-4 text-text-muted">
            {description}
          </span>
        ) : null}
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
  canViewCaseLayers,
  layers,
  statuts,
  maladie,
  maladieOptions,
  loading,
  onToggleLayer,
  onToggleStatut,
  onSetMaladie,
}: MapControlsPanelProps) {
  const [panelOpen, setPanelOpen] = useState(false);
  const visibleLayers = LAYER_DEFS.filter(
    (layer) => canViewCaseLayers || (layer.key !== "cas" && layer.key !== "clusters"),
  );
  const activeLayerCount = visibleLayers.filter((layer) => layers[layer.key]).length;
  const diseaseLabel =
    maladieOptions.find((item) => String(item.id) === maladie)?.name ?? maladie;
  const alertMode = maladie ? `Filtré : ${diseaseLabel}` : "Toutes maladies";

  return (
    <div
      className={cn(
        "absolute left-3 top-3 z-[1000] max-w-[calc(100%-24px)] overflow-hidden rounded-2xl border border-border/80 bg-bg-surface/95 shadow-dropdown backdrop-blur-xl sm:bottom-4 sm:left-4 sm:top-auto sm:w-[min(100%,21rem)] sm:max-w-[calc(100%-32px)]",
        panelOpen ? "w-[min(100%,21rem)]" : "w-auto",
      )}
    >
      <button
        type="button"
        onClick={() => setPanelOpen((o) => !o)}
        className={cn(
          "flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-bg-app/60 focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-primary",
          panelOpen && "border-b border-border/60",
        )}
        aria-expanded={panelOpen}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary">
            <MapPin className="size-4.5" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold leading-5 text-text-main">
              Filtres et légende
            </span>
            <span className="hidden truncate text-xs leading-5 text-text-muted sm:block">
              {loading
                ? "Chargement des données…"
                : `${activeLayerCount} couche${activeLayerCount > 1 ? "s" : ""} active${activeLayerCount > 1 ? "s" : ""} · ${alertMode}`}
            </span>
          </span>
        </span>
        <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-bg-app text-text-muted">
          <ChevronDown
            className={cn("size-4 transition-transform duration-200", panelOpen && "rotate-180")}
            aria-hidden="true"
          />
        </span>
      </button>

      {panelOpen ? (
        <div className="max-h-[min(65dvh,420px)] space-y-2.5 overflow-y-auto p-3 sm:max-h-[min(72dvh,540px)]">
          <ControlSection
            icon={Filter}
            title="Filtres"
            description={canViewCaseLayers
              ? "La maladie filtre les alertes régionales, les cas et les clusters."
              : "La maladie filtre les alertes régionales."}
            defaultOpen
          >
            <div>
              <label
                htmlFor="carte-maladie"
                className="mb-1.5 block text-xs font-medium text-text-muted"
              >
                Maladie
              </label>
              <Select
                id="carte-maladie"
                options={[
                  { value: "", label: "Toutes les maladies" },
                  ...maladieOptions.map((item) => ({ value: String(item.id), label: item.name })),
                ]}
                value={maladie}
                onChange={(e) => onSetMaladie(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg-surface px-3 py-2 text-sm text-text-main focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            {canViewCaseLayers ? <div className="mt-3">
              <p className="mb-2 text-xs font-medium text-text-muted">
                Statut diagnostique — couche Cas
              </p>
              <div className="flex flex-wrap gap-1.5">
                {STATUTS.map((status) => (
                  <button
                    key={status}
                    type="button"
                    disabled={!maladie || !layers.cas}
                    onClick={() => onToggleStatut(status)}
                    aria-pressed={statuts.has(status)}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-50",
                      statuts.has(status)
                        ? "bg-primary/12 text-primary ring-1 ring-primary/30"
                        : "bg-bg-surface text-text-muted ring-1 ring-border",
                    )}
                  >
                    {STATUT_LABEL[status]}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-xs text-text-muted">
                Aucune sélection = tous les statuts. Les clusters regroupent
                uniquement les cas confirmés.
              </p>
            </div> : null}
          </ControlSection>

          <ControlSection
            icon={Layers}
            title="Couches affichées"
            description="Activez ou masquez chaque niveau de données sur la carte."
            defaultOpen={false}
          >
            <div className="space-y-1">
              {visibleLayers.map((layer) => (
                <LayerToggle
                  key={layer.key}
                  label={layer.label}
                  active={layers[layer.key]}
                  disabled={
                    !maladie &&
                    (layer.key === "cas" || layer.key === "clusters")
                  }
                  description={layer.key === "regions" ? alertMode : undefined}
                  onToggle={() => onToggleLayer(layer.key)}
                />
              ))}
            </div>
            {canViewCaseLayers && !maladie ? (
              <p className="mt-2 px-2 text-xs text-text-muted">
                Sélectionnez une maladie pour afficher les cas et les clusters.
              </p>
            ) : null}
          </ControlSection>

          <ControlSection
            icon={Palette}
            title="Légende des couleurs"
            description="Signification des teintes selon le type de couche."
            defaultOpen
          >
            <LegendGroup title="Alertes par région">
              <p
                className="mb-2 text-xs text-text-muted"
                aria-live="polite"
              >
                {alertMode}
              </p>
              {GRAVITES_LEGEND.map((g) => (
                <LegendItem
                  key={g.key}
                  label={g.label}
                  fill={g.fill}
                  stroke={g.stroke}
                />
              ))}
            </LegendGroup>

            {canViewCaseLayers ? <LegendGroup title="Statut des cas">
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
            </LegendGroup> : null}
          </ControlSection>
        </div>
      ) : null}
    </div>
  );
}
