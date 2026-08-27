"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { UserPlus } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { UsersTab } from "@/features/settings/components/users-tab";
import {
  createUser,
  fetchCentres,
  fetchRoles,
  fetchUsers,
  setUserStatus,
  updateUser,
} from "@/features/settings/services/settings";
import type {
  CentreSante,
  Role,
  User,
  UserFormValues,
} from "@/features/settings/types";

export function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [centres, setCentres] = useState<CentreSante[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const [usersData, rolesData, centresData] = await Promise.all([
          fetchUsers(),
          fetchRoles(),
          fetchCentres(),
        ]);

        if (!active) {
          return;
        }

        setUsers(usersData);
        setRoles(rolesData);
        setCentres(centresData);
        setError(null);
      } catch (e) {
        if (active) {
          setError(
            e instanceof Error
              ? e.message
              : "Impossible de charger les utilisateurs.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [reloadKey]);

  async function handleAddUser(values: UserFormValues) {
    const created = await createUser(values);
    setUsers((prev) => [created.user, ...prev]);
  }

  async function handleUpdateUser(id: number, values: UserFormValues) {
    const updated = await updateUser(id, values);
    setUsers((prev) => prev.map((user) => (user.id === id ? updated : user)));
  }

  async function handleToggleUser(id: number, isActive: boolean) {
    const updated = await setUserStatus(id, isActive);
    setUsers((prev) => prev.map((user) => (user.id === id ? updated : user)));
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Utilisateurs"
        description="Gestion des comptes Médecins et Laboratoires."
      >
        <Button variant="secondary" asChild>
          <Link href="/invite">
            <UserPlus className="size-4" />
            Inviter un utilisateur
          </Link>
        </Button>
      </PageHeader>

      {error && !loading ? (
        <Alert variant="error">
          <span className="flex items-center justify-between gap-3">
            {error}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReloadKey((key) => key + 1)}
            >
              Réessayer
            </Button>
          </span>
        </Alert>
      ) : null}

      <UsersTab
        users={users}
        roles={roles}
        centres={centres}
        loading={loading}
        onAdd={handleAddUser}
        onUpdate={handleUpdateUser}
        onToggle={handleToggleUser}
      />
    </div>
  );
}