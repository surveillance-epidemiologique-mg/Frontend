"use client";

import { Building2, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import type { CentreSante } from "@/types/auth";

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
    cell: (row) => (
      <span className="text-text-muted">{row.zone?.name ?? "—"}</span>
    ),
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
];

interface EstablishmentsViewProps {
  centres: CentreSante[];
}

export function EstablishmentsView({ centres }: EstablishmentsViewProps) {
  return (
    <Card>
      <DataTable
        columns={columns}
        data={centres}
        getRowId={(row) => String(row.id)}
        ariaLabel="Liste des établissements de santé"
        emptyState={
          <EmptyState
            icon={Building2}
            title="Aucun établissement"
            description="Aucun établissement de santé n'est enregistré pour le moment."
          />
        }
      />
    </Card>
  );
}