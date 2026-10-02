"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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

const MENU_WIDTH = 208;

/**
 * Menu d'actions rendu en PORTAL (position: fixed) pour ne jamais être
 * tronqué/masqué par un conteneur parent à `overflow` (ex: tableau).
 */
export function ActionMenu({ items, ariaLabel = "Actions" }: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
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

  function toggle() {
    if (!open) {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (rect) {
        const left = Math.min(rect.left, window.innerWidth - MENU_WIDTH - 8);
        setPos({ top: rect.bottom + 4, left });
      }
    }
    setOpen((prev) => !prev);
  }

  const menu =
    open && pos ? (
      <div
        ref={menuRef}
        role="menu"
        className="animate-scale-in fixed z-[1300] w-52 origin-top-left overflow-hidden rounded-xl border border-border bg-bg-surface p-1 shadow-lg"
        style={{ top: pos.top, left: pos.left }}
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
    ) : null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={ariaLabel}
        className="grid size-8 place-items-center rounded-lg text-text-muted transition-colors hover:bg-bg-app hover:text-text-main"
      >
        <MoreVertical className="size-4" />
      </button>
      {menu ? createPortal(menu, document.body) : null}
    </>
  );
}