import { PageHeader } from "@/components/page-header/component";
import { EpidemicMap } from "@/features/zones/components/EpidemicMap/EpidemicMap";

export default function CarteEpidemiquePage() {
  return (
    <div className="w-full space-y-6">
      <PageHeader
        title="Carte épidémique"
        description="Visualisation géospatiale de la situation épidémiologique par région et par couche (cas, centres, alertes et clusters)."
      />

      <EpidemicMap />
    </div>
  );
}
