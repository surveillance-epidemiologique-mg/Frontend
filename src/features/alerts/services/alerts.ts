import type {
  Alerte,
  AlerteListResponse,
  AlerteOptions,
  AlertePayload,
  RegleAlerte,
  ReglePayload,
} from "@/features/alerts/types";

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
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
        : Array.isArray(data?.message)
          ? data.message
              .map((m: unknown) =>
                typeof m === "object" &&
                m !== null &&
                "constraints" in m &&
                (m as Record<string, unknown>).constraints &&
                typeof (m as Record<string, unknown>).constraints === "object"
                  ? Object.values(
                      (m as Record<string, unknown>).constraints as Record<
                        string,
                        unknown
                      >,
                    ).join(", ")
                  : String(m),
              )
              .join(", ")
          : `Erreur serveur (${response.status})`;

    throw new Error(message);
  }

  return data as T;
}

export function fetchAlertOptions(): Promise<AlerteOptions> {
  return request<AlerteOptions>("/api/alertes/options");
}

export function fetchAlertes(params?: {
  statut?: string;
  niveau?: string;
  maladieId?: number;
  zoneId?: number;
}): Promise<AlerteListResponse> {
  const query = new URLSearchParams();
  if (params?.statut) query.set("statut", params.statut);
  if (params?.niveau) query.set("niveau", params.niveau);
  if (params?.maladieId) query.set("maladieId", String(params.maladieId));
  if (params?.zoneId) query.set("zoneId", String(params.zoneId));
  const qs = query.toString();
  return request<AlerteListResponse>(
    `/api/alertes${qs ? `?${qs}` : ""}`,
  );
}

export function fetchNotifications(): Promise<Alerte[]> {
  return request<Alerte[]>("/api/alertes/notifications");
}

export function fetchAlerte(id: number): Promise<Alerte> {
  return request<Alerte>(`/api/alertes/${id}`);
}

export function createAlerte(payload: AlertePayload): Promise<Alerte> {
  return request<Alerte>("/api/alertes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function takeChargeAlerte(id: number): Promise<Alerte> {
  return request<Alerte>(`/api/alertes/${id}/prise-en-charge`, {
    method: "PATCH",
  });
}

export function resolveAlerte(id: number): Promise<Alerte> {
  return request<Alerte>(`/api/alertes/${id}/resolution`, {
    method: "PATCH",
  });
}

export function detectAlertes(): Promise<{
  created: number;
  reopened: number;
  updated: number;
  resolved: number;
  casesCount: number;
  lastDetectionAt: string;
}> {
  return request("/api/alertes/detect", { method: "POST" });
}

// ---- Règles ----
export function fetchRules(): Promise<RegleAlerte[]> {
  return request<RegleAlerte[]>("/api/regles-alerte");
}

export function createRule(payload: ReglePayload): Promise<RegleAlerte> {
  return request<RegleAlerte>("/api/regles-alerte", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateRule(
  id: number,
  payload: Partial<ReglePayload>,
): Promise<RegleAlerte> {
  return request<RegleAlerte>(`/api/regles-alerte/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteRule(id: number): Promise<{ success: boolean }> {
  return request(`/api/regles-alerte/${id}`, { method: "DELETE" });
}