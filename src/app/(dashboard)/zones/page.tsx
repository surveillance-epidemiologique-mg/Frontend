import { Map } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export default function CarteEpidemiquePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Carte épidémique"
        description="Visualisation géospatiale de la situation épidémiologique."
      />
      <EmptyState
        icon={Map}
        title="Module géospatial à venir"
        description="Le rendu cartographique interactif (fond de carte, clusters, heatmaps) sera disponible dans une prochaine itération."
      />
    </div>
  );
}