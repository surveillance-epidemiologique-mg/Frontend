"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/features/theme/theme-provider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

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