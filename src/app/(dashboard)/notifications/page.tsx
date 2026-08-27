import { redirect } from "next/navigation";
import { NotificationsPage } from "@/features/notifications/components/notifications-page";
import { verifySession } from "@/lib/session";

export default async function NotificationsPageRoute() {
  const session = await verifySession();

  if (!session) {
    redirect("/login");
  }

  return <NotificationsPage />;
}