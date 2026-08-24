import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { verifySession } from "@/lib/session";
import { getMe } from "@/services/auth";
import { ROLES } from "@/types/auth";

export default async function DashboardLayout({
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
    <AppShell
      isAdmin={session.role === ROLES.ADMINISTRATEUR}
      user={user}
    >
      {children}
    </AppShell>
  );
}