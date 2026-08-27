import type {
  Signalement,
  SignalementOptions,
  SignalementPayload,
} from "@/features/cases/types";

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

export function fetchSignalementOptions(): Promise<SignalementOptions> {
  return request<SignalementOptions>("/api/signalements/options");
}

export function fetchSignalements(): Promise<Signalement[]> {
  return request<Signalement[]>("/api/signalements");
}

export function createSignalement(
  payload: SignalementPayload,
): Promise<Signalement> {
  return request<Signalement>("/api/signalements", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateSignalement(
  id: number,
  payload: SignalementPayload,
): Promise<Signalement> {
  return request<Signalement>(`/api/signalements/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function submitSignalement(id: number): Promise<Signalement> {
  return request<Signalement>(`/api/signalements/${id}/submit`, {
    method: "PATCH",
  });
}

export function validateSignalement(id: number): Promise<Signalement> {
  return request<Signalement>(`/api/signalements/${id}/validate`, {
    method: "PATCH",
  });
}

export function rejectSignalement(id: number): Promise<Signalement> {
  return request<Signalement>(`/api/signalements/${id}/reject`, {
    method: "PATCH",
  });
}