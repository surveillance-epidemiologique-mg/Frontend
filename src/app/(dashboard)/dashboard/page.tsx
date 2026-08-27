import { redirect } from "next/navigation";
import { DashboardView } from "@/features/dashboard/components/dashboard-view";
import {
  fetchDashboardStats,
  fetchDiseases,
  type DashboardStats,
  type EvolutionPoint,
  type RecentAlert,
  type ZoneDistribution,
} from "@/services/dashboard";
import { verifySession } from "@/lib/session";
import { getMe } from "@/services/auth";
import type { Maladie } from "@/features/settings/types";
import type { CaseRecord } from "@/types/case";

interface DashboardPageProps {
  searchParams: Promise<{ diseaseId?: string }>;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const session = await verifySession();

  if (!session) {
    redirect("/login");
  }

  const { diseaseId } = await searchParams;

  let user: { name: string; email: string } = {
    name: session.email.split("@")[0] ?? "Utilisateur",
    email: session.email,
  };

  try {
    const me = await getMe();
    user = { name: me.name, email: me.email };
  } catch {
    // L'API peut être indisponible : on retombe sur les données de session
  }

  let diseases: Maladie[] = [];
  let stats: DashboardStats | null = null;
  let evolution: EvolutionPoint[] = [];
  let distribution: ZoneDistribution[] = [];
  let recentAlerts: RecentAlert[] = [];
  let recentCases: CaseRecord[] = [];

  try {
    const [diseasesData, dashboardData] = await Promise.all([
      fetchDiseases(),
      fetchDashboardStats(diseaseId),
    ]);
    diseases = diseasesData;
    stats = dashboardData.stats;
    evolution = dashboardData.evolution;
    distribution = dashboardData.distribution;
    recentAlerts = dashboardData.recentAlerts;
    recentCases = dashboardData.recentCases;
  } catch {
    // L'API peut être indisponible : on affiche le dashboard sans données
  }

  return (
    <DashboardView
      session={session}
      user={user}
      diseases={diseases}
      stats={stats}
      evolution={evolution}
      distribution={distribution}
      recentAlerts={recentAlerts}
      recentCases={recentCases}
      selectedDiseaseId={diseaseId}
    />
  );
}