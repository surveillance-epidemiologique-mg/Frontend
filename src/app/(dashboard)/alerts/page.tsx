import { Bell } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";

export default function AlertsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Alertes"
        description="Surveillance des alertes sanitaires."
      />
      <EmptyState
        icon={Bell}
        title="Aucune alerte pour le moment"
        description="Les alertes sanitaires et les notifications épidémiologiques seront affichées ici dès leur activation."
      />
    </div>
  );
}