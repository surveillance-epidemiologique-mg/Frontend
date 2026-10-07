"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, LogOut, PanelLeftClose, User } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { Avatar } from "@/components/avatar/component";
import { ThemeToggle } from "@/components/theme-toggle/component";
import { getNavForRole } from "@/config/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";

const COLLAPSE_STORAGE_KEY = "episuivi-sidebar-collapsed";

const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function getSnapshot(): boolean {
  try {
    return window.localStorage.getItem(COLLAPSE_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function getServerSnapshot(): boolean {
  return false;
}

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

interface SidebarProps {
  user: {
    name: string;
    email: string;
    role?: string;
  };
  role?: string;
  laboratoryCanDeclareCases?: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({
  user,
  role,
  laboratoryCanDeclareCases = false,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const collapsed = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const items = getNavForRole(role, { laboratoryCanDeclareCases });

  // Ferme le tiroir mobile lors d'une navigation
  useEffect(() => {
    onCloseMobile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setProfileOpen(false);
    }
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function toggleCollapsed() {
    const next = !getSnapshot();
    try {
      window.localStorage.setItem(COLLAPSE_STORAGE_KEY, next ? "1" : "0");
    } catch {
      // stockage indisponible
    }
    emitChange();
  }

  return (
    <>
      {/* Voile (mobile/tablette) : toujours rendu pour une transition en fondu */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 top-16 z-30 bg-black/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onCloseMobile}
        aria-hidden="true"
      />

      <aside
        id="app-sidebar"
        className={cn(
          "fixed bottom-0 left-0 top-16 z-[35] flex w-64 flex-col border-r border-border/70 bg-bg-surface transition-[width,transform] duration-300 ease-in-out",
          "lg:sticky lg:top-0 lg:z-20 lg:h-dvh lg:w-64",
          collapsed && "lg:w-[76px]",
          mobileOpen
            ? "translate-x-0 shadow-2xl"
            : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* En-tête : logo + bouton de réduction (desktop uniquement) */}
        <div
          className={cn(
            "flex h-20 shrink-0 items-center justify-between gap-2 px-3 mt-3 mb-3",
            collapsed && "lg:justify-center lg:px-2",
          )}
        >
          <Link
            href="/dashboard"
            aria-label="Accueil ÉpiSuivi"
            className={cn(
              "flex min-w-0 items-center gap-2 rounded-xl px-1.5 py-2 focus-visible:outline-2 focus-visible:outline-primary",
              collapsed && "lg:hidden"
            )}
          >
            <Image
              src="/images/logo-app.svg"
              alt="Logo ÉpiSuivi"
              width={140}
              height={40}
              priority
              className="object-contain drop-shadow-sm"
            />
          </Link>

          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Agrandir le menu" : "Réduire le menu"}
            title={collapsed ? "Agrandir le menu" : "Réduire le menu"}
            className={cn(
              "relative hidden size-11 shrink-0 place-items-center overflow-hidden rounded-xl text-text-muted focus-visible:outline-2 focus-visible:outline-primary lg:grid",
              !collapsed && "transition-colors hover:bg-bg-surface-hover hover:text-primary",
            )}
          >
            {/* Panel ouvert → PanelLeftClose */}
            {!collapsed && (
              <span
                className="absolute inset-0 grid place-items-center"
                aria-hidden="true"
              >
                <PanelLeftClose className="size-5" />
              </span>
            )}

            {/* Panel fermé → Logo, stable au survol */}
            {collapsed && (
              <Image src="/images/logo-v.svg" alt="" width={56} height={56} priority className="absolute size-14 max-w-none" />
            )}
          </button>
        </div>

        <div className="border-b border-border/60"></div>

        {/* Navigation principale */}
        <nav className={cn("sidebar-scroll min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-5", collapsed && "lg:px-2")}>
          {items.map((item) => {
            const isActive =
              pathname === item.href ||
              pathname?.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                aria-label={item.title}
                title={collapsed ? item.title : undefined}
                className={cn(
                  "group relative flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-primary",
                  collapsed && "lg:justify-center lg:px-0",
                  isActive
                    ? "bg-primary-light text-primary"
                    : "text-text-muted hover:bg-bg-surface-hover hover:text-text-main",
                )}
              >
                {isActive ? <span className="absolute left-0 h-6 w-1 rounded-r-full bg-primary" aria-hidden="true" /> : null}
                <item.icon className="size-5 shrink-0" strokeWidth={isActive ? 2.2 : 1.8} />

                <span
                  className={cn(
                    "truncate",
                    collapsed && "lg:hidden",
                  )}
                >
                  {item.title}
                </span>

              </Link>
            );
          })}
        </nav>

        {/* Pied : informations du compte (le profil complet reste accessible) */}
        <div className="shrink-0 border-t border-border/60 bg-bg-surface p-3">
          <div className="mb-2 lg:hidden">
            <ThemeToggle showLabel />
          </div>
          <div className="mb-2 hidden w-full justify-center lg:flex">
            <ThemeToggle showLabel={!collapsed} compact={collapsed} />
          </div>

          <div ref={profileRef} className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen((open) => !open)}
              aria-haspopup="menu"
              aria-expanded={profileOpen}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-xl border border-border/60 bg-bg-app/60 p-2.5 text-left transition-colors hover:border-primary/30 hover:bg-primary-light/20",
                collapsed && "lg:justify-center lg:p-2",
              )}
            >
              <Avatar name={user.name} size="sm" />
              <span className={cn("min-w-0 flex-1", collapsed && "lg:hidden")}>
                <span className="block truncate text-xs font-semibold text-text-main">
                  {user.name}
                </span>
                <span className="mt-0.5 block truncate text-xs text-text-muted">
                  {user.email}
                </span>
                <span className="mt-0.5 block truncate text-xs font-medium capitalize text-primary">
                  {user.role ?? "Utilisateur"}
                </span>
              </span>
              <ChevronDown
                className={cn(
                  "size-4 shrink-0 text-text-muted transition-transform duration-200",
                  collapsed && "lg:hidden",
                  profileOpen && "rotate-180",
                )}
              />
            </button>

            {profileOpen ? (
              <div
                role="menu"
                className={cn(
                  "animate-scale-in absolute bottom-full z-50 mb-2 w-72 max-w-[calc(100vw-1rem)] overflow-hidden rounded-2xl border border-border/70 bg-bg-surface shadow-xl",
                  collapsed ? "left-full ml-2" : "left-0",
                )}
              >
                <div className="flex items-center gap-3 border-b border-border px-4 py-3.5">
                  <Avatar name={user.name} size="lg" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-text-main">{user.name}</p>
                    <p className="truncate text-xs text-text-muted">{user.email}</p>
                  </div>
                </div>
                <div className="p-1.5">
                  <Link
                    href="/profile"
                    role="menuitem"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-text-main transition-colors hover:bg-bg-app"
                  >
                    <User className="size-4 shrink-0 text-text-muted" />
                    Mes Informations
                  </Link>
                  <form action={logoutAction}>
                    <button
                      type="submit"
                      role="menuitem"
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-error transition-colors hover:bg-error/10"
                    >
                      <LogOut className="size-4 shrink-0" />
                      Déconnexion
                    </button>
                  </form>
                </div>
              </div>
            ) : null}
          </div>

        </div>
      </aside>
    </>
  );
}
