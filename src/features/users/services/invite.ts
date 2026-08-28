import type { CentreSante, InviteResponse, Role, Zone } from "@/types/auth";
import type { RegionOption } from "@/features/settings/components/user-form-modal";
import { buildRegions } from "@/features/settings/utils";

export interface InvitePayload {
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  roleId: number;
  centreId?: number;
  regionId?: number;
  phoneNumber?: string;
}

export interface InviteOptions {
  roles: Role[];
  centres: CentreSante[];
  regions: RegionOption[];
}

export async function getInviteOptions(): Promise<InviteOptions> {
  try {
    const [roles, centres, zones] = await Promise.all([
      fetch("/api/users/roles").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/centres").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/zones").then((r) => (r.ok ? r.json() : [])),
    ]);

    return {
      roles: roles as Role[],
      centres: centres as CentreSante[],
      regions: buildRegions(zones as Zone[]),
    };
  } catch {
    return { roles: [], centres: [], regions: [] };
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