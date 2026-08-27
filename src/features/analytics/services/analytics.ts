import type {
  AnalyticsOptions,
  AnalyticsQuery,
  AnalyticsSummary,
} from "@/features/analytics/types";

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

export function fetchAnalyticsOptions(): Promise<AnalyticsOptions> {
  return request<AnalyticsOptions>("/api/analytics/options");
}

export function fetchAnalyticsSummary(
  query: AnalyticsQuery,
): Promise<AnalyticsSummary> {
  const params = new URLSearchParams();
  if (query.maladieId) params.set("maladieId", String(query.maladieId));
  if (query.regionId) params.set("regionId", String(query.regionId));
  if (query.districtId) params.set("districtId", String(query.districtId));
  if (query.from) params.set("from", query.from);
  if (query.to) params.set("to", query.to);

  const qs = params.toString();
  return request<AnalyticsSummary>(`/api/analytics/summary${qs ? `?${qs}` : ""}`);
}