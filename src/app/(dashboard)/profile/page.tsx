import { redirect } from "next/navigation";
import {
  BadgeCheck,
  Building2,
  CalendarDays,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
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

  const infos = [
    { icon: User, label: "Nom complet", value: name },
    { icon: Mail, label: "Adresse e-mail", value: email },
    { icon: Phone, label: "Téléphone", value: me?.phoneNumber ?? "—" },
    { icon: BadgeCheck, label: "Rôle", value: role },
    { icon: Building2, label: "Centre de santé", value: me?.centre?.name ?? "—" },
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
        description="Vos informations personnelles et de compte."
      />

      <Card>
        <div className="flex items-center gap-4 border-b border-border p-6">
          <Avatar name={name} size="lg" />
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-text-main">
              {name}
            </h2>
            <p className="truncate text-sm text-text-muted">{email}</p>
            <Badge variant="secondary" className="mt-2">
              {role}
            </Badge>
          </div>
        </div>

        <CardContent className="pt-0">
          <dl className="divide-y divide-border">
            {infos.map((info) => (
              <div
                key={info.label}
                className="flex items-start gap-4 py-4"
              >
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
    </div>
  );
}