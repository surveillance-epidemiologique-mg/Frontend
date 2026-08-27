import { Badge } from "@/components/ui/badge";
import type { StatutSignalement } from "@/features/cases/types";

const STATUS_META: Record<
  StatutSignalement,
  { label: string; variant: "default" | "warning" | "success" | "danger" }
> = {
  Brouillon: { label: "Brouillon", variant: "default" },
  EnAttente: { label: "En attente de validation", variant: "warning" },
  Valide: { label: "Validé", variant: "success" },
  Rejete: { label: "Rejeté", variant: "danger" },
};

export function SignalementStatusBadge({
  statut,
}: {
  statut: StatutSignalement;
}) {
  const meta = STATUS_META[statut] ?? STATUS_META.Brouillon;
  return (
    <Badge variant={meta.variant} dot>
      {meta.label}
    </Badge>
  );
}