export type Severity = "Faible" | "Modéré" | "Élevé" | "Critique";

export interface CentreSanteMock {
  id: string;
  nom: string;
  type: string;
  lat: number;
  lng: number;
}

export interface FoyerEpidemique {
  id: string;
  nom: string;
  maladie: string;
  severity: Severity;
  nbCas: number;
  latlngs: [number, number][];
}

export interface LimiteAdministrative {
  id: string;
  nom: string;
  latlngs: [number, number][];
}

export interface PointChaleur {
  id: string;
  severity: Severity;
  lat: number;
  lng: number;
}

export const CENTRE_MADAGASCAR: [number, number] = [-18.8792, 47.5079];

export function severityColor(severity: Severity): string {
  switch (severity) {
    case "Faible":
      return "#16a34a";
    case "Modéré":
      return "#d97706";
    case "Élevé":
      return "#ea580c";
    case "Critique":
      return "#dc2626";
  }
}

export const MOCK_CENTRES: CentreSanteMock[] = [
  { id: "c1", nom: "CHU Joseph Ravoahangy", type: "CHU / Hôpital", lat: -18.8792, lng: 47.5079 },
  { id: "c2", nom: "CHU de Toamasina", type: "CHU / Hôpital", lat: -18.1443, lng: 49.3958 },
  { id: "c3", nom: "CHRR d'Antsiranana", type: "CHRR / Régional", lat: -12.2833, lng: 49.3 },
  { id: "c4", nom: "CHU de Mahajanga", type: "CHU / Hôpital", lat: -15.7167, lng: 46.3167 },
  { id: "c5", nom: "CHU de Fianarantsoa", type: "CHU / Hôpital", lat: -21.4527, lng: 47.0879 },
  { id: "c6", nom: "CSB II Morondava", type: "CSB / Base", lat: -20.2969, lng: 44.3177 },
  { id: "c7", nom: "CHRR de Sambava", type: "CHRR / Régional", lat: -14.2667, lng: 50.1667 },
  { id: "c8", nom: "CSB II Taolagnaro", type: "CSB / Base", lat: -25.0325, lng: 46.9833 },
];

export const MOCK_FOYERS: FoyerEpidemique[] = [
  {
    id: "f1",
    nom: "Foyer d'Antananarivo",
    maladie: "Choléra",
    severity: "Critique",
    nbCas: 48,
    latlngs: [
      [-19.02, 47.38],
      [-19.02, 47.66],
      [-18.74, 47.66],
      [-18.74, 47.38],
    ],
  },
  {
    id: "f2",
    nom: "Foyer de Toamasina",
    maladie: "Paludisme",
    severity: "Élevé",
    nbCas: 31,
    latlngs: [
      [-18.28, 49.25],
      [-18.28, 49.55],
      [-18.0, 49.55],
      [-18.0, 49.25],
    ],
  },
  {
    id: "f3",
    nom: "Foyer de Mahajanga",
    maladie: "Dengue",
    severity: "Modéré",
    nbCas: 19,
    latlngs: [
      [-15.86, 46.16],
      [-15.86, 46.47],
      [-15.57, 46.47],
      [-15.57, 46.16],
    ],
  },
  {
    id: "f4",
    nom: "Foyer de Fianarantsoa",
    maladie: "Rougeole",
    severity: "Faible",
    nbCas: 8,
    latlngs: [
      [-21.6, 46.93],
      [-21.6, 47.25],
      [-21.3, 47.25],
      [-21.3, 46.93],
    ],
  },
  {
    id: "f5",
    nom: "Foyer de Morondava",
    maladie: "Fièvre typhoïde",
    severity: "Modéré",
    nbCas: 12,
    latlngs: [
      [-20.44, 44.16],
      [-20.44, 44.48],
      [-20.16, 44.48],
      [-20.16, 44.16],
    ],
  },
];

export const MOCK_LIMITES: LimiteAdministrative[] = [
  {
    id: "l1",
    nom: "Analamanga",
    latlngs: [
      [-18.4, 47.2],
      [-18.4, 47.9],
      [-18.75, 48.0],
      [-19.2, 47.8],
      [-19.1, 47.2],
      [-18.6, 47.05],
    ],
  },
  {
    id: "l2",
    nom: "Atsinanana",
    latlngs: [
      [-17.5, 48.9],
      [-17.5, 49.6],
      [-18.3, 49.9],
      [-19.1, 49.6],
      [-18.9, 49.0],
      [-18.0, 48.7],
    ],
  },
  {
    id: "l3",
    nom: "Boeny",
    latlngs: [
      [-15.5, 46.2],
      [-15.5, 47.0],
      [-16.4, 47.2],
      [-17.0, 46.8],
      [-16.5, 46.1],
      [-15.8, 46.0],
    ],
  },
  {
    id: "l4",
    nom: "Haute Matsiatra",
    latlngs: [
      [-20.8, 46.7],
      [-20.8, 47.4],
      [-21.6, 47.6],
      [-22.1, 47.2],
      [-21.7, 46.6],
      [-21.0, 46.5],
    ],
  },
];

export const MOCK_HEAT_POINTS: PointChaleur[] = [
  { id: "h1", severity: "Critique", lat: -18.86, lng: 47.51 },
  { id: "h2", severity: "Critique", lat: -18.93, lng: 47.47 },
  { id: "h3", severity: "Élevé", lat: -18.81, lng: 47.58 },
  { id: "h4", severity: "Élevé", lat: -19.0, lng: 47.55 },
  { id: "h5", severity: "Modéré", lat: -18.15, lng: 49.4 },
  { id: "h6", severity: "Modéré", lat: -18.2, lng: 49.35 },
  { id: "h7", severity: "Faible", lat: -18.05, lng: 49.45 },
  { id: "h8", severity: "Élevé", lat: -15.72, lng: 46.32 },
  { id: "h9", severity: "Modéré", lat: -15.78, lng: 46.28 },
  { id: "h10", severity: "Faible", lat: -21.45, lng: 47.09 },
  { id: "h11", severity: "Faible", lat: -21.4, lng: 47.02 },
  { id: "h12", severity: "Modéré", lat: -20.3, lng: 44.32 },
  { id: "h13", severity: "Faible", lat: -12.28, lng: 49.3 },
  { id: "h14", severity: "Faible", lat: -25.03, lng: 46.98 },
];

export const SEVERITY_LEVELS: { label: Severity; color: string }[] = [
  { label: "Faible", color: severityColor("Faible") },
  { label: "Modéré", color: severityColor("Modéré") },
  { label: "Élevé", color: severityColor("Élevé") },
  { label: "Critique", color: severityColor("Critique") },
];