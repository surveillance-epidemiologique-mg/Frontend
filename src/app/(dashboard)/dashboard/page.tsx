import { redirect } from "next/navigation";
import {
  Activity,
  ClipboardList,
  FlaskConical,
  Map,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { DashboardAnalytics } from "@/features/dashboard/components/DashboardAnalytics";
import { verifySession } from "@/lib/session";
import { getMe } from "@/services/auth";
import { formatDate } from "@/lib/utils";
import { ROLES } from "@/config/navigation";

interface QuickAction {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

export default async function DashboardPage() {
  const session = await verifySession();
  if (!session) {
    redirect("/login");
  }

  let name = session.email.split("@")[0] ?? "Utilisateur";
  try {
    const me = await getMe();
    name = me.name;
  } catch {
    // API indisponible : on garde le nom dérivé de la session
  }

  const role = session.role;
  const today = formatDate(new Date(), {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const actions: QuickAction[] =
    role === ROLES.MEDECIN
      ? [
          {
            href: "/cases",
            icon: Activity,
            title: "Déclarer un cas",
            description: "Enregistrer un cas suspect épidémiologique.",
          },
          {
            href: "/cases",
            icon: ClipboardList,
            title: "Mes cas déclarés",
            description: "Consulter et filtrer mes déclarations.",
          },
        ]
      : role === ROLES.LABORATOIRE
        ? [
            {
              href: "/lab",
              icon: FlaskConical,
              title: "Analyses en attente",
              description: "Cas suspects à analyser et à valider.",
            },
          ]
        : [
            {
              href: "/settings",
              icon: Settings,
              title: "Paramètres",
              description: "Utilisateurs, maladies et centres de santé.",
            },
          ];

  actions.push({
    href: "/zones",
    icon: Map,
    title: "Carte épidémique",
    description: "Visualisation géographique de la situation.",
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Bonjour, ${name}`}
        description={today.charAt(0).toUpperCase() + today.slice(1)}
      />

      {/* DASH-01 / DASH-02 · KPI, graphiques et filtres (données mockées) */}
      <DashboardAnalytics />

    </div>
  );
}