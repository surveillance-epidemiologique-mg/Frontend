import { Map } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";

export default function ZonesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Zones / Carte"
        description="Visualisation géographique des zones sanitaires."
      />
      <EmptyState
        icon={Map}
        title="Cartographie à venir"
        description="La cartographie des zones sanitaires et la visualisation géographique des données seront disponibles prochainement."
      />
    </div>
  );
}