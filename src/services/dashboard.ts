import { apiFetch } from "@/lib/api";
import type { Maladie } from "@/features/settings/types";
import type { CaseRecord } from "@/types/case";

export interface DashboardStats {
  total: number;
  newCases: number;
  active: number;
  recovered: number;
  deceased: number;
  confirmed: number;
  suspect: number;
  activeAlerts: number;
}

export interface EvolutionPoint {
  date: string;
  count: number;
}

export interface ZoneDistribution {
  zone: string;
  count: number;
}

export type AlertNiveauRisque = "Normal" | "Surveillance" | "Alerte" | "Critique";
export type AlertStatut = "Active" | "EnPriseEnCharge" | "Resolue";

export interface RecentAlert {
  id: number;
  maladie: string;
  zone: string;
  detectionDate: string;
  niveauRisque: AlertNiveauRisque;
  statut: AlertStatut;
  detectedCaseCount: number;
}

export interface DashboardData {
  stats: DashboardStats;
  evolution: EvolutionPoint[];
  distribution: ZoneDistribution[];
  recentAlerts: RecentAlert[];
  recentCases: CaseRecord[];
}

export function fetchDiseases(): Promise<Maladie[]> {
  return apiFetch<Maladie[]>("/maladies");
}

export function fetchDashboardStats(
  diseaseId?: string,
): Promise<DashboardData> {
  const query = diseaseId ? `?diseaseId=${encodeURIComponent(diseaseId)}` : "";
  return apiFetch<DashboardData>(`/dashboard/stats${query}`);
}