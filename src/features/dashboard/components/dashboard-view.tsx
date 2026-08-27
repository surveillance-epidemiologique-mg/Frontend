"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowRight,
  BellRing,
  ClipboardList,
  Database,
  FileDown,
  FlaskConical,
  Plus,
  Radio,
  Settings2,
  ShieldCheck,
  Skull,
  Stethoscope,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { DiseaseFilter } from "@/features/dashboard/components/disease-filter";
import { EvolutionChart } from "@/features/dashboard/components/evolution-chart";
import { GeographicDistribution } from "@/features/dashboard/components/geographic-distribution";
import { RecentAlertsList } from "@/features/dashboard/components/recent-alerts-list";
import { RecentCasesTable } from "@/features/dashboard/components/recent-cases-table";
import {
  useDashboardPreferences,
  type DashboardSection,
} from "@/features/dashboard/hooks/use-dashboard-preferences";
import type {
  DashboardStats,
  EvolutionPoint,
  RecentAlert,
  ZoneDistribution,
} from "@/services/dashboard";
import type { Maladie } from "@/features/settings/types";
import type { SessionUser } from "@/lib/session";
import { formatDate } from "@/lib/utils";
import { ROLES } from "@/types/auth";
import type { CaseRecord } from "@/types/case";

interface DashboardViewProps {
  session: SessionUser;
  user: { name: string; email: string };
  diseases: Maladie[];
  stats: DashboardStats | null;
  evolution: EvolutionPoint[];
  distribution: ZoneDistribution[];
  recentAlerts: RecentAlert[];
  recentCases: CaseRecord[];
  selectedDiseaseId?: string;
}

export function DashboardView({
  session,
  user,
  diseases,
  stats,
  evolution,
  distribution,
  recentAlerts,
  recentCases,
  selectedDiseaseId,
}: DashboardViewProps) {
  const router = useRouter();
  const [prefsOpen, setPrefsOpen] = useState(false);
  const { prefs, toggle } = useDashboardPreferences();
  const isAdmin = session.role === ROLES.ADMINISTRATEUR;
  const today = formatDate(new Date(), {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  function handleDiseaseSelect(id: string | undefined) {
    if (id) {
      router.replace(`/dashboard?diseaseId=${encodeURIComponent(id)}`);
    } else {
      router.replace("/dashboard");
    }
  }

  const selectedDisease =
    diseases.find((disease) => String(disease.id) === selectedDiseaseId) ??
    null;

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

      <section className="flex flex-col gap-3 rounded-2xl border border-border bg-bg-surface p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-text-main">
            Maladie sélectionnée
          </h2>
          <p className="text-sm text-text-muted">
            {selectedDisease
              ? `Statistiques et derniers cas pour « ${selectedDisease.name} ».`
              : "Statistiques et derniers cas pour l'ensemble des maladies."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPrefsOpen((v) => !v)}
              aria-expanded={prefsOpen}
            >
              <Settings2 className="size-4" />
              Personnaliser
            </Button>
            {prefsOpen ? (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setPrefsOpen(false)}
                  aria-hidden="true"
                />
                <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-border bg-bg-surface p-2 shadow-lg">
                  <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-text-muted">
                    Sections du dashboard
                  </p>
                  {(
                    [
                      ["stats", "Cartes de statistiques"],
                      ["evolution", "Évolution des cas"],
                      ["distribution", "Répartition géographique"],
                      ["alerts", "Alertes récentes"],
                      ["recentCases", "Derniers cas déclarés"],
                    ] as [DashboardSection, string][]
                  ).map(([key, label]) => (
                    <label
                      key={key}
                      className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-main transition-colors hover:bg-bg-app"
                    >
                      <input
                        type="checkbox"
                        checked={prefs[key]}
                        onChange={() => toggle(key)}
                        className="size-4 accent-[var(--primary)]"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </>
            ) : null}
          </div>
          <DiseaseFilter
            diseases={diseases}
            selectedId={selectedDiseaseId}
            onSelect={handleDiseaseSelect}
          />
        </div>
      </section>

      {prefs.stats ? (
        <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        <StatCard
          title="Total de cas"
          value={String(stats?.total ?? 0)}
          icon={Database}
          tone="primary"
          hint="tous statuts confondus"
        />
        <StatCard
          title="Nouveaux cas"
          value={String(stats?.newCases ?? 0)}
          icon={TrendingUp}
          tone="info"
          hint="7 derniers jours"
        />
        <StatCard
          title="Cas actifs"
          value={String(stats?.active ?? 0)}
          icon={Activity}
          tone="warning"
          hint="en cours de suivi"
        />
        <StatCard
          title="Décès"
          value={String(stats?.deceased ?? 0)}
          icon={Skull}
          tone="danger"
          hint="issue clinique"
        />
        <StatCard
          title="Alertes actives"
          value={String(stats?.activeAlerts ?? 0)}
          icon={BellRing}
          tone="danger"
          hint="alertes en cours"
        />
        </section>
      ) : null}

      {prefs.evolution || prefs.distribution ? (
      <section className="grid gap-4 xl:grid-cols-3">
        {prefs.evolution ? (
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Évolution des cas dans le temps</CardTitle>
            <CardDescription>
              Nombre de cas déclarés par jour sur les 14 derniers jours.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EvolutionChart data={evolution} />
          </CardContent>
        </Card>
        ) : null}

        {prefs.distribution ? (
        <Card>
          <CardHeader>
            <CardTitle>Répartition géographique</CardTitle>
            <CardDescription>
              Répartition des cas par zone sanitaire.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GeographicDistribution data={distribution} />
          </CardContent>
        </Card>
        ) : null}
      </section>
      ) : null}

      {prefs.alerts || prefs.recentCases ? (
      <section className="grid gap-4 xl:grid-cols-3">
        {prefs.alerts ? (
        <Card>
          <CardHeader>
            <CardTitle>Alertes récentes</CardTitle>
            <CardDescription>
              Dernières alertes sanitaires enregistrées.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentAlertsList alerts={recentAlerts} />
          </CardContent>
        </Card>
        ) : null}

        {prefs.recentCases ? (
        <div className="xl:col-span-2">
          <RecentCasesTable cases={recentCases} />
        </div>
        ) : null}
      </section>
      ) : null}

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

        {session.role === ROLES.AGENT_SANTE ||
        session.role === ROLES.RESPONSABLE_REGIONAL ? (
          <>
            <QuickAction
              href="/cases"
              icon={Stethoscope}
              title="Déclarer un signalement"
              description="Signalez un nouveau signalement épidémiologique."
            />
            <QuickAction
              href="/alerts"
              icon={Radio}
              title="Alertes de votre zone"
              description="Consultez les alertes sanitaires actives."
            />
          </>
        ) : null}

        {session.role === ROLES.RESPONSABLE_NATIONAL ? (
          <>
            <QuickAction
              href="/cases"
              icon={ClipboardList}
              title="Valider des signalements"
              description="Examinez et validez les signalements en attente."
            />
            <QuickAction
              href="/alerts"
              icon={Radio}
              title="Gérer les alertes"
              description="Suivez et prenez en charge les alertes sanitaires."
            />
          </>
        ) : null}

        {session.role === ROLES.OBSERVATEUR ? (
          <QuickAction
            href="/statistiques"
            icon={FlaskConical}
            title="Consulter les analyses"
            description="Visualisez les statistiques épidémiologiques."
          />
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