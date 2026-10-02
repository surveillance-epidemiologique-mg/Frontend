import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell/component";
import { verifySession } from "@/lib/session";
import { getAuthPermissions, getMe } from "@/services/auth";

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
  // Le flag frontend permet d'afficher la navigation immédiatement. Le
  // backend reste l'autorité qui autorise réellement les endpoints.
  let laboratoryCanDeclareCases =
    process.env.LABO_PEUT_DECLARER_CAS === "true";

  try {
    const [me, permissions] = await Promise.all([
      getMe(),
      getAuthPermissions(),
    ]);
    user = {
      name: me.name,
      email: me.email,
      role: me.role?.name ?? session.role,
    };
    laboratoryCanDeclareCases =
      permissions.laboratoryCanDeclareCases === true &&
      process.env.LABO_PEUT_DECLARER_CAS === "true";
  } catch {
    // L'API peut être indisponible : on retombe sur les données de session
  }

  return (
    <AppShell
      user={user}
      laboratoryCanDeclareCases={laboratoryCanDeclareCases}
    >
      {children}
    </AppShell>
  );
}
