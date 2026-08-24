"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  Edit,
  Plus,
  Search,
  SearchX,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import {
  MaladieFormModal,
} from "@/features/settings/components/maladie-form-modal";
import type { Maladie, MaladieFormValues } from "@/features/settings/types";

interface MaladiesTabProps {
  maladies: Maladie[];
  loading: boolean;
  onAdd: (values: MaladieFormValues) => Promise<void>;
  onUpdate: (id: number, values: MaladieFormValues) => Promise<void>;
}

export function MaladiesTab({
  maladies,
  loading,
  onAdd,
  onUpdate,
}: MaladiesTabProps) {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingDisease, setEditingDisease] = useState<Maladie | null>(null);

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

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="p-5">
            <Skeleton className="size-11 rounded-xl" />
            <Skeleton className="mt-4 h-5 w-2/3" />
            <Skeleton className="mt-2 h-4 w-1/3" />
            <Skeleton className="mt-4 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-5/6" />
            <div className="mt-4 flex justify-between border-t border-border pt-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-8" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

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

      {filteredMaladies.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="Aucune maladie trouvée"
          description="Aucune maladie ne correspond à votre recherche."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredMaladies.map((disease) => (
            <Card
              key={disease.id}
              className="group flex flex-col p-5 transition-all duration-200 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-light text-primary">
                  <Activity className="size-5" />
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEdit(disease)}
                  aria-label={`Modifier ${disease.name}`}
                >
                  <Edit className="size-4" />
                  Modifier
                </Button>
              </div>

              <h3 className="mt-4 text-base font-semibold text-text-main">
                {disease.name}
              </h3>
              <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-text-muted">
                ICD-10 · {disease.icd10Code ?? "—"}
              </p>

              <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-text-muted">
                {disease.description}
              </p>

              <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                <span className="text-xs text-text-muted">
                  Seuil d&apos;alerte
                </span>
                <Badge variant="warning">{disease.alertThreshold}</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

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
    </div>
  );
}