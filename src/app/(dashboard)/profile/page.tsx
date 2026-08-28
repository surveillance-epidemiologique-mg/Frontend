import { redirect } from "next/navigation";
import {
  BadgeCheck,
  Building2,
  CalendarDays,
  KeyRound,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { ChangePasswordForm } from "@/components/auth/change-password-form";
import { verifySession } from "@/lib/session";
import { getMe } from "@/services/auth";
import { formatDate } from "@/lib/utils";

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
  const firstName = me?.firstName ?? "";
  const lastName = me?.lastName ?? "";

  const infos = [
    { icon: User, label: "Nom complet", value: name },
    { icon: User, label: "Prénom", value: firstName || "—" },
    { icon: User, label: "Nom de famille", value: lastName || "—" },
    { icon: Mail, label: "Adresse e-mail", value: email },
    { icon: Phone, label: "Téléphone", value: me?.phoneNumber ?? "—" },
    { icon: BadgeCheck, label: "Rôle", value: role },
    { icon: MapPin, label: "Région", value: me?.region?.name ?? "—" },
    { icon: MapPin, label: "District", value: me?.centre?.zone?.name ?? "—" },
    { icon: Building2, label: "Établissement", value: me?.centre?.name ?? "—" },
    {
      icon: BadgeCheck,
      label: "Statut du compte",
      value: me?.isActive ? "Actif" : "Inactif",
    },
    {
      icon: CalendarDays,
      label: "Membre depuis le",
      value: me?.createdAt ? formatDate(me.createdAt) : "—",
    },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Mes Informations"
        description="Vos informations personnelles, votre périmètre et la sécurité de votre compte."
      />

      <Card>
        <div className="flex items-center gap-4 border-b border-border p-6">
          <Avatar name={name} size="lg" />
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-text-main">
              {name}
            </h2>
            <p className="truncate text-sm text-text-muted">{email}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant="secondary">{role}</Badge>
              <Badge variant={me?.isActive === false ? "danger" : "success"}>
                {me?.isActive === false ? "Inactif" : "Actif"}
              </Badge>
            </div>
          </div>
        </div>

        <CardContent className="pt-0">
          <dl className="divide-y divide-border">
            {infos.map((info) => (
              <div key={info.label} className="flex items-start gap-4 py-3.5">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-bg-app text-text-muted">
                  <info.icon className="size-4" />
                </span>
                <div className="min-w-0">
                  <dt className="text-xs font-medium uppercase tracking-wider text-text-muted">
                    {info.label}
                  </dt>
                  <dd className="mt-0.5 truncate text-sm text-text-main">
                    {info.value}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="size-4 text-primary" />
            Changer mon mot de passe
          </CardTitle>
          <CardDescription>
            Utilisez un mot de passe d&apos;au moins 8 caractères, difficile à
            deviner et propre à votre compte.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}