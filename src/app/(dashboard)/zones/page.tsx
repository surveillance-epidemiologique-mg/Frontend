import { PageHeader } from "@/components/page-header/component";
import { EpidemicMap } from "@/components/epidemic-map/component";

export default function CarteEpidemiquePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Carte épidémique"
        description="Visualisation géospatiale de la situation épidémiologique par région et par couche (cas, centres, alertes et clusters)."
      />

      <EpidemicMap />
    </div>
  );
}