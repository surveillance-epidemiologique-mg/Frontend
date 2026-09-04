import type {
  CentreSante,
  InviteResponse,
  Maladie,
  Role,
  User,
  Zone,
} from "@/features/settings/types";
import type {
  CentreFormValues,
  MaladieFormValues,
  UserFormValues,
} from "@/features/settings/types";

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

// ---- Utilisateurs ----
export function fetchUsers(): Promise<User[]> {
  return request<User[]>("/api/users");
}

export function fetchRoles(): Promise<Role[]> {
  return request<Role[]>("/api/users/roles");
}

export function fetchCentres(): Promise<CentreSante[]> {
  return request<CentreSante[]>("/api/centres");
}

export function createUser(values: UserFormValues): Promise<InviteResponse> {
  return request<InviteResponse>("/api/users/invite", {
    method: "POST",
    body: JSON.stringify({
      name: values.name,
      email: values.email,
      roleId: values.roleId,
      centreId: values.centreId ?? undefined,
      phoneNumber: values.phoneNumber || undefined,
    }),
  });
}

export function updateUser(
  id: number,
  values: UserFormValues,
): Promise<User> {
  return request<User>(`/api/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify({
      name: values.name,
      phoneNumber: values.phoneNumber || undefined,
      roleId: values.roleId,
      centreId: values.centreId,
      isActive: values.isActive,
    }),
  });
}

export function setUserStatus(id: number, isActive: boolean): Promise<User> {
  return request<User>(`/api/users/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ isActive }),
  });
}

// ---- Maladies ----
export function fetchMaladies(): Promise<Maladie[]> {
  return request<Maladie[]>("/api/maladies");
}

export function createMaladie(
  values: MaladieFormValues,
): Promise<Maladie> {
  return request<Maladie>("/api/maladies", {
    method: "POST",
    body: JSON.stringify(values),
  });
}

export function updateMaladie(
  id: number,
  values: MaladieFormValues,
): Promise<Maladie> {
  return request<Maladie>(`/api/maladies/${id}`, {
    method: "PATCH",
    body: JSON.stringify(values),
  });
}

export function deleteMaladie(id: number): Promise<void> {
  return request<void>(`/api/maladies/${id}`, {
    method: "DELETE",
  });
}

// ---- Centres ----
export function fetchZones(): Promise<Zone[]> {
  return request<Zone[]>("/api/centres/zones");
}

export function createCentre(values: CentreFormValues): Promise<CentreSante> {
  return request<CentreSante>("/api/centres", {
    method: "POST",
    body: JSON.stringify({
      name: values.name,
      type: values.type,
      zoneId: values.zoneId,
      latitude: values.latitude ?? undefined,
      longitude: values.longitude ?? undefined,
    }),
  });
}

export function updateCentre(
  id: number,
  values: CentreFormValues,
): Promise<CentreSante> {
  return request<CentreSante>(`/api/centres/${id}`, {
    method: "PATCH",
    body: JSON.stringify({
      name: values.name,
      type: values.type,
      zoneId: values.zoneId,
      latitude: values.latitude ?? undefined,
      longitude: values.longitude ?? undefined,
    }),
  });
}
