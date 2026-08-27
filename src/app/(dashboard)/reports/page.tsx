import { redirect } from "next/navigation";
import { ReportsPage } from "@/features/reports/components/reports-page";
import { verifySession } from "@/lib/session";

export default async function ReportsPageRoute() {
  const session = await verifySession();

  if (!session) {
    redirect("/login");
  }

  return <ReportsPage />;
}