"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Edit,
  MapPin,
  Send,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable, type Column } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { DiseaseIcon } from "@/features/dashboard/components/disease-icon";
import { SignalementStatusBadge } from "@/features/cases/components/signalement-status-badge";
import {
  rejectSignalement,
  submitSignalement,
  validateSignalement,
} from "@/features/cases/services/signalements";
import type { Signalement } from "@/features/cases/types";
import { formatDate } from "@/lib/utils";

interface SignalementsListProps {
  signalements: Signalement[];
  isAdmin: boolean;
  currentUserId: number;
  onEdit: (signalement: Signalement) => void;
  onReload: () => void;
}

type DialogAction =
  | { kind: "submit"; signalement: Signalement }
  | { kind: "validate"; signalement: Signalement }
  | { kind: "reject"; signalement: Signalement }
  | null;

const DIALOG_META = {
  submit: {
    title: "Soumettre le signalement",
    description: "Confirmer l'envoi pour validation ?",
    confirmLabel: "Soumettre",
    tone: "primary" as const,
  },
  validate: {
    title: "Valider le signalement",
    description: "Confirmer la validation du signalement ?",
    confirmLabel: "Valider",
    tone: "primary" as const,
  },
  reject: {
    title: "Rejeter le signalement",
    description: "Confirmer le rejet du signalement ?",
    confirmLabel: "Rejeter",
    tone: "danger" as const,
  },
};

export function SignalementsList({
  signalements,
  isAdmin,
  currentUserId,
  onEdit,
  onReload,
}: SignalementsListProps) {
  const { toast } = useToast();
  const [dialog, setDialog] = useState<DialogAction>(null);
  const [busy, setBusy] = useState(false);

  async function confirmDialog() {
    if (!dialog) {
      return;
    }
    setBusy(true);
    try {
      const action = dialog.kind;
      if (action === "submit") {
        await submitSignalement(dialog.signalement.id);
      } else if (action === "validate") {
        await validateSignalement(dialog.signalement.id);
      } else {
        await rejectSignalement(dialog.signalement.id);
      }
      toast({
        title: "Signalement mis à jour",
        variant: "success",
      });
      setDialog(null);
      onReload();
    } catch (error) {
      toast({
        title: "Erreur",
        description:
          error instanceof Error ? error.message : "Action impossible.",
        variant: "error",
      });
    } finally {
      setBusy(false);
    }
  }

  const columns: Column<Signalement>[] = [
    {
      key: "date",
      header: "Date",
      cell: (row) => (
        <span className="whitespace-nowrap text-text-main">
          {formatDate(row.dateSignalement, { day: "2-digit", month: "short", year: "numeric" })}
        </span>
      ),
    },
    {
      key: "maladie",
      header: "Maladie",
      cell: (row) => (
        <span className="flex items-center gap-2">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary-light text-primary">
            <DiseaseIcon name={row.maladie.iconName} className="size-4" />
          </span>
          <span className="font-medium text-text-main">{row.maladie.name}</span>
        </span>
      ),
    },
    {
      key: "etablissement",
      header: "Établissement",
      cell: (row) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-text-main">{row.centre.name}</p>
          <p className="flex items-center gap-1 text-xs text-text-muted">
            <MapPin className="size-3" />
            {row.district.name} · {row.region.name}
          </p>
        </div>
      ),
    },
    {
      key: "compteurs",
      header: "S / C / D / G",
      cell: (row) => (
        <span className="font-mono text-xs text-text-muted">
          {row.nbCasSuspects} / {row.nbCasConfirmes} / {row.nbDeces} /{" "}
          {row.nbGueris}
        </span>
      ),
    },
    {
      key: "statut",
      header: "Statut",
      cell: (row) => <SignalementStatusBadge statut={row.statut} />,
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      cell: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          {!isAdmin && row.createdById === currentUserId ? (
            row.statut === "Brouillon" ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(row)}
                  aria-label={`Modifier ${row.maladie.name}`}
                >
                  <Edit className="size-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setDialog({ kind: "submit", signalement: row })}
                >
                  <Send className="size-3.5" />
                  Soumettre
                </Button>
              </>
            ) : row.statut === "Rejete" ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(row)}
                aria-label={`Modifier ${row.maladie.name}`}
              >
                <Edit className="size-4" />
                Modifier
              </Button>
            ) : null
          ) : null}

          {isAdmin && row.statut === "EnAttente" ? (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setDialog({ kind: "validate", signalement: row })}
              >
                <CheckCircle2 className="size-3.5" />
                Valider
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setDialog({ kind: "reject", signalement: row })}
              >
                <XCircle className="size-3.5" />
                Rejeter
              </Button>
            </>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <>
      <Card>
        <DataTable
          columns={columns}
          data={signalements}
          getRowId={(row) => String(row.id)}
          ariaLabel="Liste des signalements"
          emptyState={
            <EmptyState
              icon={Send}
              title="Aucun signalement"
              description="Créez votre premier signalement avec le formulaire ci-dessus."
            />
          }
        />
      </Card>

      {dialog ? (
        <ConfirmDialog
          open
          onClose={() => setDialog(null)}
          onConfirm={confirmDialog}
          loading={busy}
          title={DIALOG_META[dialog.kind].title}
          description={DIALOG_META[dialog.kind].description}
          confirmLabel={DIALOG_META[dialog.kind].confirmLabel}
          tone={DIALOG_META[dialog.kind].tone}
        />
      ) : null}
    </>
  );
}