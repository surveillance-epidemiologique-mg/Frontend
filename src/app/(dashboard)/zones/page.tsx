import { redirect } from "next/navigation";
import { MapPinned } from "lucide-react";
import { PageHeader } from "@/components/page-header/component";
import { EpidemicMap } from "@/features/zones/components/EpidemicMap/EpidemicMap";
import { ROLES } from "@/config/navigation";
import { verifySession } from "@/lib/session";

export default async function CarteEpidemiquePage() {
  const session = await verifySession();
  if (!session) redirect("/login");
  const canViewCaseLayers = session.role === ROLES.ADMINISTRATEUR;

  return (
    <div className="w-full space-y-5 pb-6">
      <PageHeader
        title="Carte épidémique"
        description={canViewCaseLayers
          ? "Explorez les alertes par région et affinez la vue par maladie, statut ou type de données."
          : "Explorez les alertes par région et affinez la vue par maladie."}
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-bg-surface px-3 py-1.5 text-xs font-medium text-text-muted shadow-sm">
          <MapPinned className="size-3.5 text-primary" aria-hidden="true" />
          Madagascar
        </span>
      </PageHeader>

      <EpidemicMap canViewCaseLayers={canViewCaseLayers} />
    </div>
  );
}
