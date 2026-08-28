import { fetchReportOptions } from "@/features/reports/services/reports";
import type { SignalementOptions } from "@/features/cases/types";

export type NiveauEpidemiologique =
  | "Aucun"
  | "Faible"
  | "Modere"
  | "Eleve"
  | "Critique";

export type TypeEtablissement = "CSB1" | "CSB2" | "CHRD" | "CHRR" | "CHU";

export const TYPES_ETABLISSEMENT: TypeEtablissement[] = [
  "CSB1",
  "CSB2",
  "CHRD",
  "CHRR",
  "CHU",
];

export interface RegionMapData {
  regionId: number;
  region: string;
  total: number;
  newCases: number;
  active: number;
  confirmed: number;
  recovered: number;
  deceased: number;
  establishmentsCount: number;
  niveau: NiveauEpidemiologique;
  alerteLevel: string | null;
}

export interface EstablishmentMapData {
  id: number;
  name: string;
  type: string;
  region: string;
  district: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  isActive: boolean;
  cases: number;
  niveau: NiveauEpidemiologique;
}

export interface MapStats {
  regions: RegionMapData[];
  establishments: EstablishmentMapData[];
}

export interface MapQuery {
  maladieId?: number;
  regionId?: number;
  districtId?: number;
  centreId?: number;
  from?: string;
  to?: string;
  typeEtablissement?: string;
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

export function fetchMapStats(query: MapQuery): Promise<MapStats> {
  const params = new URLSearchParams();
  if (query.maladieId) params.set("maladieId", String(query.maladieId));
  if (query.regionId) params.set("regionId", String(query.regionId));
  if (query.districtId) params.set("districtId", String(query.districtId));
  if (query.centreId) params.set("centreId", String(query.centreId));
  if (query.from) params.set("from", query.from);
  if (query.to) params.set("to", query.to);
  if (query.typeEtablissement)
    params.set("typeEtablissement", query.typeEtablissement);
  const qs = params.toString();
  return request<MapStats>(`/api/carte/stats${qs ? `?${qs}` : ""}`);
}

export function fetchMapOptions(): Promise<SignalementOptions> {
  return fetchReportOptions();
}