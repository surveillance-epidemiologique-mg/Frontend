import { PageHeader } from "@/components/ui/page-header";
import { EpidemicMap } from "@/features/zones/components/epidemic-map";
import { RiskRegionMap } from "@/features/zones/components/risk-region-map";

export default function CarteEpidemiquePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Carte épidémique"
        description="Visualisation géospatiale de la situation épidémiologique par région et par couche (cas, centres, alertes et clusters)."
      />

      <EpidemicMap />

      <div className="space-y-2">
        <h2 className="text-lg font-bold text-text-main">
          Régions à risque
        </h2>
        <p className="text-sm text-text-muted">
          Carte des niveaux d&apos;alerte par région (ADM1) basée sur les alertes actives.
        </p>
        <RiskRegionMap />
      </div>
    </div>
  );
}