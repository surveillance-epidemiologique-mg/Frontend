import {
  BarChart3,
  Bell,
  BellRing,
  Building2,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Map,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

export const MAIN_NAV: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Statistiques", href: "/statistiques", icon: BarChart3 },
  { title: "Carte épidémiologique", href: "/zones", icon: Map },
  { title: "Alertes", href: "/alerts", icon: Bell },
  { title: "Signalements", href: "/cases", icon: ClipboardList },
  { title: "Établissements", href: "/etablissements", icon: Building2 },
  { title: "Rapports", href: "/reports", icon: FileText },
  { title: "Notifications", href: "/notifications", icon: BellRing },
  {
    title: "Utilisateurs",
    href: "/users",
    icon: Users,
    adminOnly: true,
  },
  {
    title: "Paramètres",
    href: "/settings",
    icon: Settings,
    adminOnly: true,
  },
];