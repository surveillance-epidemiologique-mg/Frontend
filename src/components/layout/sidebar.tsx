"use client";

import { useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
  X,
} from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { MAIN_NAV } from "@/config/navigation";
import { cn } from "@/lib/utils";

const COLLAPSE_STORAGE_KEY = "sidebar-collapsed";

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
  isAdmin: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ isAdmin, mobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const collapsed = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  useEffect(() => {
    onCloseMobile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  function toggleCollapsed() {
    const next = !getSnapshot();
    try {
      window.localStorage.setItem(COLLAPSE_STORAGE_KEY, next ? "1" : "0");
    } catch {
      // stockage indisponible
    }
    emitChange();
  }

  const navItems = MAIN_NAV.filter((item) => !item.adminOnly || isAdmin);

  return (
    <>
      {mobileOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-bg-surface transition-[width,transform] duration-300 ease-in-out",
          "lg:sticky lg:top-0 lg:h-dvh",
          collapsed ? "lg:w-[76px]" : "lg:w-64",
          mobileOpen
            ? "translate-x-0 shadow-2xl"
            : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex h-16 shrink-0 items-center gap-1 px-3">
          <Link
            href="/dashboard"
            className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors hover:bg-bg-app"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary-active text-primary-foreground shadow-sm">
              <ShieldCheck className="size-5" />
            </span>
            <span
              className={cn(
                "truncate text-sm font-semibold tracking-tight text-text-main",
                collapsed && "lg:hidden",
              )}
            >
              ÉpiSuivi
            </span>
          </Link>

          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Agrandir le menu" : "Réduire le menu"}
            className="hidden size-9 shrink-0 place-items-center rounded-lg text-text-muted transition-colors hover:bg-bg-app hover:text-text-main lg:grid"
          >
            {collapsed ? (
              <PanelLeftOpen className="size-5" />
            ) : (
              <PanelLeftClose className="size-5" />
            )}
          </button>

          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Fermer le menu"
            className="grid size-9 shrink-0 place-items-center rounded-lg text-text-muted transition-colors hover:bg-bg-app hover:text-text-main lg:hidden"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <p
            className={cn(
              "mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted",
              collapsed && "lg:hidden",
            )}
          >
            Navigation
          </p>

          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200",
                  collapsed && "lg:justify-center lg:px-0",
                  isActive
                    ? "bg-primary-light text-primary"
                    : "text-text-muted hover:bg-bg-app hover:text-text-main",
                )}
              >
                {isActive ? (
                  <span
                    className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary"
                    aria-hidden="true"
                  />
                ) : null}

                <item.icon className="size-5 shrink-0" />

                <span className={cn("truncate", collapsed && "lg:hidden")}>
                  {item.title}
                </span>

                {collapsed ? (
                  <span className="pointer-events-none absolute left-full z-50 ml-3 hidden whitespace-nowrap rounded-lg bg-text-main px-2.5 py-1.5 text-xs font-medium text-bg-surface opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 lg:block">
                    {item.title}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-border p-3">
          <form action={logoutAction} className="mb-3">
            <button
              type="submit"
              aria-label="Déconnexion"
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-text-muted transition-colors hover:bg-error/10 hover:text-error",
                collapsed && "lg:justify-center lg:px-0",
              )}
            >
              <LogOut className="size-5 shrink-0" />
              <span className={cn("truncate", collapsed && "lg:hidden")}>
                Déconnexion
              </span>
            </button>
          </form>
          <div
            className={cn(
              "rounded-xl bg-bg-app p-3",
              collapsed && "lg:p-2",
            )}
          >
            <p
              className={cn(
                "truncate text-xs font-semibold text-text-main",
                collapsed && "lg:hidden",
              )}
            >
              ÉpiSuivi v1.0
            </p>
            <p
              className={cn(
                "mt-0.5 truncate text-[11px] text-text-muted",
                collapsed && "lg:hidden",
              )}
            >
              Surveillance épidémiologique
            </p>
            {collapsed ? (
              <div className="hidden place-items-center lg:grid">
                <ShieldCheck className="size-4 text-text-muted" />
              </div>
            ) : null}
          </div>
        </div>
      </aside>
    </>
  );
}