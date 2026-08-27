import type { SignalementOptions } from "@/features/cases/types";

export type ReportType =
  | "daily"
  | "weekly"
  | "monthly"
  | "disease"
  | "region"
  | "custom";

export interface ReportQuery {
  type: ReportType;
  from?: string;
  to?: string;
  maladieId?: number;
  regionId?: number;
  districtId?: number;
}

export interface ReportTotals {
  total: number;
  confirmed: number;
  suspect: number;
  active: number;
  recovered: number;
  deceased: number;
  lethalityRate: number;
  recoveryRate: number;
}

export interface ReportDataset {
  meta: {
    type: ReportType;
    from: string | null;
    to: string | null;
    maladieId: number | null;
    regionId: number | null;
    districtId: number | null;
    generatedAt: string;
  };
  totals: ReportTotals;
  byDisease: {
    maladie: string;
    total: number;
    confirmed: number;
    suspect: number;
    active: number;
    recovered: number;
    deceased: number;
  }[];
  byRegion: {
    region: string;
    total: number;
    active: number;
    recovered: number;
    deceased: number;
  }[];
  evolution: { date: string; count: number }[];
  signalements: {
    total: number;
    enAttente: number;
    valides: number;
    rejetes: number;
    brouillons: number;
  };
}

export interface ImportResult {
  imported: number;
  skipped: number;
  errors: { row: number; reason: string }[];
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const response = await fetch(path, { ...options, headers });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      typeof data?.message === "string"
        ? data.message
        : `Erreur serveur (${response.status})`;
    throw new Error(message);
  }
  return data as T;
}

function buildQuery(query: ReportQuery): URLSearchParams {
  const params = new URLSearchParams();
  params.set("type", query.type);
  if (query.from) params.set("from", query.from);
  if (query.to) params.set("to", query.to);
  if (query.maladieId) params.set("maladieId", String(query.maladieId));
  if (query.regionId) params.set("regionId", String(query.regionId));
  if (query.districtId) params.set("districtId", String(query.districtId));
  return params;
}

export function fetchReport(query: ReportQuery): Promise<ReportDataset> {
  return request<ReportDataset>(`/api/reports?${buildQuery(query).toString()}`);
}

export function reportExportUrl(query: ReportQuery, format: "csv" | "pdf"): string {
  const params = buildQuery(query);
  params.set("format", format);
  return `/api/reports?${params.toString()}`;
}

export function fetchReportOptions(): Promise<SignalementOptions> {
  return request<SignalementOptions>("/api/signalements/options");
}

export async function importCsvFile(file: File): Promise<ImportResult> {
  const form = new FormData();
  form.append("file", file);
  const response = await fetch("/api/reports/import/csv", {
    method: "POST",
    body: form,
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(
      typeof data?.message === "string" ? data.message : "Import CSV impossible.",
    );
  }
  return data as ImportResult;
}

export async function importJsonRows(
  rows: Array<Record<string, unknown>>,
): Promise<ImportResult> {
  return request<ImportResult>("/api/reports/import", {
    method: "POST",
    body: JSON.stringify({ rows }),
  });
}