import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { InviteForm } from "@/features/users/components/invite-form";
import { verifySession } from "@/lib/session";
import { ROLES } from "@/types/auth";

export default async function InvitePage() {
  const session = await verifySession();

  if (!session || session.role !== ROLES.ADMINISTRATEUR) {
    redirect("/dashboard");
  }

  return (
    <AuthShell
      title="Inviter un utilisateur"
      subtitle="Créez un compte Médecin ou Laboratoire"
    >
      <InviteForm />
    </AuthShell>
  );
}