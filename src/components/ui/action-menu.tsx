"use client";

import { useEffect, useRef, useState } from "react";
import { MoreVertical } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ActionMenuItem {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  danger?: boolean;
}

interface ActionMenuProps {
  items: ActionMenuItem[];
  ariaLabel?: string;
}

export function ActionMenu({ items, ariaLabel = "Actions" }: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

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
  }, [open]);

  return (
    <div ref={menuRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={ariaLabel}
        className="grid size-8 place-items-center rounded-lg text-text-muted transition-colors hover:bg-bg-app hover:text-text-main"
      >
        <MoreVertical className="size-4" />
      </button>

      {open ? (
        <div
          role="menu"
          className="animate-scale-in absolute right-0 top-full z-50 mt-1 w-52 origin-top-right overflow-hidden rounded-xl border border-border bg-bg-surface p-1 shadow-lg"
        >
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                onClick={() => {
                  item.onClick();
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                  item.danger
                    ? "text-error hover:bg-error/10"
                    : "text-text-main hover:bg-bg-app",
                )}
              >
                <Icon className="size-4 shrink-0 text-text-muted" />
                {item.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}