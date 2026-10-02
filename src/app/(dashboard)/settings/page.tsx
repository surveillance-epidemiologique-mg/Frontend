import { redirect } from "next/navigation";
import { SettingsPage } from "@/components/settings-page/component";
import { verifySession } from "@/lib/session";
import { ROLES } from "@/types/auth";

export default async function SettingsPageRoute() {
  const session = await verifySession();

  if (!session || session.role !== ROLES.ADMINISTRATEUR) {
    redirect("/dashboard");
  }

  return <SettingsPage />;
}