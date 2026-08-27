import type { Zone } from "@/types/auth";
import type { Role } from "@/types/auth";

export interface JournalEntry {
  id: number;
  userId: number | null;
  action: string;
  resource: string;
  resourceId: number | null;
  detail: string | null;
  ip: string | null;
  date: string;
  utilisateur: { id: number; name: string; email: string } | null;
}

export interface SessionInfo {
  id: number;
  jti: string;
  userId: number;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
  expiresAt: string;
  current: boolean;
  utilisateur: { id: number; name: string; email: string };
}

export interface RolePermission {
  roleId: number;
  permissionId: number;
  permission: { id: number; code: string; description: string | null };
}

export interface RoleWithPermissions {
  id: number;
  name: string;
  permissions: RolePermission[];
}

export interface LoginAttemptInfo {
  id: number;
  email: string;
  ip: string | null;
  success: boolean;
  date: string;
}

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
        : `Erreur serveur (${response.status})`;
    throw new Error(message);
  }
  return data as T;
}

// ---- Journal ----
export function fetchJournal(params?: {
  action?: string;
  limit?: number;
}): Promise<JournalEntry[]> {
  const qs = new URLSearchParams();
  if (params?.action) qs.set("action", params.action);
  if (params?.limit) qs.set("limit", String(params.limit));
  const q = qs.toString();
  return request<JournalEntry[]>(`/api/admin/journal${q ? `?${q}` : ""}`);
}

// ---- Sessions ----
export function fetchSessions(): Promise<SessionInfo[]> {
  return request<SessionInfo[]>("/api/admin/sessions");
}

export function revokeSession(id: number): Promise<{ success: boolean }> {
  return request(`/api/admin/sessions/${id}/revoke`, { method: "PATCH" });
}

// ---- Tentatives ----
export function fetchLoginAttempts(limit = 50): Promise<LoginAttemptInfo[]> {
  return request<LoginAttemptInfo[]>(`/api/admin/tentatives?limit=${limit}`);
}

// ---- Rôles & permissions ----
export function fetchRolesWithPermissions(): Promise<RoleWithPermissions[]> {
  return request<RoleWithPermissions[]>("/api/admin/roles");
}

export function fetchPermissionCatalog(): Promise<
  { id: number; code: string; description: string | null }[]
> {
  return request("/api/admin/permissions");
}

export function updateRolePermissions(
  roleId: number,
  permissionCodes: string[],
): Promise<RoleWithPermissions> {
  return request(`/api/admin/roles/${roleId}/permissions`, {
    method: "PATCH",
    body: JSON.stringify({ permissionCodes }),
  });
}

// ---- Zones ----
export function fetchZonesAdmin(): Promise<Zone[]> {
  return request<Zone[]>("/api/zones");
}

export function createZone(payload: {
  name: string;
  type: string;
  pcode?: string;
  parentId?: number;
}): Promise<Zone> {
  return request<Zone>("/api/zones", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateZone(
  id: number,
  payload: Partial<{ name: string; type: string; pcode?: string; parentId?: number }>,
): Promise<Zone> {
  return request<Zone>(`/api/zones/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export type { Role };