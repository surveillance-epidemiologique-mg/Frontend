"use client";

import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";

const SHORTCUTS: { keys: string; label: string }[] = [
  { keys: "/", label: "Recherche globale" },
  { keys: "T", label: "Basculer le thème clair / sombre" },
  { keys: "P", label: "Mode présentation" },
  { keys: "?", label: "Aide et raccourcis" },
  { keys: "G puis D", label: "Aller au dashboard" },
  { keys: "G puis S", label: "Aller aux statistiques" },
  { keys: "G puis A", label: "Aller aux alertes" },
  { keys: "G puis C", label: "Aller aux signalements" },
  { keys: "G puis R", label: "Aller aux rapports" },
];

interface HelpDialogProps {
  open: boolean;
  onClose: () => void;
}

export function HelpDialog({ open, onClose }: HelpDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Aide et raccourcis"
      description="Guide rapide de la plateforme."
      size="lg"
    >
      <div className="space-y-5">
        <section>
          <h3 className="mb-2 text-sm font-semibold text-text-main">
            Raccourcis clavier
          </h3>
          <div className="divide-y divide-border rounded-lg border border-border">
            {SHORTCUTS.map((shortcut) => (
              <div
                key={shortcut.label}
                className="flex items-center justify-between gap-3 px-3 py-2"
              >
                <span className="text-sm text-text-main">{shortcut.label}</span>
                <Badge variant="outline" className="font-mono">
                  {shortcut.keys}
                </Badge>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-sm font-semibold text-text-main">
            Rôles et accès
          </h3>
          <p className="text-sm leading-relaxed text-text-muted">
            Les permissions sont vérifiées côté serveur : chaque rôle ne voit que
            ce qu&apos;il est autorisé à consulter. Les données sensibles
            (utilisateurs, sessions, journal) sont réservées à l&apos;administrateur.
          </p>
        </section>

        <section>
          <h3 className="mb-2 text-sm font-semibold text-text-main">
            Suggestions
          </h3>
          <p className="text-sm leading-relaxed text-text-muted">
            En cas de problème, vérifiez la fraîcheur des données dans la page
            Alertes, consultez le journal d&apos;activité (admin) et contactez le
            support.
          </p>
        </section>
      </div>
    </Modal>
  );
}