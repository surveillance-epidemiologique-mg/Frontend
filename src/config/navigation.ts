import {
  Activity,
  FlaskConical,
  LayoutDashboard,
  Map,
  Settings,
  type LucideIcon,
} from "lucide-react";

export const ROLES = {
  ADMINISTRATEUR: "Administrateur",
  MEDECIN: "Medecin",
  LABORATOIRE: "Laboratoire",
} as const;

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

const DASHBOARD: NavItem = {
  title: "Dashboard",
  href: "/dashboard",
  icon: LayoutDashboard,
};

const CARTE: NavItem = {
  title: "Carte épidémique",
  href: "/zones",
  icon: Map,
};

const CAS_CLINIQUE: NavItem = {
  title: "Cas clinique",
  href: "/cases",
  icon: Activity,
};

const LABORATOIRE: NavItem = {
  title: "Laboratoire",
  href: "/lab",
  icon: FlaskConical,
};

const PARAMETRE: NavItem = {
  title: "Paramètre",
  href: "/settings",
  icon: Settings,
};

export const NAV_BY_ROLE: Record<string, NavItem[]> = {
  [ROLES.ADMINISTRATEUR]: [
    DASHBOARD,
    CARTE,
    CAS_CLINIQUE,
    LABORATOIRE,
    PARAMETRE,
  ],
  [ROLES.MEDECIN]: [DASHBOARD, CARTE, CAS_CLINIQUE],
  [ROLES.LABORATOIRE]: [DASHBOARD, CARTE, LABORATOIRE],
};

export function getNavForRole(role?: string): NavItem[] {
  return NAV_BY_ROLE[role ?? ""] ?? [DASHBOARD];
}