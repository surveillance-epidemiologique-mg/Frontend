"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  Bell,
  FileText,
  Hospital,
  LayoutDashboard,
  LogOut,
  Map,
  Settings,
  Users,
} from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { ToastProvider } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  user: { name: string; email: string; role?: string };
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/cases", label: "Cas", icon: Activity },
  { href: "/zones", label: "Carte", icon: Map },
  { href: "/statistiques", label: "Statistiques", icon: BarChart3 },
  { href: "/alerts", label: "Alertes", icon: Bell },
  { href: "/reports", label: "Rapports", icon: FileText },
  { href: "/etablissements", label: "Établissements", icon: Hospital },
  { href: "/users", label: "Utilisateurs", icon: Users },
  { href: "/settings", label: "Paramètres", icon: Settings },
];

export function DashboardLayout({ user, children }: DashboardLayoutProps) {
  const pathname = usePathname();

  const initials =
    user.name
      .split(" ")
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";

  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-50">
        {/* HEADER */}
        <header className="fixed left-0 right-0 top-0 z-50 h-16 border-b border-slate-200 bg-white">
          <div className="flex h-full items-center justify-between px-6">
            {/* Logo + nom */}
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-blue-700">
                <Activity className="text-white" size={21} />
              </div>
              <div>
                <h1 className="text-sm font-bold text-slate-800">
                  Surveillance Épidémiologique
                </h1>
                <p className="text-xs text-slate-400">Madagascar</p>
              </div>
            </div>

            {/* Sélecteurs (filtres globaux — à câbler) */}
            <div className="hidden items-center gap-3 md:flex">
              <select
                aria-label="Maladie"
                className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-600"
              >
                <option>Toutes les maladies</option>
                <option>VIH / SIDA</option>
                <option>Paludisme</option>
                <option>Tuberculose</option>
                <option>Choléra</option>
                <option>Rougeole</option>
              </select>

              <select
                aria-label="Région"
                className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-600"
              >
                <option>Toutes les régions</option>
                <option>Analamanga</option>
                <option>Atsinanana</option>
                <option>Boeny</option>
                <option>Diana</option>
              </select>

              <Link
                href="/notifications"
                aria-label="Notifications"
                className="rounded-lg p-2 transition hover:bg-slate-100"
              >
                <Bell size={20} className="text-slate-600" />
              </Link>

              <Link
                href="/profile"
                aria-label="Profil"
                title={user.name}
                className="flex size-9 items-center justify-center rounded-full bg-blue-700 text-xs font-bold text-white"
              >
                {initials}
              </Link>
            </div>
          </div>
        </header>

        {/* SIDEBAR */}
        <aside className="fixed bottom-0 left-0 top-16 w-60 overflow-y-auto border-r border-slate-200 bg-white">
          <nav className="space-y-1 p-3">
            {NAV_ITEMS.map((item) => {
              const active =
                pathname === item.href ||
                pathname.startsWith(`${item.href}/`);
              return (
                <NavItem
                  key={item.href}
                  href={item.href}
                  icon={<item.icon size={19} />}
                  label={item.label}
                  active={active}
                />
              );
            })}

            <div className="mt-4 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => logoutAction()}
                className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50"
              >
                <LogOut size={19} />
                <span>Déconnexion</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* CONTENU */}
        <main className="pt-16 md:ml-60">{children}</main>
      </div>
    </ToastProvider>
  );
}

function NavItem({
  href,
  icon,
  label,
  active = false,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition",
        active
          ? "bg-blue-50 font-medium text-blue-700"
          : "text-slate-600 hover:bg-slate-50",
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}