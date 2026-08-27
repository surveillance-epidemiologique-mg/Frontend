import { redirect } from "next/navigation";
import { EstablishmentsView } from "@/features/establishments/components/establishments-view";
import { PageHeader } from "@/components/ui/page-header";
import { apiFetch } from "@/lib/api";
import { verifySession } from "@/lib/session";
import type { CentreSante } from "@/types/auth";

export default async function EtablissementsPage() {
  const session = await verifySession();

  if (!session) {
    redirect("/login");
  }

  let centres: CentreSante[] = [];
  try {
    centres = await apiFetch<CentreSante[]>("/centres");
  } catch {
    // API indisponible : liste vide
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Établissements"
        description="Annuaire des établissements de santé."
      />
      <EstablishmentsView centres={centres} />
    </div>
  );
}