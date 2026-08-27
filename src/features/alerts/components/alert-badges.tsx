import { Badge } from "@/components/ui/badge";
import type { AlertNiveauRisque, AlertStatut } from "@/features/alerts/types";

const NIVEAU: Record<AlertNiveauRisque, { label: string; variant: "default" | "info" | "warning" | "danger" }> = {
  Normal: { label: "Normal", variant: "default" },
  Surveillance: { label: "Surveillance", variant: "info" },
  Alerte: { label: "Alerte", variant: "warning" },
  Critique: { label: "Critique", variant: "danger" },
};

const STATUT: Record<AlertStatut, { label: string; variant: "danger" | "warning" | "success" }> = {
  Active: { label: "Active", variant: "danger" },
  EnPriseEnCharge: { label: "En prise en charge", variant: "warning" },
  Resolue: { label: "Résolue", variant: "success" },
};

export function RiskBadge({ niveau }: { niveau: AlertNiveauRisque }) {
  const meta = NIVEAU[niveau] ?? NIVEAU.Normal;
  return (
    <Badge variant={meta.variant} dot>
      {meta.label}
    </Badge>
  );
}

export function AlertStatusBadge({ statut }: { statut: AlertStatut }) {
  const meta = STATUT[statut] ?? STATUT.Active;
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
}