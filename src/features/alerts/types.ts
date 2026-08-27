import type { User, Zone } from "@/types/auth";
import type { Maladie } from "@/features/settings/types";
import type { AlertNiveauRisque, AlertStatut } from "@/services/dashboard";

export type { AlertNiveauRisque, AlertStatut };

export type ActionHistorique =
  | "Creation"
  | "Detection"
  | "PriseEnCharge"
  | "Resolution"
  | "Reouverture"
  | "MiseAJour";

export interface AlerteHistorique {
  id: number;
  alerteId: number;
  action: ActionHistorique;
  detail: string | null;
  utilisateurId: number | null;
  date: string;
  utilisateur: User | null;
}

export interface RegleAlerte {
  id: number;
  name: string;
  description: string | null;
  maladieId: number | null;
  zoneId: number;
  periodDays: number;
  threshold: number;
  niveau: AlertNiveauRisque;
  active: boolean;
  maladie: Maladie | null;
  zone: Zone;
}

export interface Alerte {
  id: number;
  maladieId: number | null;
  zoneId: number;
  niveauRisque: AlertNiveauRisque;
  statut: AlertStatut;
  detectionDate: string;
  detectedCaseCount: number;
  commentaire: string | null;
  ruleId: number | null;
  createdById: number | null;
  assigneeId: number | null;
  resolvedById: number | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  maladie: Maladie | null;
  zone: Zone;
  regle: RegleAlerte | null;
  assignee: User | null;
  resolveur: User | null;
  createur: User | null;
  historique?: AlerteHistorique[];
}

export interface AlerteFreshness {
  lastDetectionAt: string | null;
  dataMaxDate: string | null;
  dataStale: boolean;
  detectionStale: boolean;
}

export interface AlerteListResponse {
  alerts: Alerte[];
  freshness: AlerteFreshness;
}

export interface AlertePayload {
  maladieId: number;
  zoneId: number;
  niveauRisque: AlertNiveauRisque;
  detectedCaseCount?: number;
  commentaire?: string;
}

export interface ReglePayload {
  name: string;
  description?: string;
  maladieId?: number;
  zoneId: number;
  periodDays?: number;
  threshold: number;
  niveau: AlertNiveauRisque;
  active?: boolean;
}

export interface AlerteOptions {
  maladies: Maladie[];
  regions: {
    id: number;
    name: string;
    districts: { id: number; name: string }[];
  }[];
}