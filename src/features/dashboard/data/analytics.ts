export type KpiTone =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "info";

export interface KpiData {
  key: "incidence" | "letality" | "alerts" | "cases";
  title: string;
  value: string;
  unit: string;
  trend: number;
  hint: string;
  tone: KpiTone;
}

export const KPIS: KpiData[] = [
  {
    key: "incidence",
    title: "Taux d'incidence",
    value: "42,7",
    unit: "/ 100 000",
    trend: 4.1,
    hint: "vs mois dernier",
    tone: "info",
  },
  {
    key: "letality",
    title: "Taux de létalité",
    value: "1,8",
    unit: "%",
    trend: -0.3,
    hint: "vs mois dernier",
    tone: "danger",
  },
  {
    key: "alerts",
    title: "Alertes actives",
    value: "7",
    unit: "alertes",
    trend: 2,
    hint: "cette semaine",
    tone: "warning",
  },
  {
    key: "cases",
    title: "Cas déclarés",
    value: "1 284",
    unit: "cas",
    trend: 12.5,
    hint: "vs mois dernier",
    tone: "primary",
  },
];

export interface BarData {
  mois: string;
  confirmes: number;
  suspects: number;
  gueris: number;
  decedes?: number;
}

export const CASES_BY_MONTH: BarData[] = [
  { mois: "Jan", confirmes: 96, suspects: 24, gueris: 71, decedes: 3 },
  { mois: "Fév", confirmes: 104, suspects: 28, gueris: 82, decedes: 4 },
  { mois: "Mar", confirmes: 112, suspects: 31, gueris: 90, decedes: 5 },
  { mois: "Avr", confirmes: 98, suspects: 26, gueris: 77, decedes: 4 },
  { mois: "Mai", confirmes: 121, suspects: 34, gueris: 95, decedes: 5 },
  { mois: "Juin", confirmes: 118, suspects: 30, gueris: 88, decedes: 4 },
  { mois: "Juil", confirmes: 132, suspects: 36, gueris: 101, decedes: 6 },
  { mois: "Aoû", confirmes: 141, suspects: 39, gueris: 112, decedes: 7 },
  { mois: "Sep", confirmes: 128, suspects: 33, gueris: 98, decedes: 5 },
  { mois: "Oct", confirmes: 136, suspects: 35, gueris: 105, decedes: 6 },
  { mois: "Nov", confirmes: 145, suspects: 40, gueris: 114, decedes: 7 },
  { mois: "Déc", confirmes: 128, suspects: 32, gueris: 98, decedes: 5 },
];

const TREND_30D_SEED = [
  34, 37, 35, 40, 42, 39, 44, 46, 43, 48, 50, 47, 45, 49, 52, 50, 53, 55, 52,
  57, 59, 56, 60, 58, 61, 63, 60, 64, 62, 66,
];

export interface TrendPoint {
  jour: string;
  valeur: number;
}

export const CONFIRMED_TREND_30D: TrendPoint[] = TREND_30D_SEED.map(
  (valeur, index) => ({ jour: `${index + 1}`, valeur }),
);

export interface SliceData {
  nom: string;
  valeur: number;
  couleur: string;
}

export const CASES_BY_DISEASE: SliceData[] = [
  { nom: "Paludisme", valeur: 542, couleur: "#0ea5e9" },
  { nom: "Fièvre typhoïde", valeur: 262, couleur: "#8b5cf6" },
  { nom: "Choléra", valeur: 203, couleur: "#f59e0b" },
  { nom: "Rougeole", valeur: 156, couleur: "#ef4444" },
  { nom: "Dengue", valeur: 121, couleur: "#10b981" },
];

export const CASES_BY_STATUS: SliceData[] = [
  { nom: "Suspect", valeur: 312, couleur: "#d97706" },
  { nom: "Confirmé", valeur: 128, couleur: "#dc2626" },
  { nom: "Guéri", valeur: 342, couleur: "#16a34a" },
  { nom: "Décédé", valeur: 23, couleur: "#475569" },
];

export const REGIONS = [
  "Toutes",
  "Analamanga",
  "Atsinanana",
  "Vakinankaratra",
  "Boeny",
  "Diana",
  "Haute Matsiatra",
];

export const MALADIES = [
  "Toutes",
  "Paludisme",
  "Choléra",
  "Rougeole",
  "Dengue",
  "Fièvre typhoïde",
];