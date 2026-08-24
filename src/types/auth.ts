export interface Role {
  id: number;
  name: string;
}

export interface Zone {
  id: number;
  name: string;
  type: string;
  codePcode: string | null;
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
  email: string;
  phoneNumber: string | null;
  temporaryPassword: boolean;
  isActive: boolean;
  roleId: number;
  centreId: number | null;
  createdAt: string;
  updatedAt: string;
  role: Role;
  centre: CentreSante | null;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface InviteResponse {
  user: User;
  temporaryPassword: string;
  activationLink: string;
}

export const ROLES = {
  ADMINISTRATEUR: "Administrateur",
  MEDECIN: "Medecin",
  LABORATOIRE: "Laboratoire",
} as const;

export type RoleName = (typeof ROLES)[keyof typeof ROLES];