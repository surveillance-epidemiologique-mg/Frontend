"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  LogOut,
  Menu,
  User,
} from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface NavbarUser {
  name: string;
  email: string;
  role?: string;
}

interface NavbarProps {
  user: NavbarUser;
  onMenuClick: () => void;
}

export function Navbar({ user, onMenuClick }: NavbarProps) {
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
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-bg-surface/80 px-4 backdrop-blur-md sm:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Ouvrir le menu"
        className="grid size-9 shrink-0 place-items-center rounded-lg text-text-muted transition-colors hover:bg-bg-app hover:text-text-main lg:hidden"
      >
        <Menu className="size-5" />
      </button>

      <div className="ml-auto flex items-center gap-1.5">

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
                  {user.role ? (
                    <Badge variant="secondary" className="mt-1.5">
                      {user.role}
                    </Badge>
                  ) : null}
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
      </div>
    </header>
  );
}