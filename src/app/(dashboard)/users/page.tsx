import { redirect } from "next/navigation";
import { UsersManagement } from "@/features/users/components/users-management";
import { verifySession } from "@/lib/session";
import { ROLES } from "@/types/auth";

export default async function UsersPage() {
  const session = await verifySession();

  if (!session || session.role !== ROLES.ADMINISTRATEUR) {
    redirect("/dashboard");
  }

  return <UsersManagement />;
}