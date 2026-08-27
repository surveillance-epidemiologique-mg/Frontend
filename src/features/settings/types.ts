import type {
  CentreSante,
  InviteResponse,
  Role,
  User,
  Zone,
} from "@/types/auth";

export type { CentreSante, InviteResponse, Role, User, Zone };

export type CentreType = "CSB1" | "CSB2" | "CHRD" | "CHRR" | "CHU";

export const CENTRE_TYPES: CentreType[] = [
  "CSB1",
  "CSB2",
  "CHRD",
  "CHRR",
  "CHU",
];

export const INVITABLE_ROLE_NAMES = [
  "Responsable national",
  "Responsable régional",
  "Agent de santé",
  "Observateur",
] as const;

export interface Maladie {
  id: number;
  name: string;
  icd10Code: string | null;
  iconName: string | null;
  alertThreshold: number;
  description: string | null;
}

export interface UserFormValues {
  name: string;
  email: string;
  phoneNumber: string;
  roleId: number;
  centreId: number | null;
  isActive: boolean;
}

export interface MaladieFormValues {
  name: string;
  icd10Code: string;
  alertThreshold: number;
  description: string;
}

export interface CentreFormValues {
  name: string;
  type: CentreType;
  zoneId: number;
  latitude: number | null;
  longitude: number | null;
}
