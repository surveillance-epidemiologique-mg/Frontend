import { MapPinned } from "lucide-react";
import { PageHeader } from "@/components/page-header/component";
import { EpidemicMap } from "@/features/zones/components/EpidemicMap/EpidemicMap";

export default function CarteEpidemiquePage() {
  return (
    <div className="w-full space-y-5 pb-6">
      <PageHeader
        title="Carte épidémique"
        description="Explorez les alertes par région et affinez la vue par maladie, statut ou type de données."
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-bg-surface px-3 py-1.5 text-xs font-medium text-text-muted shadow-sm">
          <MapPinned className="size-3.5 text-primary" aria-hidden="true" />
          Madagascar
        </span>
      </PageHeader>

      <EpidemicMap />
    </div>
  );
}
