import { AlertTriangle, BellRing, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type {
  AlertNiveauRisque,
  AlertStatut,
  RecentAlert,
} from "@/services/dashboard";
import { formatDate } from "@/lib/utils";

type BadgeVariant =
  | "default"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "info";

const NIVEAU_VARIANT: Record<AlertNiveauRisque, BadgeVariant> = {
  Normal: "default",
  Surveillance: "info",
  Alerte: "warning",
  Critique: "danger",
};

const STATUT_VARIANT: Record<AlertStatut, BadgeVariant> = {
  Active: "danger",
  EnPriseEnCharge: "warning",
  Resolue: "success",
};

const STATUT_LABEL: Record<AlertStatut, string> = {
  Active: "Active",
  EnPriseEnCharge: "Prise en charge",
  Resolue: "Résolue",
};

interface RecentAlertsListProps {
  alerts: RecentAlert[];
}

export function RecentAlertsList({ alerts }: RecentAlertsListProps) {
  if (alerts.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-text-muted">
        Aucune alerte enregistrée.
      </p>
    );
  }

  return (
    <div className="divide-y divide-border">
      {alerts.map((alert) => (
        <div key={alert.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-warning/10 text-warning">
            <AlertTriangle className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-medium text-text-main">
                {alert.maladie}
              </p>
              <Badge variant={NIVEAU_VARIANT[alert.niveauRisque]}>
                {alert.niveauRisque}
              </Badge>
            </div>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-text-muted">
              <MapPin className="size-3" />
              {alert.zone}
              <span className="mx-1">·</span>
              <BellRing className="size-3" />
              {formatDate(alert.detectionDate)}
            </p>
          </div>
          <Badge variant={STATUT_VARIANT[alert.statut]} dot>
            {STATUT_LABEL[alert.statut]}
          </Badge>
        </div>
      ))}
    </div>
  );
}