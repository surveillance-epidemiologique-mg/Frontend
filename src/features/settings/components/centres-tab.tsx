"use client";

import { useMemo, useState } from "react";
import {
  Building2,
  Edit,
  MapPin,
  Plus,
  Search,
} from "lucide-react";
import { ActionMenu } from "@/components/ui/action-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import {
  CentreFormModal,
} from "@/features/settings/components/centre-form-modal";
import {
  CENTRE_TYPES,
  type CentreFormValues,
  type CentreSante,
  type Zone,
} from "@/features/settings/types";

interface CentresTabProps {
  centres: CentreSante[];
  zones: Zone[];
  loading: boolean;
  onAdd: (values: CentreFormValues) => Promise<void>;
  onUpdate: (id: number, values: CentreFormValues) => Promise<void>;
}

export function CentresTab({
  centres,
  zones,
  loading,
  onAdd,
  onUpdate,
}: CentresTabProps) {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [zoneFilter, setZoneFilter] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingCentre, setEditingCentre] = useState<CentreSante | null>(null);

  const zoneOptions = useMemo(() => {
    const names = new Set<string>(
      centres.map((centre) => centre.zone?.name ?? "").filter(Boolean),
    );
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [centres]);

  const filteredCentres = useMemo(() => {
    const q = search.trim().toLowerCase();

    return centres.filter((centre) => {
      const matchesSearch = !q || centre.name.toLowerCase().includes(q);
      const matchesType = !typeFilter || centre.type === typeFilter;
      const matchesZone =
        !zoneFilter || centre.zone?.name === zoneFilter;

      return matchesSearch && matchesType && matchesZone;
    });
  }, [centres, search, typeFilter, zoneFilter]);

  function openCreate() {
    setEditingCentre(null);
    setFormOpen(true);
  }

  function openEdit(centre: CentreSante) {
    setEditingCentre(centre);
    setFormOpen(true);
  }

  async function handleSubmit(values: CentreFormValues) {
    try {
      if (editingCentre) {
        await onUpdate(editingCentre.id, values);
        toast({
          title: "Centre mis à jour",
          description: `${values.name} a été modifié.`,
          variant: "success",
        });
      } else {
        await onAdd(values);
        toast({
          title: "Centre ajouté",
          description: `${values.name} a été ajouté.`,
          variant: "success",
        });
      }
      setFormOpen(false);
      setEditingCentre(null);
    } catch (error) {
      toast({
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : "Impossible d'enregistrer le centre.",
        variant: "error",
      });
    }
  }

  const columns: Column<CentreSante>[] = [
    {
      key: "name",
      header: "Établissement",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary-light text-primary">
            <Building2 className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium text-text-main">{row.name}</p>
            <p className="flex items-center gap-1 text-xs text-text-muted">
              <MapPin className="size-3" />
              {row.zone?.name ?? "—"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      cell: (row) => <Badge variant="info">{row.type}</Badge>,
    },
    {
      key: "zone",
      header: "Zone",
      cell: (row) => <span className="text-text-muted">{row.zone?.name ?? "—"}</span>,
    },
    {
      key: "coordinates",
      header: "Localisation (GPS)",
      cell: (row) =>
        row.latitude != null && row.longitude != null ? (
          <span className="font-mono text-xs text-text-muted">
            {row.latitude.toFixed(4)}, {row.longitude.toFixed(4)}
          </span>
        ) : (
          <span className="text-text-muted">—</span>
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
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-text-main">
            Centres de santé
          </h2>
          <p className="text-sm text-text-muted">
            {centres.length} établissement
            {centres.length > 1 ? "s" : ""} sanitaire{centres.length > 1 ? "s" : ""}.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Ajouter un centre
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex-1">
            <Input
              icon={Search}
              placeholder="Rechercher un centre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Rechercher un centre"
            />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center">
            <Select
              aria-label="Filtrer par type"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              placeholder="Tous les types"
              options={CENTRE_TYPES.map((type) => ({
                value: type,
                label: type,
              }))}
              className="sm:w-40"
            />
            <Select
              aria-label="Filtrer par zone"
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value)}
              placeholder="Toutes les zones"
              options={zoneOptions.map((zone) => ({
                value: zone,
                label: zone,
              }))}
              className="sm:w-48"
            />
          </div>
        </div>
      </Card>

      <Card>
        <DataTable
          columns={columns}
          data={filteredCentres}
          getRowId={(row) => String(row.id)}
          loading={loading}
          ariaLabel="Liste des centres de santé"
          emptyState={
            <EmptyState
              icon={Building2}
              title="Aucun centre trouvé"
              description="Aucun établissement ne correspond à votre recherche."
            />
          }
        />
      </Card>

      <CentreFormModal
        key={
          editingCentre ? `edit-${editingCentre.id}` : `create-${formOpen}`
        }
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingCentre(null);
        }}
        centre={editingCentre}
        onSubmit={handleSubmit}
        zones={zones}
      />
    </div>
  );
}