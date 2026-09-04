"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, LogOut, Menu, User, X } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface NavbarUser {
  name: string;
  email: string;
  role?: string;
}

interface NavbarProps {
  user: NavbarUser;
  mobileOpen: boolean;
  onMenuClick: () => void;
}

export function Navbar({ user, mobileOpen, onMenuClick }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-bg-surface/80 px-4 backdrop-blur-md sm:px-6">
      {/* Bouton d'ouverture/fermeture de la sidebar (mobile & tablette) */}
      <button
        type="button"
        onClick={onMenuClick}
        aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={mobileOpen}
        aria-controls="app-sidebar"
        className="grid size-9 shrink-0 place-items-center rounded-lg text-text-muted transition-colors hover:bg-bg-app hover:text-text-main lg:hidden"
      >
        <span className="relative grid size-5" aria-hidden="true">
          <Menu
            className={cn(
              "absolute inset-0 size-5 transition-all duration-300",
              mobileOpen
                ? "rotate-90 scale-50 opacity-0"
                : "rotate-0 scale-100 opacity-100",
            )}
          />
          <X
            className={cn(
              "absolute inset-0 size-5 transition-all duration-300",
              mobileOpen
                ? "rotate-0 scale-100 opacity-100"
                : "-rotate-90 scale-50 opacity-0",
            )}
          />
        </span>
      </button>

      {/* Gauche : aucun rôle affiché ici (affiché uniquement dans le bloc profil) */}
      <div className="flex-1" />

      {/* Droite : nom + email + menu profil */}
      <div ref={menuRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-haspopup="menu"
          aria-expanded={open}
          className="flex items-center gap-2.5 rounded-full p-1.5 transition-colors hover:bg-bg-app sm:pr-2.5"
        >
          <Avatar name={user.name} />
          <span className="hidden min-w-0 text-left sm:block">
            <span className="block truncate text-sm font-medium text-text-main">
              {user.name}
            </span>
            <span className="block truncate text-xs text-text-muted">
              {user.email}
            </span>
            <span className="block truncate text-[11px] font-medium capitalize text-primary">
              {user.role ?? "Utilisateur"}
            </span>
          </span>
          <ChevronDown
            className={cn(
              "hidden size-4 shrink-0 text-text-muted transition-transform duration-200 sm:block",
              open && "rotate-180",
            )}
          />
        </button>

        {open ? (
          <div
            role="menu"
            className="animate-scale-in absolute right-0 top-full mt-2 w-72 origin-top-right overflow-hidden rounded-2xl border border-border bg-bg-surface shadow-lg"
          >
            <div className="flex items-center gap-3 border-b border-border px-4 py-3.5">
              <Avatar name={user.name} size="lg" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-text-main">
                  {user.name}
                </p>
                <p className="truncate text-xs text-text-muted">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="p-1.5">
              <Link
                href="/profile"
                role="menuitem"
                onClick={() => setOpen(false)}
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
    </header>
  );
}