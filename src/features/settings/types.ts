import type {
  CentreSante,
  InviteResponse,
  Role,
  User,
  Zone,
} from "@/types/auth";

export type { CentreSante, InviteResponse, Role, User, Zone };

export type CentreType = "CSB1" | "CSB2" | "CHRD" | "CHRR" | "CHU" | "CentreSante" | "PosteSante" | "Hopital";

export function centreTypeLabel(type: string): string {
  return ({ CentreSante: "Centre de santé (niveau non précisé)", PosteSante: "Poste de santé", Hopital: "Hôpital (niveau non précisé)" } as Record<string, string>)[type] ?? type;
}

export const CENTRE_TYPES: CentreType[] = [
  "CSB1",
  "CSB2",
  "CHRD",
  "CHRR",
  "CHU",
  "CentreSante",
  "PosteSante",
  "Hopital",
];

export const INVITABLE_ROLE_NAMES = [
  "Medecin",
  "Laboratoire",
] as const;

export interface Maladie {
  id: number;
  name: string;
  icd10Code: string | null;
  iconName: string | null;
  alertThresholdCentre: number;
  alertThresholdRegion: number;
  description: string | null;
}

export interface UserFormValues {
  name: string;
  email: string;
  phoneNumber: string;
  roleId: number;
  centreId: number | null;
  isActive: boolean;
  adminPassword?: string;
}

export interface MaladieFormValues {
  name: string;
  icd10Code: string;
  alertThresholdCentre: number;
  alertThresholdRegion: number;
  description: string;
}

export interface CentreFormValues {
  name: string;
  type: CentreType;
  zoneId: number;
  latitude: number | null;
  longitude: number | null;
}
