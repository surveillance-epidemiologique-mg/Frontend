export interface PendingCase {
  id: number;
  patient: {
    anonymousCode: string;
    namePatient: string | null;
    age: number | null;
    gender: string | null;
  };
  maladie: { name: string };
  centre: { name: string; zone: { name: string } | null };
  agent: { name: string };
  diagnosisDate: string;
  symptoms: string | null;
  diagnosticStatus: string;
}

export const TEST_TYPES = [
  "PCR",
  "Test rapide",
  "Sérologie",
  "Culture",
  "Autre",
] as const;

export type TestType = (typeof TEST_TYPES)[number];

export interface LabResultPayload {
  labResult: string;
  testType: string;
  diagnosticStatus: "Confirme" | "Invalide";
}