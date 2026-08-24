import { Badge } from "@/components/ui/badge";
import type { CaseStatus } from "@/types/case";

const STATUS_META: Record<
  CaseStatus,
  { label: string; variant: "suspect" | "confirmed" | "recovered" | "deceased" }
> = {
  SUSPECT: { label: "Suspect", variant: "suspect" },
  CONFIRMED: { label: "Confirmé", variant: "confirmed" },
  RECOVERED: { label: "Guéri", variant: "recovered" },
  DECEASED: { label: "Décédé", variant: "deceased" },
};

export function CaseStatusBadge({ status }: { status: CaseStatus }) {
  const meta = STATUS_META[status];

  return (
    <Badge variant={meta.variant} dot>
      {meta.label}
    </Badge>
  );
}