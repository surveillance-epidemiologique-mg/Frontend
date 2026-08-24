import { redirect } from "next/navigation";
import { DashboardView } from "@/features/dashboard/components/dashboard-view";
import { verifySession } from "@/lib/session";
import { getMe } from "@/services/auth";

export default async function DashboardPage() {
  const session = await verifySession();

  if (!session) {
    redirect("/login");
  }

  let user: { name: string; email: string } = {
    name: session.email.split("@")[0] ?? "Utilisateur",
    email: session.email,
  };

  try {
    const me = await getMe();
    user = { name: me.name, email: me.email };
  } catch {
    // L'API peut être indisponible : on retombe sur les données de session
  }

  return <DashboardView session={session} user={user} />;
}