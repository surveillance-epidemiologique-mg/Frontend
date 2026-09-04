import { PageHeader } from "@/components/ui/page-header";
import { EpidemicMap } from "@/features/zones/components/epidemic-map";

export default function CarteEpidemiquePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Carte épidémique"
        description="Visualisation géospatiale de la situation épidémiologique (données de démonstration)."
      />

      <EpidemicMap />
    </div>
  );
}