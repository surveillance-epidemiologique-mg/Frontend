"use client";

import { useMemo, useState } from "react";
import { Edit, Plus, RotateCw, Search, UserCheck, UserX, Users } from "lucide-react";
import { ActionMenu } from "@/components/action-menu/component";
import { Avatar } from "@/components/avatar/component";
import { Badge } from "@/components/badge/component";
import { Button } from "@/components/button/component";
import { Card } from "@/components/card/component";
import { ConfirmDialog } from "@/components/confirm-dialog/component";
import { DataTable, type Column } from "@/components/data-table/component";
import { EmptyState } from "@/components/empty-state/component";
import { Input } from "@/components/input/component";
import { Select } from "@/components/select/component";
import { useToast } from "@/components/toast/component";
import { UserFormModal } from "@/features/users/components/UserFormModal/UserFormModal";
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
  onAdd: (values: UserFormValues) => Promise<{
    user: User;
    temporaryPassword: string;
    activationLink: string;
  }>;
  onUpdate: (id: number, values: UserFormValues) => Promise<void>;
  onToggle: (id: number, isActive: boolean) => Promise<void>;
  onResendInvitation: (id: number) => Promise<void>;
}

const ROLE_FILTER_OPTIONS = [
  "Administrateur",
  "Medecin",
  "Laboratoire",
];

export function UsersTab({
  users,
  roles,
  centres,
  loading,
  onAdd,
  onUpdate,
  onToggle,
  onResendInvitation,
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
  const [resendingUserId, setResendingUserId] = useState<number | null>(null);

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
        const created = await onAdd(values);
        toast({
          title: "Utilisateur créé avec succès",
          description:
            `Le compte de ${created.user.name} est prêt pour sa première connexion. ` +
            `Transmettez-lui le lien d'activation : ${created.activationLink}. ` +
            "Le lien expire sous 7 jours ; le mot de passe est défini par l'utilisateur lors de l'activation.",
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

  async function handleResendInvitation(user: User) {
    if (resendingUserId !== null) return;
    setResendingUserId(user.id);
    try {
      await onResendInvitation(user.id);
      toast({
        title: "Invitation renvoyée",
        description: `Un nouveau lien valable 7 jours a été envoyé à ${user.email}. L'ancien lien ne fonctionne plus.`,
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Envoi impossible",
        description:
          error instanceof Error ? error.message : "Impossible de renvoyer l'invitation.",
        variant: "error",
      });
    } finally {
      setResendingUserId(null);
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
            <p className="truncate font-medium text-text-main leading-none">
              {row.name}
            </p>
            <p className="mt-1 truncate text-xs text-text-muted">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Téléphone",
      cell: (row) => (
        <span className="text-sm text-text-muted">
          {row.phoneNumber || "—"}
        </span>
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
        <span className="text-sm text-text-muted">
          {row.centre?.name ?? "—"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Statut",
      cell: (row) =>
        !row.isActive ? (
          <Badge variant="danger" dot>
            Désactivé
          </Badge>
        ) : row.temporaryPassword ? (
          row.invitationExpiresAt && new Date(row.invitationExpiresAt).getTime() <= Date.now() ? (
            <Badge variant="danger" dot>Invitation expirée</Badge>
          ) : (
            <Badge variant="warning" dot>Invitation en attente</Badge>
          )
        ) : (
          <Badge variant="success" dot>
            Actif
          </Badge>
        ),
    },
    {
      key: "createdAt",
      header: "Date de création",
      cell: (row) => (
        <span className="text-sm text-text-muted">
          {formatDate(row.createdAt)}
        </span>
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
            ...(row.temporaryPassword && row.isActive
              ? [{
                  label: resendingUserId === row.id ? "Envoi en cours…" : "Renvoyer l'invitation",
                  icon: RotateCw,
                  onClick: () => void handleResendInvitation(row),
                }]
              : []),
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
    <div className="space-y-5">
      <Card className="overflow-hidden rounded-3xl border border-border/70 bg-bg-surface shadow-card">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-light text-primary" aria-hidden="true">
              <Users className="size-5" strokeWidth={1.8} />
            </span>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-text-main">
                Gestion des utilisateurs
              </h2>
              <p className="mt-1 text-sm text-text-muted">
                {loading
                  ? "Chargement des comptes…"
                  : `${users.length} compte${users.length > 1 ? "s" : ""} enregistré${users.length > 1 ? "s" : ""}.`}
              </p>
            </div>
          </div>
          <Button onClick={openCreate} className="w-full sm:w-auto">
            <Plus className="size-4" />
            Créer un utilisateur
          </Button>
        </div>

        <div className="border-t border-border/60 bg-primary-light/10 p-4 sm:p-5">
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
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:flex lg:items-center">
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
        </div>
      </Card>

      <Card className="overflow-hidden rounded-3xl border border-border/70 bg-bg-surface shadow-card">
        <DataTable
          columns={columns}
          data={filteredUsers}
          getRowId={(row) => String(row.id)}
          loading={loading}
          ariaLabel="Liste des utilisateurs"
          emptyState={
            <EmptyState
              icon={Users}
              imageSrc="/images/nothing.svg"
              imageAlt="Aucun utilisateur"
              title="Aucun utilisateur trouvé"
              description="Aucun compte ne correspond à votre recherche."
            />
          }
        />
      </Card>

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
        loading={busy}
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
