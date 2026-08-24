import Link from "next/link";
import { redirect } from "next/navigation";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { verifySession } from "@/lib/session";
import { ROLES } from "@/types/auth";

export default async function UsersPage() {
  const session = await verifySession();

  if (!session || session.role !== ROLES.ADMINISTRATEUR) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Utilisateurs"
        description="Gestion des médecins et laboratoires."
      />
      <EmptyState
        icon={Users}
        title="Gestion des utilisateurs à venir"
        description="La gestion complète des utilisateurs (médecins, laboratoires) sera disponible prochainement."
      >
        <Button asChild variant="secondary">
          <Link href="/invite">Inviter un utilisateur</Link>
        </Button>
      </EmptyState>
    </div>
  );
}