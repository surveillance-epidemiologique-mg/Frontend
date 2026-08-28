export interface Role {
  id: number;
  name: string;
}

export interface Zone {
  id: number;
  name: string;
  type: string;
  codePcode: string | null;
  parentId?: number | null;
}

export interface CentreSante {
  id: number;
  name: string;
  type: string;
  zoneId: number;
  latitude?: number | null;
  longitude?: number | null;
  zone?: Zone;
}

export interface User {
  id: number;
  name: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  phoneNumber: string | null;
  temporaryPassword: boolean;
  isActive: boolean;
  roleId: number;
  centreId: number | null;
  regionId: number | null;
  createdAt: string;
  updatedAt: string;
  role: Role;
  centre: CentreSante | null;
  region?: Zone | null;
}

export interface AuthResponse {
  token: string;
  user: User;
  expiresIn?: number;
}

export interface InviteResponse {
  user: User;
  temporaryPassword: string;
  activationLink: string;
}

export const ROLES = {
  ADMINISTRATEUR: "Administrateur",
  RESPONSABLE_NATIONAL: "Responsable national",
  RESPONSABLE_REGIONAL: "Responsable régional",
  AGENT_SANTE: "Agent de santé",
  OBSERVATEUR: "Observateur",
} as const;

export type RoleName = (typeof ROLES)[keyof typeof ROLES];