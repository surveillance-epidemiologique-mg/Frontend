import { redirect } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  Building2,
  CalendarDays,
  KeyRound,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";
import { Avatar } from "@/components/avatar/component";
import { Badge } from "@/components/badge/component";
import { Card } from "@/components/card/component";
import { PageHeader } from "@/components/page-header/component";
import { ChangePasswordForm } from "@/components/change-password-form/component";
import { verifySession } from "@/lib/session";
import { getMe } from "@/services/auth";
import { formatDate } from "@/lib/utils";

type ProfileDetail = {
  icon: LucideIcon;
  label: string;
  value: string;
};

function ProfileDetails({ items }: { items: ProfileDetail[] }) {
  return (
    <dl className="grid gap-x-7 gap-y-6 sm:grid-cols-2">
      {items.map(({ icon: Icon, label, value }) => (
        <div key={label} className="flex min-w-0 items-start gap-3">
          <span
            className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-light/70 text-primary"
            aria-hidden="true"
          >
            <Icon className="size-[18px]" strokeWidth={1.8} />
          </span>
          <div className="min-w-0 pt-0.5">
            <dt className="text-xs font-medium text-text-muted">{label}</dt>
            <dd className="mt-1 text-sm font-semibold leading-6 text-text-main [overflow-wrap:anywhere]">
              {value}
            </dd>
          </div>
        </div>
      ))}
    </dl>
  );
}

export default async function ProfilePage() {
  const session = await verifySession();

  if (!session) {
    redirect("/login");
  }

  let me: Awaited<ReturnType<typeof getMe>> | null = null;
  try {
    me = await getMe();
  } catch {
    me = null;
  }

  const name = me?.name ?? session.email.split("@")[0] ?? "Utilisateur";
  const email = me?.email ?? session.email;
  const role = me?.role?.name ?? session.role;
  const status = me ? (me.isActive ? "Actif" : "Inactif") : "Indisponible";

  const personalDetails: ProfileDetail[] = [
    { icon: User, label: "Nom complet", value: name },
    { icon: Mail, label: "Adresse e-mail", value: email },
    { icon: Phone, label: "Téléphone", value: me?.phoneNumber?.trim() || "Non renseigné" },
    {
      icon: CalendarDays,
      label: "Membre depuis le",
      value: me?.createdAt ? formatDate(me.createdAt) : "Indisponible",
    },
  ];

  const assignmentDetails: ProfileDetail[] = [
    { icon: BadgeCheck, label: "Rôle", value: role },
    {
      icon: Building2,
      label: "Centre de santé",
      value: me ? me.centre?.name ?? "Aucun centre rattaché" : "Indisponible",
    },
    {
      icon: MapPin,
      label: "Zone administrative",
      value: me ? me.centre?.zone?.name ?? "Non renseignée" : "Indisponible",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-[1300px] space-y-6 pb-6">
      <PageHeader
        title="Mes Informations"
        description="Consultez votre profil, votre affectation et la sécurité de votre compte."
      />

      <Card className="overflow-hidden rounded-3xl border border-border/70 bg-bg-surface shadow-card">
        <div
          className="h-24 bg-gradient-to-r from-primary-light via-primary-light/50 to-bg-surface sm:h-28"
          aria-hidden="true"
        />
        <div className="relative -mt-9 flex flex-col gap-4 px-5 pb-6 sm:-mt-10 sm:flex-row sm:items-end sm:justify-between sm:px-7 sm:pb-7">
          <div className="flex min-w-0 items-end gap-4">
            <Avatar
              name={name}
              size="lg"
              className="!size-[72px] !text-xl ring-4 ring-bg-surface shadow-card sm:!size-20"
            />
            <div className="min-w-0 pb-1">
              <h2 className="text-lg font-semibold leading-tight text-text-main [overflow-wrap:anywhere] sm:text-xl">
                {name}
              </h2>
              <p className="mt-1 text-sm text-text-muted [overflow-wrap:anywhere]">
                {email}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 sm:pb-1">
            <Badge variant="secondary" className="px-3 py-1">
              {role}
            </Badge>
            <Badge
              variant={status === "Actif" ? "success" : status === "Inactif" ? "danger" : "outline"}
              dot={status !== "Indisponible"}
              className="px-3 py-1"
            >
              {status === "Indisponible" ? "Statut indisponible" : status}
            </Badge>
          </div>
        </div>
      </Card>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <div className="min-w-0 space-y-6">
          <Card className="rounded-3xl border border-border/70 bg-bg-surface p-5 shadow-card sm:p-7">
            <div className="mb-6 flex items-start gap-3 border-b border-border/60 pb-5">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-light text-primary" aria-hidden="true">
                <User className="size-5" strokeWidth={1.8} />
              </span>
              <div>
                <h3 className="text-base font-semibold text-text-main">Informations personnelles</h3>
                <p className="mt-1 text-sm leading-5 text-text-muted">Vos coordonnées et votre identité dans ÉpiSuivi.</p>
              </div>
            </div>
            <ProfileDetails items={personalDetails} />
          </Card>

          <Card className="rounded-3xl border border-border/70 bg-bg-surface p-5 shadow-card sm:p-7">
            <div className="mb-6 flex items-start gap-3 border-b border-border/60 pb-5">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-light text-primary" aria-hidden="true">
                <Building2 className="size-5" strokeWidth={1.8} />
              </span>
              <div>
                <h3 className="text-base font-semibold text-text-main">Affectation professionnelle</h3>
                <p className="mt-1 text-sm leading-5 text-text-muted">Votre rôle et votre rattachement dans l’application.</p>
              </div>
            </div>
            <ProfileDetails items={assignmentDetails} />
          </Card>
        </div>

        <Card className="min-w-0 rounded-3xl border border-border/70 bg-bg-surface p-5 shadow-card sm:p-7">
          <div className="mb-6 flex items-start gap-3 border-b border-border/60 pb-5">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-light text-primary" aria-hidden="true">
              <ShieldCheck className="size-5" strokeWidth={1.8} />
            </span>
            <div>
              <h3 className="text-base font-semibold text-text-main">Sécurité du compte</h3>
              <p className="mt-1 text-sm leading-5 text-text-muted">Mettez à jour votre mot de passe en toute sécurité.</p>
            </div>
          </div>
          <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-text-main">
            <KeyRound className="size-4 text-primary" aria-hidden="true" />
            Changer mon mot de passe
          </div>
          <ChangePasswordForm />
          <p className="mt-5 text-xs leading-5 text-text-muted">
            Choisissez au moins 8 caractères et évitez un mot de passe déjà utilisé.
          </p>
        </Card>
      </div>
    </div>
  );
}
