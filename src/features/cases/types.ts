import type { CentreSante, User, Zone } from "@/types/auth";
import type { Maladie } from "@/features/settings/types";

export type StatutSignalement =
  | "Brouillon"
  | "EnAttente"
  | "Valide"
  | "Rejete";

export interface Signalement {
  id: number;
  maladieId: number;
  regionId: number;
  districtId: number;
  centreId: number;
  dateSignalement: string;
  nbCasSuspects: number;
  nbCasConfirmes: number;
  nbDeces: number;
  nbGueris: number;
  statut: StatutSignalement;
  createdById: number;
  decidedById: number | null;
  decidedAt: string | null;
  createdAt: string;
  updatedAt: string;
  maladie: Maladie;
  region: Zone;
  district: Zone;
  centre: CentreSante;
  createur: User;
  decideur: User | null;
}

export interface SignalementPayload {
  maladieId: number;
  regionId: number;
  districtId: number;
  centreId: number;
  dateSignalement: string;
  nbCasSuspects: number;
  nbCasConfirmes: number;
  nbDeces: number;
  nbGueris: number;
}

export interface SignalementDistrict {
  id: number;
  name: string;
  centres: { id: number; name: string }[];
}

export interface SignalementRegion {
  id: number;
  name: string;
  districts: SignalementDistrict[];
}

export interface SignalementOptions {
  maladies: Maladie[];
  regions: SignalementRegion[];
}