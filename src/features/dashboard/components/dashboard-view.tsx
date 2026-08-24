import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Bell,
  ClipboardList,
  FileDown,
  FlaskConical,
  HeartPulse,
  Plus,
  Radio,
  SearchCheck,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { RecentCasesTable } from "@/features/dashboard/components/recent-cases-table";
import type { SessionUser } from "@/lib/session";
import { formatDate } from "@/lib/utils";
import { ROLES } from "@/types/auth";

interface DashboardViewProps {
  session: SessionUser;
  user: { name: string; email: string };
}

export function DashboardView({ session, user }: DashboardViewProps) {
  const isAdmin = session.role === ROLES.ADMINISTRATEUR;
  const today = formatDate(new Date(), {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Bonjour, ${user.name}`}
        description={today.charAt(0).toUpperCase() + today.slice(1)}
      >
        <Button variant="outline" className="hidden sm:inline-flex">
          <FileDown className="size-4" />
          Exporter
        </Button>
        <Button asChild>
          <Link href="/cases">
            <Plus className="size-4" />
            Déclarer un cas
          </Link>
        </Button>
      </PageHeader>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Cas confirmés"
          value="128"
          icon={Activity}
          tone="danger"
          trend={12.5}
          hint="vs mois dernier"
        />
        <StatCard
          title="Cas suspects"
          value="54"
          icon={SearchCheck}
          tone="warning"
          trend={-4.2}
          hint="vs mois dernier"
        />
        <StatCard
          title="Guérisons"
          value="342"
          icon={HeartPulse}
          tone="success"
          trend={8.1}
          hint="vs mois dernier"
        />
        <StatCard
          title="Alertes actives"
          value="7"
          icon={Bell}
          tone="info"
          trend={0}
          hint="aucun changement"
        />
      </section>

      <RecentCasesTable />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {isAdmin ? (
          <>
            <QuickAction
              href="/invite"
              icon={ShieldCheck}
              title="Inviter un utilisateur"
              description="Créez un compte Médecin ou Laboratoire."
            />
            <QuickAction
              href="/users"
              icon={ClipboardList}
              title="Gérer les utilisateurs"
              description="Consultez et administrez les comptes."
            />
          </>
        ) : null}

        {session.role === ROLES.MEDECIN ? (
          <>
            <QuickAction
              href="/cases"
              icon={Stethoscope}
              title="Déclarer un cas"
              description="Signalez un nouveau cas épidémiologique."
            />
            <QuickAction
              href="/alerts"
              icon={Radio}
              title="Alertes de votre zone"
              description="Consultez les alertes sanitaires actives."
            />
          </>
        ) : null}

        {session.role === ROLES.LABORATOIRE ? (
          <>
            <QuickAction
              href="/cases"
              icon={FlaskConical}
              title="Saisir un résultat"
              description="Enregistrez les résultats d'analyses."
            />
            <QuickAction
              href="/alerts"
              icon={Radio}
              title="Demandes reçues"
              description="Suivez les demandes d'analyse en attente."
            />
          </>
        ) : null}
      </section>
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: typeof Activity;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-border bg-bg-surface p-6 shadow-sm transition-all duration-200 hover:border-primary/40 hover:shadow-md"
    >
      <span className="mb-3 grid size-10 place-items-center rounded-xl bg-primary-light text-primary transition-transform duration-200 group-hover:scale-105">
        <Icon className="size-5" />
      </span>
      <h2 className="text-base font-semibold text-text-main">{title}</h2>
      <p className="mt-1 text-sm text-text-muted">{description}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
        Ouvrir
        <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}