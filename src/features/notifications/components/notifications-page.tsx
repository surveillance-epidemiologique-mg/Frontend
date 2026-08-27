"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BellRing, MapPin, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { RiskBadge } from "@/features/alerts/components/alert-badges";
import { fetchNotifications } from "@/features/alerts/services/alerts";
import type { Alerte } from "@/features/alerts/types";
import { DiseaseIcon } from "@/features/dashboard/components/disease-icon";
import { formatDate } from "@/lib/utils";

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Alerte[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const data = await fetchNotifications();
        if (active) {
          setNotifications(data);
          setError(null);
        }
      } catch (e) {
        if (active) {
          setError(
            e instanceof Error ? e.message : "Impossible de charger les notifications.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [reloadKey]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Alertes sanitaires récentes."
      />

      {error ? (
        <Button variant="ghost" size="sm" onClick={() => setReloadKey((key) => key + 1)}>
          <RefreshCw className="size-4" />
          Réessayer
        </Button>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Notifications récentes</CardTitle>
          <CardDescription>
            Les dernières alertes détectées, quelle que soit leur situation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="py-8 text-center text-sm text-text-muted">
              Chargement des notifications...
            </p>
          ) : notifications.length === 0 ? (
            <p className="py-8 text-center text-sm text-text-muted">
              Aucune notification.
            </p>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <div key={notification.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-warning/10 text-warning">
                    <BellRing className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-text-main">
                        {notification.maladie?.name ?? "Toutes maladies"}
                      </span>
                      <RiskBadge niveau={notification.niveauRisque} />
                    </div>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-text-muted">
                      <MapPin className="size-3" />
                      {notification.zone.name}
                      <span className="mx-1">·</span>
                      {notification.detectedCaseCount} cas détectés
                      <span className="mx-1">·</span>
                      {formatDate(notification.detectionDate)}
                    </p>
                  </div>
                  <DiseaseIcon name={notification.maladie?.iconName} className="size-5 text-text-muted" />
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 border-t border-border pt-4">
            <Button variant="secondary" size="sm" asChild>
              <Link href="/alerts">Voir toutes les alertes</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}