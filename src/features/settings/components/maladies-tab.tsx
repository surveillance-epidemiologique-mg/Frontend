"use client";

import { useMemo, useState } from "react";
import { Activity, Edit, Plus, Search, SearchX, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { MaladieFormModal } from "@/features/settings/components/maladie-form-modal";
import type { Maladie, MaladieFormValues } from "@/features/settings/types";

interface MaladiesTabProps {
  maladies: Maladie[];
  loading: boolean;
  onAdd: (values: MaladieFormValues) => Promise<void>;
  onUpdate: (id: number, values: MaladieFormValues) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export function MaladiesTab({
  maladies,
  loading,
  onAdd,
  onUpdate,
  onDelete,
}: MaladiesTabProps) {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingDisease, setEditingDisease] = useState<Maladie | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Maladie | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filteredMaladies = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) {
      return maladies;
    }

    return maladies.filter(
      (disease) =>
        disease.name.toLowerCase().includes(q) ||
        (disease.icd10Code ?? "").toLowerCase().includes(q),
    );
  }, [maladies, search]);

  function openCreate() {
    setEditingDisease(null);
    setFormOpen(true);
  }

  function openEdit(disease: Maladie) {
    setEditingDisease(disease);
    setFormOpen(true);
  }

  async function handleSubmit(values: MaladieFormValues) {
    try {
      if (editingDisease) {
        await onUpdate(editingDisease.id, values);
        toast({
          title: "Maladie mise à jour",
          description: `${values.name} a été modifiée.`,
          variant: "success",
        });
      } else {
        await onAdd(values);
        toast({
          title: "Maladie ajoutée",
          description: `${values.name} a été ajoutée au dictionnaire.`,
          variant: "success",
        });
      }
      setFormOpen(false);
      setEditingDisease(null);
    } catch (error) {
      toast({
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : "Impossible d'enregistrer la maladie.",
        variant: "error",
      });
    }
  }

  async function handleDelete() {
    if (!deleteTarget) {
      return;
    }

    setDeleting(true);
    try {
      await onDelete(deleteTarget.id);
      toast({
        title: "Maladie supprimée",
        description: `${deleteTarget.name} a été retirée du dictionnaire.`,
        variant: "success",
      });
      setDeleteTarget(null);
    } catch (error) {
      toast({
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : "Impossible de supprimer la maladie.",
        variant: "error",
      });
    } finally {
      setDeleting(false);
    }
  }

  const columns: Column<Maladie>[] = [
    {
      key: "name",
      header: "Nom de la maladie",
      cell: (disease) => (
        <span className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary-light text-primary">
            <Activity className="size-4" />
          </span>
          <span className="font-medium text-text-main">{disease.name}</span>
        </span>
      ),
    },
    {
      key: "icd10",
      header: "Code CIM-10",
      cell: (disease) => (
        <span className="font-mono text-xs font-medium text-text-muted">
          {disease.icd10Code ?? "—"}
        </span>
      ),
    },
    {
      key: "seuil",
      header: "Seuil d'alerte",
      cell: (disease) => (
        <span className="inline-flex rounded-full bg-warning/10 px-2.5 py-0.5 text-xs font-medium text-warning ring-1 ring-inset ring-warning/25">
          {disease.alertThreshold}
        </span>
      ),
    },
    {
      key: "description",
      header: "Description / Protocole",
      className: "max-w-[22rem]",
      cell: (disease) => (
        <span
          className="block truncate text-text-muted"
          title={disease.description ?? undefined}
        >
          {disease.description ?? "—"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (disease) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openEdit(disease)}
            aria-label={`Modifier ${disease.name}`}
          >
            <Edit className="size-4" />
            Modifier
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-error hover:bg-error/10 hover:text-error"
            onClick={() => setDeleteTarget(disease)}
            aria-label={`Supprimer ${disease.name}`}
          >
            <Trash2 className="size-4" />
            Supprimer
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-text-main">
            Dictionnaire des maladies
          </h2>
          <p className="text-sm text-text-muted">
            {maladies.length} maladie{maladies.length > 1 ? "s" : ""}
            référencée{maladies.length > 1 ? "s" : ""}.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Ajouter une maladie
        </Button>
      </div>

      <Card className="p-4">
        <div className="max-w-md">
          <Input
            icon={Search}
            placeholder="Rechercher par nom ou code ICD-10..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Rechercher une maladie"
          />
        </div>
      </Card>

      <Card>
        <DataTable
          columns={columns}
          data={filteredMaladies}
          getRowId={(disease) => String(disease.id)}
          loading={loading}
          pageSize={10}
          ariaLabel="Dictionnaire des maladies"
          emptyState={
            <EmptyState
              icon={SearchX}
              title="Aucune maladie trouvée"
              description="Aucune maladie ne correspond à votre recherche."
            />
          }
        />
      </Card>

      <MaladieFormModal
        key={
          editingDisease ? `edit-${editingDisease.id}` : `create-${formOpen}`
        }
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingDisease(null);
        }}
        disease={editingDisease}
        onSubmit={handleSubmit}
      />

      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Supprimer la maladie"
        description="Cette action est irréversible."
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Annuler
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={deleting}>
              <Trash2 className="size-4" />
              {deleting ? "Suppression…" : "Supprimer"}
            </Button>
          </>
        }
      >
        <p className="text-sm text-text-muted">
          Voulez-vous vraiment supprimer{" "}
          <strong className="text-text-main">{deleteTarget?.name}</strong> du
          dictionnaire ?
        </p>
      </Modal>
    </div>
  );
}