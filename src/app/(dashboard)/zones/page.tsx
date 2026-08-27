import { redirect } from "next/navigation";
import MapPageLoader from "@/features/map/components/map-page-loader";
import { verifySession } from "@/lib/session";

export default async function ZonesPage() {
  const session = await verifySession();

  if (!session) {
    redirect("/login");
  }

  return <MapPageLoader />;
}