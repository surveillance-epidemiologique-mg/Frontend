"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import {
  fetchPermissionCatalog,
  fetchRolesWithPermissions,
  updateRolePermissions,
} from "@/features/settings/services/admin";
import type { RoleWithPermissions } from "@/features/settings/services/admin";
import { cn } from "@/lib/utils";

export function RolesTab() {
  const { toast } = useToast();
  const [roles, setRoles] = useState<RoleWithPermissions[]>([]);
  const [catalog, setCatalog] = useState<
    { id: number; code: string; description: string | null }[]
  >([]);
  const [draft, setDraft] = useState<Record<number, Set<string>>>({});
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [rolesData, catalogData] = await Promise.all([
          fetchRolesWithPermissions(),
          fetchPermissionCatalog(),
        ]);
        if (!active) return;
        setRoles(rolesData);
        setCatalog(catalogData);
        const initial: Record<number, Set<string>> = {};
        for (const role of rolesData) {
          initial[role.id] = new Set(
            role.permissions.map((p) => p.permission.code),
          );
        }
        setDraft(initial);
      } catch {
        // silence
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  function toggle(roleId: number, code: string) {
    setDraft((prev) => {
      const next = new Set(prev[roleId] ?? []);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return { ...prev, [roleId]: next };
    });
  }

  async function save(role: RoleWithPermissions) {
    setBusyId(role.id);
    try {
      const updated = await updateRolePermissions(
        role.id,
        Array.from(draft[role.id] ?? []),
      );
      setRoles((prev) =>
        prev.map((r) => (r.id === role.id ? { ...r, permissions: updated.permissions } : r)),
      );
      toast({
        title: "Permissions mises à jour",
        description: `Rôle « ${role.name} » enregistré.`,
        variant: "success",
      });
    } catch (e) {
      toast({
        title: "Erreur",
        description: e instanceof Error ? e.message : "Mise à jour impossible.",
        variant: "error",
      });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-text-main">
          Rôles et permissions
        </h2>
        <p className="text-sm text-text-muted">
          Les permissions sont vérifiées côté serveur à chaque requête.
        </p>
      </div>

      {roles.map((role) => (
        <Card key={role.id} className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-text-main">{role.name}</h3>
              <Badge variant="secondary">{role.permissions.length} permissions</Badge>
            </div>
            <Button size="sm" onClick={() => save(role)} loading={busyId === role.id}>
              Enregistrer
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {catalog.map((permission) => {
              const active = (draft[role.id] ?? new Set<string>()).has(
                permission.code,
              );
              return (
                <button
                  key={permission.code}
                  type="button"
                  onClick={() => toggle(role.id, permission.code)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    active
                      ? "border-primary bg-primary-light text-primary"
                      : "border-border bg-bg-app text-text-muted hover:border-primary/40",
                  )}
                >
                  {permission.code}
                </button>
              );
            })}
          </div>
        </Card>
      ))}
    </div>
  );
}