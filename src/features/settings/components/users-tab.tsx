"use client";

import { useMemo, useState } from "react";
import {
  Edit,
  Plus,
  Search,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";
import { ActionMenu } from "@/components/ui/action-menu";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable, type Column } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import {
  UserFormModal,
} from "@/features/settings/components/user-form-modal";
import type {
  CentreSante,
  Role,
  User,
  UserFormValues,
} from "@/features/settings/types";
import { formatDate } from "@/lib/utils";

interface UsersTabProps {
  users: User[];
  roles: Role[];
  centres: CentreSante[];
  loading: boolean;
  onAdd: (values: UserFormValues) => Promise<void>;
  onUpdate: (id: number, values: UserFormValues) => Promise<void>;
  onToggle: (id: number, isActive: boolean) => Promise<void>;
}

const ROLE_FILTER_OPTIONS = ["Administrateur", "Medecin", "Laboratoire"];

export function UsersTab({
  users,
  roles,
  centres,
  loading,
  onAdd,
  onUpdate,
  onToggle,
}: UsersTabProps) {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [toggleTarget, setToggleTarget] = useState<{
    user: User;
    nextActive: boolean;
  } | null>(null);
  const [busy, setBusy] = useState(false);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !q ||
        user.name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q);
      const matchesRole = !roleFilter || user.role.name === roleFilter;
      const matchesStatus =
        !statusFilter ||
        (statusFilter === "active" && user.isActive) ||
        (statusFilter === "inactive" && !user.isActive);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  function openCreate() {
    setEditingUser(null);
    setFormOpen(true);
  }

  function openEdit(user: User) {
    setEditingUser(user);
    setFormOpen(true);
  }

  async function handleSubmit(values: UserFormValues) {
    setBusy(true);
    try {
      if (editingUser) {
        await onUpdate(editingUser.id, values);
        toast({
          title: "Utilisateur mis à jour",
          description: `${values.name} a été modifié avec succès.`,
          variant: "success",
        });
      } else {
        await onAdd(values);
        toast({
          title: "Utilisateur créé",
          description: `Le compte de ${values.name} a été créé.`,
          variant: "success",
        });
      }
      setFormOpen(false);
      setEditingUser(null);
    } catch (error) {
      toast({
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : "Impossible d'enregistrer l'utilisateur.",
        variant: "error",
      });
    } finally {
      setBusy(false);
    }
  }

  async function confirmToggle() {
    if (!toggleTarget) {
      return;
    }

    setBusy(true);
    try {
      await onToggle(toggleTarget.user.id, toggleTarget.nextActive);
      toast({
        title: toggleTarget.nextActive
          ? "Utilisateur activé"
          : "Utilisateur désactivé",
        description: `${toggleTarget.user.name} est maintenant ${
          toggleTarget.nextActive ? "actif" : "inactif"
        }.`,
        variant: toggleTarget.nextActive ? "success" : "warning",
      });
      setToggleTarget(null);
    } catch (error) {
      toast({
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : "Impossible de modifier le statut.",
        variant: "error",
      });
    } finally {
      setBusy(false);
    }
  }

  const columns: Column<User>[] = [
    {
      key: "user",
      header: "Utilisateur",
      cell: (row) => (
        <div className="flex items-center gap-3 py-0.5">
          <Avatar name={row.name} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-medium text-text-main leading-none">{row.name}</p>
            <p className="truncate text-xs text-text-muted mt-1">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Téléphone",
      cell: (row) => (
        <span className="text-sm text-text-muted">{row.phoneNumber || "—"}</span>
      ),
    },
    {
      key: "role",
      header: "Rôle",
      cell: (row) => <Badge variant="secondary">{row.role.name}</Badge>,
    },
    {
      key: "centre",
      header: "Centre de santé",
      cell: (row) => (
        <span className="text-sm text-text-muted">{row.centre?.name ?? "—"}</span>
      ),
    },
    {
      key: "status",
      header: "Statut",
      cell: (row) =>
        row.isActive ? (
          <Badge variant="success" dot>
            Actif
          </Badge>
        ) : (
          <Badge variant="danger" dot>
            Inactif
          </Badge>
        ),
    },
    {
      key: "createdAt",
      header: "Date de création",
      cell: (row) => (
        <span className="text-sm text-text-muted">{formatDate(row.createdAt)}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      cell: (row) => (
        <ActionMenu
          ariaLabel={`Actions pour ${row.name}`}
          items={[
            {
              label: "Modifier",
              icon: Edit,
              onClick: () => openEdit(row),
            },
            row.isActive
              ? {
                  label: "Désactiver",
                  icon: UserX,
                  danger: true,
                  onClick: () =>
                    setToggleTarget({ user: row, nextActive: false }),
                }
              : {
                  label: "Activer",
                  icon: UserCheck,
                  onClick: () =>
                    setToggleTarget({ user: row, nextActive: true }),
                },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6 pt-2">
      {/* En-tête de section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-border/60">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-text-main">
            Gestion des utilisateurs
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            {users.length} compte{users.length > 1 ? "s" : ""} enregistré
            {users.length > 1 ? "s" : ""}.
          </p>
        </div>
        <Button onClick={openCreate} className="shrink-0">
          <Plus className="size-4" />
          Créer un utilisateur
        </Button>
      </div>

      {/* Barre de filtres et recherche */}
      <Card className="p-3.5 border-border/60 bg-bg-app/30 backdrop-blur-xs">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex-1">
            <Input
              icon={Search}
              placeholder="Rechercher par nom ou e-mail..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Rechercher un utilisateur"
            />
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:flex sm:items-center">
            <Select
              aria-label="Filtrer par rôle"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              placeholder="Tous les rôles"
              options={ROLE_FILTER_OPTIONS.map((role) => ({
                value: role,
                label: role,
              }))}
              className="sm:w-44"
            />
            <Select
              aria-label="Filtrer par statut"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              placeholder="Tous les statuts"
              options={[
                { value: "active", label: "Actifs" },
                { value: "inactive", label: "Inactifs" },
              ]}
              className="sm:w-44"
            />
          </div>
        </div>
      </Card>

      {/* Tableau des données */}
      <Card className="border-border/60 overflow-hidden">
        <DataTable
          columns={columns}
          data={filteredUsers}
          getRowId={(row) => String(row.id)}
          loading={loading}
          ariaLabel="Liste des utilisateurs"
          emptyState={
            <EmptyState
              icon={Users}
              title="Aucun utilisateur trouvé"
              description="Aucun compte ne correspond à votre recherche."
            />
          }
        />
      </Card>

      {/* Modales */}
      <UserFormModal
        key={editingUser ? `edit-${editingUser.id}` : `create-${formOpen}`}
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingUser(null);
        }}
        user={editingUser}
        onSubmit={handleSubmit}
        roles={roles}
        centres={centres}
      />

      <ConfirmDialog
        open={Boolean(toggleTarget)}
        onClose={() => setToggleTarget(null)}
        onConfirm={confirmToggle}
        loading={busy}
        title={
          toggleTarget?.nextActive
            ? "Activer l'utilisateur"
            : "Désactiver l'utilisateur"
        }
        description={
          toggleTarget
            ? `Confirmer la ${
                toggleTarget.nextActive ? "réactivation" : "désactivation"
              } du compte de ${toggleTarget.user.name} ?`
            : ""
        }
        confirmLabel={toggleTarget?.nextActive ? "Activer" : "Désactiver"}
        tone={toggleTarget?.nextActive ? "primary" : "danger"}
      />
    </div>
  );
}