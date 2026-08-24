import type { CentreSante, InviteResponse, Role } from "@/types/auth";

export interface InvitePayload {
  name: string;
  email: string;
  roleId: number;
  centreId?: number;
  phoneNumber?: string;
}

export interface InviteOptions {
  roles: Role[];
  centres: CentreSante[];
}

export async function getInviteOptions(): Promise<InviteOptions> {
  try {
    const [roles, centres] = await Promise.all([
      fetch("/api/users/roles").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/users/centres").then((r) => (r.ok ? r.json() : [])),
    ]);

    return { roles: roles as Role[], centres: centres as CentreSante[] };
  } catch {
    return { roles: [], centres: [] };
  }
}

export async function inviteUser(
  payload: InvitePayload,
): Promise<InviteResponse> {
  const response = await fetch("/api/users/invite", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      typeof data?.message === "string"
        ? data.message
        : "Impossible d'envoyer l'invitation.",
    );
  }

  return data as InviteResponse;
}