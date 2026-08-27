import { redirect } from "next/navigation";
import { SignalementsPage } from "@/features/cases/components/signalements-page";
import { verifySession } from "@/lib/session";
import { getMe } from "@/services/auth";
import { ROLES } from "@/types/auth";

export default async function CasesPage() {
  const session = await verifySession();

  if (!session) {
    redirect("/login");
  }

  const isAdmin = session.role === ROLES.ADMINISTRATEUR;

  let lockedCentre: {
    regionId: number;
    districtId: number;
    centreId: number;
  } | null = null;

  try {
    const me = await getMe();
    if (me.centre) {
      lockedCentre = {
        regionId: me.centre.zone?.parentId ?? 0,
        districtId: me.centre.zoneId,
        centreId: me.centre.id,
      };
    }
  } catch {
    // API indisponible : on laisse l'utilisateur choisir (le backend vérifie le périmètre)
  }

  return (
    <SignalementsPage
      isAdmin={isAdmin}
      currentUserId={session.id}
      lockedCentre={lockedCentre}
    />
  );
}