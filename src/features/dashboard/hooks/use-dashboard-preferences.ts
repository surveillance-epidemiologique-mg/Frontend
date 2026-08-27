"use client";

import { useCallback, useEffect, useState } from "react";

export type DashboardSection =
  | "stats"
  | "evolution"
  | "distribution"
  | "alerts"
  | "recentCases";

export interface DashboardPreferences {
  stats: boolean;
  evolution: boolean;
  distribution: boolean;
  alerts: boolean;
  recentCases: boolean;
}

export const DEFAULT_PREFERENCES: DashboardPreferences = {
  stats: true,
  evolution: true,
  distribution: true,
  alerts: true,
  recentCases: true,
};

const STORAGE_KEY = "episuivi-dashboard-prefs";

export function useDashboardPreferences() {
  const [prefs, setPrefs] = useState<DashboardPreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === "object") {
            setPrefs({ ...DEFAULT_PREFERENCES, ...parsed });
          }
        }
      } catch {
        // stockage indisponible
      }
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  const toggle = useCallback((section: DashboardSection) => {
    setPrefs((prev) => {
      const next = { ...prev, [section]: !prev[section] };
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // stockage indisponible
      }
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setPrefs(DEFAULT_PREFERENCES);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PREFERENCES));
    } catch {
      // stockage indisponible
    }
  }, []);

  return { prefs, toggle, reset };
}