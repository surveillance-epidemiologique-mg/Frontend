import { Activity } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";

export default function CasesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Cas Épidémiologiques"
        description="Déclarez et suivez les cas épidémiologiques."
      />
      <EmptyState
        icon={Activity}
        title="Gestion des cas à venir"
        description="Le module de déclaration et de suivi des cas épidémiologiques sera disponible prochainement."
      />
    </div>
  );
}