"use client";

import { useEffect, useState } from "react";
import { Globe, ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import {
  fetchSessions,
  revokeSession,
} from "@/features/settings/services/admin";
import type { SessionInfo } from "@/features/settings/services/admin";
import { formatDate } from "@/lib/utils";

export function SessionsTab() {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const data = await fetchSessions();
        if (active) setSessions(data);
      } catch {
        if (active) setSessions([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [reloadKey]);

  async function handleRevoke(id: number) {
    try {
      await revokeSession(id);
      toast({ title: "Session révoquée", variant: "success" });
      setReloadKey((key) => key + 1);
    } catch (e) {
      toast({
        title: "Erreur",
        description: e instanceof Error ? e.message : "Révocation impossible.",
        variant: "error",
      });
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-text-main">
          Sessions actives
        </h2>
        <p className="text-sm text-text-muted">
          Révocation immédiate d&apos;une session : le jeton correspondant devient
          invalide.
        </p>
      </div>

      <Card>
        {loading ? (
          <p className="py-8 text-center text-sm text-text-muted">Chargement...</p>
        ) : sessions.length === 0 ? (
          <p className="py-8 text-center text-sm text-text-muted">
            Aucune session active.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {sessions.map((session) => (
              <div key={session.id} className="flex items-center gap-3 px-4 py-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-bg-app text-text-muted">
                  <Globe className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-text-main">
                    {session.utilisateur.name} · {session.utilisateur.email}
                  </p>
                  <p className="truncate text-xs text-text-muted">
                    {session.ip ?? "IP inconnue"} · créée le{" "}
                    {formatDate(session.createdAt, {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRevoke(session.id)}
                >
                  <ShieldX className="size-3.5" />
                  Révoquer
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}