import type { NiveauEpidemiologique } from "@/features/map/services/map";

export const NIVEAU_COLORS: Record<NiveauEpidemiologique, string> = {
  Aucun: "#94a3b8", // gris
  Faible: "#22c55e", // vert
  Modere: "#f59e0b", // orange
  Eleve: "#ef4444", // rouge
  Critique: "#7f1d1d", // rouge foncé
};

export const NIVEAUX: NiveauEpidemiologique[] = [
  "Aucun",
  "Faible",
  "Modere",
  "Eleve",
  "Critique",
];

export const ETABLISSEMENT_COLORS: Record<string, string> = {
  CSB1: "#14b8a6", // sarcelle
  CSB2: "#0ea5e9", // ciel
  CHRD: "#f97316", // orange
  CHRR: "#8b5cf6", // violet
  CHU: "#ef4444", // rouge
  Autres: "#64748b",
};

export const ETABLISSEMENT_LABELS: Record<string, string> = {
  CSB1: "CSB I",
  CSB2: "CSB II",
  CHRD: "CHRD",
  CHRR: "CHRR",
  CHU: "CHU",
};