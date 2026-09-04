"use client";

import { useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { getNavForRole } from "@/config/navigation";
import { cn } from "@/lib/utils";

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
  role?: string;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ role, mobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const collapsed = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const items = getNavForRole(role);

  // Ferme le tiroir mobile lors d'une navigation
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
          "fixed bottom-0 left-0 top-16 z-[35] flex w-64 flex-col border-r border-border bg-bg-surface transition-[width,transform] duration-300 ease-in-out",
          "lg:sticky lg:top-0 lg:z-0 lg:h-dvh lg:w-64",
          collapsed && "lg:w-[76px]",
          mobileOpen
            ? "translate-x-0 shadow-2xl"
            : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* En-tête : logo + bouton de réduction (desktop uniquement) */}
        <div className="flex h-16 shrink-0 items-center justify-between gap-1 px-3">
          <Link
            href="/dashboard"
            className="flex min-w-0 items-center gap-2.5 rounded-full px-2 py-1.5 transition-colors hover:bg-bg-app"
          >
            <span
              className={cn(
                "truncate text-xl font-semibold tracking-tight text-primary",
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
            className="hidden size-9 shrink-0 place-items-center rounded-full text-text-muted transition-colors hover:bg-bg-app hover:text-text-main lg:grid"
          >
            <span className="relative grid size-5" aria-hidden="true">
              <PanelLeftClose
                className={cn(
                  "absolute inset-0 size-5 transition-all duration-300",
                  collapsed
                    ? "-rotate-90 scale-50 opacity-0"
                    : "rotate-0 scale-100 opacity-100",
                )}
              />
              <PanelLeftOpen
                className={cn(
                  "absolute inset-0 size-5 transition-all duration-300",
                  collapsed
                    ? "rotate-0 scale-100 opacity-100"
                    : "rotate-90 scale-50 opacity-0",
                )}
              />
            </span>
          </button>
        </div>

        {/* Navigation principale */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {items.map((item) => {
            const isActive =
              pathname === item.href ||
              pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors duration-200",
                  collapsed && "lg:justify-center lg:px-0",
                  isActive
                    ? "bg-primary text-white"
                    : "text-text-muted hover:bg-bg-app hover:text-text-main",
                )}
              >
                <item.icon className="size-5 shrink-0" />

                <span
                  className={cn(
                    "truncate",
                    collapsed && "lg:hidden",
                  )}
                >
                  {item.title}
                </span>

                {collapsed ? (
                  <span className="pointer-events-none absolute left-full z-50 ml-3 invisible whitespace-nowrap rounded-lg bg-text-main px-2.5 py-1.5 text-xs font-medium text-bg-surface opacity-0 shadow-lg transition-opacity duration-150 group-hover:visible group-hover:opacity-100">
                    {item.title}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        {/* Pied */}
        <div className="shrink-0 border-t border-border p-3">
          <div className={cn("rounded-xl bg-bg-app p-3", collapsed && "lg:p-2")}>
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
          </div>
        </div>
      </aside>
    </>
  );
}