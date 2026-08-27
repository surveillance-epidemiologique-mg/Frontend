import { redirect } from "next/navigation";
import { AnalyticsPage } from "@/features/analytics/components/analytics-page";
import { verifySession } from "@/lib/session";

export default async function StatistiquesPage() {
  const session = await verifySession();

  if (!session) {
    redirect("/login");
  }

  return <AnalyticsPage />;
}