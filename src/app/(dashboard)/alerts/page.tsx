import { redirect } from "next/navigation";
import { AlertsPage } from "@/features/alerts/components/alerts-page";
import { verifySession } from "@/lib/session";
import { ROLES } from "@/types/auth";

export default async function AlertsPageRoute() {
  const session = await verifySession();

  if (!session) {
    redirect("/login");
  }

  return <AlertsPage isAdmin={session.role === ROLES.ADMINISTRATEUR} />;
}