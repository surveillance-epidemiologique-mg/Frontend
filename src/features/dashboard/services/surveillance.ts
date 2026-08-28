export type Niveau =
  | "Aucun"
  | "Faible"
  | "Modere"
  | "Eleve"
  | "Critique";

export interface SurveillanceKpis {
  total: number;
  newCases: number;
  active: number;
  recovered: number;
  deceased: number;
  confirmed: number;
  suspected: number;
  activeAlerts: number;
  cfr: number;
  deltas: {
    total: number;
    newCases: number;
    active: number;
    recovered: number;
    deceased: number;
  };
}

export interface DiseaseStat {
  maladie: string;
  total: number;
  newCases: number;
  deceased: number;
  topRegion: string | null;
  niveau: Niveau;
}

export interface RegionDisease {
  maladie: string;
  total: number;
  newCases: number;
  active: number;
  deceased: number;
}

export interface SurveillanceRegion {
  regionId: number;
  region: string;
  total: number;
  newCases: number;
  active: number;
  recovered: number;
  deceased: number;
  confirmed: number;
  suspected: number;
  establishmentsCount: number;
  niveau: Niveau;
  diseases: RegionDisease[];
}

export interface EvolutionPoint {
  date: string;
  cases: number;
  active: number;
  recovered: number;
  deceased: number;
  confirmed: number;
  suspected: number;
}

export interface EstablishmentsSummary {
  total: number;
  active: number;
  withCases: number;
}

export interface ActiveAlert {
  id: number;
  maladie: string;
  zone: string;
  detectionDate: string;
  niveauRisque: string;
  statut: string;
  detectedCaseCount: number;
}

export interface SurveillanceData {
  meta: {
    from: string | null;
    to: string | null;
    generatedAt: string;
    globalLevel: Niveau;
  };
  kpis: SurveillanceKpis;
  diseases: DiseaseStat[];
  regions: SurveillanceRegion[];
  priorityZones: (SurveillanceRegion & { rank: number })[];
  evolution: EvolutionPoint[];
  establishments: EstablishmentsSummary;
  activeAlerts: ActiveAlert[];
  recentCases: import("@/types/case").CaseRecord[];
}

async function request<T>(path: string): Promise<T> {
  const response = await fetch(path);
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(
      typeof data?.message === "string"
        ? data.message
        : `Erreur serveur (${response.status})`,
    );
  }
  return data as T;
}

export interface SurveillanceQuery {
  from?: string;
  to?: string;
  maladieId?: number;
  regionId?: number;
  districtId?: number;
  centreId?: number;
}

export function fetchSurveillance(
  query: SurveillanceQuery = {},
): Promise<SurveillanceData> {
  const params = new URLSearchParams();
  if (query.from) params.set("from", query.from);
  if (query.to) params.set("to", query.to);
  if (query.maladieId) params.set("maladieId", String(query.maladieId));
  if (query.regionId) params.set("regionId", String(query.regionId));
  if (query.districtId) params.set("districtId", String(query.districtId));
  if (query.centreId) params.set("centreId", String(query.centreId));
  const qs = params.toString();
  return request<SurveillanceData>(`/api/dashboard/surveillance${qs ? `?${qs}` : ""}`);
}

export type PeriodKey = "today" | "7d" | "30d" | "90d" | "custom";

export interface PeriodDef {
  value: PeriodKey;
  label: string;
}

export const PERIODS: PeriodDef[] = [
  { value: "today", label: "Aujourd'hui" },
  { value: "7d", label: "7 derniers jours" },
  { value: "30d", label: "30 derniers jours" },
  { value: "90d", label: "3 derniers mois" },
  { value: "custom", label: "Personnalisé" },
];

export function periodRange(
  period: PeriodKey,
  customFrom?: string,
  customTo?: string,
): { from?: string; to?: string } {
  const to = new Date();
  if (period === "custom") {
    return {
      from: customFrom || undefined,
      to: customTo || undefined,
    };
  }
  if (period === "today") {
    const today = to.toISOString().slice(0, 10);
    return { from: today, to: today };
  }
  const from = new Date();
  if (period === "7d") from.setDate(to.getDate() - 7);
  else if (period === "30d") from.setDate(to.getDate() - 30);
  else if (period === "90d") from.setDate(to.getDate() - 90);
  return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
}