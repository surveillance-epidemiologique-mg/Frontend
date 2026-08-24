"use client";

import Link from "next/link";
import { ArrowRight, MapPin, MoreHorizontal } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DataTable,
  type Column,
} from "@/components/ui/data-table";
import { CaseStatusBadge } from "@/features/cases/components/case-status-badge";
import { RECENT_CASES } from "@/features/dashboard/data/recent-cases";
import { formatDate } from "@/lib/utils";
import type { CaseRecord } from "@/types/case";

const columns: Column<CaseRecord>[] = [
  {
    key: "code",
    header: "Référence",
    cell: (row) => (
      <span className="font-mono text-xs font-semibold text-text-main">
        {row.code}
      </span>
    ),
  },
  {
    key: "patient",
    header: "Patient",
    cell: (row) => (
      <span className="flex items-center gap-2.5">
        <Avatar name={row.patient} size="sm" />
        <span className="font-medium text-text-main">{row.patient}</span>
      </span>
    ),
  },
  {
    key: "zone",
    header: "Zone",
    cell: (row) => (
      <span className="inline-flex items-center gap-1.5 text-text-muted">
        <MapPin className="size-3.5" />
        {row.zone}
      </span>
    ),
  },
  {
    key: "status",
    header: "Statut",
    cell: (row) => <CaseStatusBadge status={row.status} />,
  },
  {
    key: "reportedAt",
    header: "Déclaré le",
    cell: (row) => (
      <span className="text-text-muted">{formatDate(row.reportedAt)}</span>
    ),
  },
  {
    key: "actions",
    header: "",
    align: "right",
    headerClassName: "sr-only",
    cell: () => (
      <button
        type="button"
        aria-label="Actions"
        className="grid size-8 place-items-center rounded-lg text-text-muted transition-colors hover:bg-bg-app hover:text-text-main"
      >
        <MoreHorizontal className="size-4" />
      </button>
    ),
  },
];

export function RecentCasesTable() {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-4 space-y-0">
        <div className="space-y-1">
          <CardTitle>Derniers cas déclarés</CardTitle>
          <CardDescription>
            Suivi récent des déclarations épidémiologiques.
          </CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/cases">
            Voir tout
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={RECENT_CASES}
          getRowId={(row) => row.id}
          pageSize={5}
          ariaLabel="Derniers cas déclarés"
        />
      </CardContent>
    </Card>
  );
}