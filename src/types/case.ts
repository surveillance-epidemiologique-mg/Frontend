export type CaseStatus =
  | "SUSPECT"
  | "CONFIRMED"
  | "RECOVERED"
  | "DECEASED";

export interface CaseRecord {
  id: string;
  code: string;
  patient: string;
  zone: string;
  status: CaseStatus;
  reportedAt: string;
}
