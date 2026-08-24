import {
  Activity,
  LayoutDashboard,
  Map,
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
  { title: "Carte Épidémiologiques", href: "/zones", icon: Map },
  { title: "Cas clinique", href: "/cases", icon: Activity },
  { title: "Laboratoire", href: "/lab", icon: Activity },
  {
    title: "Paramètres",
    href: "/settings",
    icon: Users,
    adminOnly: true,
  },
];