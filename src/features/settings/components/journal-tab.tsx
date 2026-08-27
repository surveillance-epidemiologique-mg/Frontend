"use client";

import { useEffect, useState } from "react";
import { Activity } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { fetchJournal } from "@/features/settings/services/admin";
import type { JournalEntry } from "@/features/settings/services/admin";
import { formatDate } from "@/lib/utils";

const ACTIONS = [
  "auth.login",
  "auth.logout",
  "auth.activate",
  "auth.changePassword",
  "auth.resetPassword",
  "user.invite",
  "user.update",
  "user.status",
  "signalement.create",
  "signalement.update",
  "signalement.submit",
  "signalement.validate",
  "signalement.reject",
  "alerte.create",
  "alerte.takeCharge",
  "alerte.resolve",
  "alerte.detect",
  "zone.create",
  "zone.update",
];

export function JournalTab() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [action, setAction] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const data = await fetchJournal({ action: action || undefined, limit: 100 });
        if (active) setEntries(data);
      } catch {
        if (active) setEntries([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [action]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-text-main">
            Journal d&apos;activité
          </h2>
          <p className="text-sm text-text-muted">
            Trace des actions importantes effectuées sur la plateforme.
          </p>
        </div>
        <Select
          aria-label="Filtrer par action"
          value={action}
          onChange={(e) => setAction(e.target.value)}
          placeholder="Toutes les actions"
          options={ACTIONS.map((a) => ({ value: a, label: a }))}
          className="w-56"
        />
      </div>

      <Card>
        {loading ? (
          <p className="py-8 text-center text-sm text-text-muted">Chargement...</p>
        ) : entries.length === 0 ? (
          <p className="py-8 text-center text-sm text-text-muted">Aucune entrée.</p>
        ) : (
          <div className="divide-y divide-border">
            {entries.map((entry) => (
              <div key={entry.id} className="flex items-start gap-3 px-4 py-3">
                <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-bg-app text-text-muted">
                  <Activity className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-text-main">{entry.action}</p>
                  <p className="truncate text-xs text-text-muted">
                    {entry.detail ?? ""} · {entry.utilisateur?.email ?? "système"}
                    {entry.ip ? ` · ${entry.ip}` : ""}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-text-subtle">
                  {formatDate(entry.date, {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}