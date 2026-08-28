"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  Globe,
  Pill,
  RefreshCw,
  ScrollText,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs } from "@/components/ui/tabs";
import { CentresTab } from "@/features/settings/components/centres-tab";
import { MaladiesTab } from "@/features/settings/components/maladies-tab";
import { UsersTab } from "@/features/settings/components/users-tab";
import { ZonesTab } from "@/features/settings/components/zones-tab";
import { RolesTab } from "@/features/settings/components/roles-tab";
import { JournalTab } from "@/features/settings/components/journal-tab";
import { SessionsTab } from "@/features/settings/components/sessions-tab";
import {
  createCentre,
  createMaladie,
  createUser,
  deleteUser,
  fetchCentres,
  fetchMaladies,
  fetchRoles,
  fetchUsers,
  fetchZones,
  resendInvitation,
  setUserStatus,
  updateCentre,
  updateMaladie,
  updateUser,
} from "@/features/settings/services/settings";
import type {
  CentreFormValues,
  CentreSante,
  Maladie,
  MaladieFormValues,
  Role,
  User,
  UserFormValues,
  Zone,
} from "@/features/settings/types";
import { buildRegions } from "@/features/settings/utils";

type TabValue =
  | "users"
  | "maladies"
  | "centres"
  | "zones"
  | "roles"
  | "journal"
  | "sessions";

const TABS: { value: TabValue; label: string; icon: typeof Users }[] = [
  { value: "users", label: "Utilisateurs", icon: Users },
  { value: "maladies", label: "Maladies", icon: Pill },
  { value: "centres", label: "Établissements", icon: Building2 },
  { value: "zones", label: "Zones", icon: Globe },
  { value: "roles", label: "Rôles & permissions", icon: ShieldCheck },
  { value: "journal", label: "Journal", icon: ScrollText },
  { value: "sessions", label: "Sessions", icon: ShieldCheck },
];

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabValue>("users");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [maladies, setMaladies] = useState<Maladie[]>([]);
  const [centres, setCentres] = useState<CentreSante[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const [usersData, rolesData, maladiesData, centresData, zonesData] =
          await Promise.all([
            fetchUsers(),
            fetchRoles(),
            fetchMaladies(),
            fetchCentres(),
            fetchZones(),
          ]);

        if (!active) {
          return;
        }

        setUsers(usersData);
        setRoles(rolesData);
        setMaladies(maladiesData);
        setCentres(centresData);
        setZones(zonesData);
        setError(null);
      } catch (e) {
        if (active) {
          setError(
            e instanceof Error
              ? e.message
              : "Impossible de charger les données.",
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

  function retry() {
    setError(null);
    setLoading(true);
    setReloadKey((key) => key + 1);
  }

  // ---- Utilisateurs ----
  async function handleAddUser(values: UserFormValues) {
    const created = await createUser(values);
    setUsers((prev) => [created.user, ...prev]);
    return created;
  }

  async function handleUpdateUser(id: number, values: UserFormValues) {
    const updated = await updateUser(id, values);
    setUsers((prev) => prev.map((user) => (user.id === id ? updated : user)));
  }

  async function handleToggleUser(id: number, isActive: boolean) {
    const updated = await setUserStatus(id, isActive);
    setUsers((prev) => prev.map((user) => (user.id === id ? updated : user)));
  }

  async function handleDeleteUser(id: number) {
    await deleteUser(id);
    setUsers((prev) => prev.filter((user) => user.id !== id));
  }

  async function handleResendInvitation(id: number) {
    await resendInvitation(id);
  }

  // ---- Maladies ----
  async function handleAddMaladie(values: MaladieFormValues) {
    const created = await createMaladie(values);
    setMaladies((prev) => [created, ...prev]);
  }

  async function handleUpdateMaladie(id: number, values: MaladieFormValues) {
    const updated = await updateMaladie(id, values);
    setMaladies((prev) =>
      prev.map((disease) => (disease.id === id ? updated : disease)),
    );
  }

  // ---- Centres ----
  async function handleAddCentre(values: CentreFormValues) {
    const created = await createCentre(values);
    setCentres((prev) => [created, ...prev]);
  }

  async function handleUpdateCentre(id: number, values: CentreFormValues) {
    const updated = await updateCentre(id, values);
    setCentres((prev) =>
      prev.map((centre) => (centre.id === id ? updated : centre)),
    );
  }

  return (
    <div className="space-y-10">
      <PageHeader
        title="Paramètres"
        description="Administration de la plateforme : comptes, maladies et établissements sanitaires."
      />

      <Tabs
        tabs={TABS}
        value={activeTab}
        onChange={(value) => setActiveTab(value as TabValue)}
      />

      {error && !loading ? (
        <Alert variant="error">
          <span className="flex items-center justify-between gap-3">
            {error}
            <Button variant="ghost" size="sm" onClick={retry}>
              <RefreshCw className="size-4" />
              Réessayer
            </Button>
          </span>
        </Alert>
      ) : null}

      {activeTab === "users" ? (
        <UsersTab
          users={users}
          roles={roles}
          centres={centres}
          regions={buildRegions(zones)}
          loading={loading}
          onAdd={handleAddUser}
          onUpdate={handleUpdateUser}
          onToggle={handleToggleUser}
          onDelete={handleDeleteUser}
          onResendInvitation={handleResendInvitation}
        />
      ) : null}

      {activeTab === "maladies" ? (
        <MaladiesTab
          maladies={maladies}
          loading={loading}
          onAdd={handleAddMaladie}
          onUpdate={handleUpdateMaladie}
        />
      ) : null}

      {activeTab === "centres" ? (
        <CentresTab
          centres={centres}
          zones={zones}
          loading={loading}
          onAdd={handleAddCentre}
          onUpdate={handleUpdateCentre}
        />
      ) : null}

      {activeTab === "zones" ? <ZonesTab /> : null}
      {activeTab === "roles" ? <RolesTab /> : null}
      {activeTab === "journal" ? <JournalTab /> : null}
      {activeTab === "sessions" ? <SessionsTab /> : null}
    </div>
  );
}