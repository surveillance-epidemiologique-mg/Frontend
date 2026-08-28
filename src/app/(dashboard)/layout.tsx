import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { verifySession } from "@/lib/session";
import { getMe } from "@/services/auth";

export default async function DashboardLayoutRoot({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await verifySession();

  if (!session) {
    redirect("/login");
  }

  let user: { name: string; email: string; role?: string } = {
    name: session.email.split("@")[0] ?? "Utilisateur",
    email: session.email,
    role: session.role,
  };

  try {
    const me = await getMe();
    user = { name: me.name, email: me.email, role: me.role?.name ?? session.role };
  } catch {
    // L'API peut être indisponible : on retombe sur les données de session
  }

  return (
    <DashboardLayout user={user}>
      {children}
    </DashboardLayout>
  );
}