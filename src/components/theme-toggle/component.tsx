"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider/component";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  showLabel?: boolean;
  compact?: boolean;
}

export function ThemeToggle({ showLabel = false, compact = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  if (compact) {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? "Activer le mode clair" : "Activer le mode sombre"}
        title={isDark ? "Mode clair" : "Mode sombre"}
        className="grid size-9 shrink-0 place-items-center rounded-lg text-text-muted transition-colors duration-200 hover:bg-bg-app hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        {isDark ? <Moon className="size-4" aria-hidden="true" /> : <Sun className="size-4" aria-hidden="true" />}
      </button>
    );
  }

  if (showLabel) {
    return (
      <label
        className="group flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-sm text-text-main transition-colors duration-300 ease-out hover:bg-bg-app"
      >
        <span className="flex items-center gap-2">
          <span className="relative grid size-4 shrink-0 place-items-center" aria-hidden="true">
            <Sun className={cn("absolute size-4 transition-all duration-300 ease-out", isDark ? "rotate-90 scale-50 opacity-0" : "rotate-0 scale-100 text-text-muted opacity-100")} />
            <Moon className={cn("absolute size-4 transition-all duration-300 ease-out", isDark ? "rotate-0 scale-100 text-primary opacity-100" : "-rotate-90 scale-50 opacity-0")} />
          </span>
          <span>Mode sombre</span>
        </span>
        <input
          type="checkbox"
          checked={isDark}
          onChange={toggleTheme}
          className="peer sr-only"
          aria-label="Activer le mode sombre"
        />
        <span
          aria-hidden="true"
          className={cn(
            "relative h-5 w-9 shrink-0 rounded-full shadow-inner transition-[background-color,box-shadow] duration-300 ease-out peer-focus-visible:ring-2 peer-focus-visible:ring-primary/30",
            isDark ? "bg-primary" : "bg-border",
          )}
        >
          <span
            className={cn(
              "absolute left-0.5 top-0.5 size-4 rounded-full bg-white shadow-sm transition-transform duration-300 ease-out",
              isDark && "translate-x-4",
            )}
          />
        </span>
      </label>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Activer le mode clair" : "Activer le mode sombre"}
      title={isDark ? "Mode clair" : "Mode sombre"}
      className="grid size-9 shrink-0 place-items-center rounded-lg text-text-muted transition-colors hover:bg-bg-app hover:text-text-main"
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}
