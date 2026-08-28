"use client";

import { useCallback, useEffect, useState } from "react";

export type DashboardSection =
  | "stats"
  | "map"
  | "evolution"
  | "distribution"
  | "diseases"
  | "alerts"
  | "priorityZones"
  | "establishments"
  | "recentCases";

export interface DashboardPreferences {
  stats: boolean;
  map: boolean;
  evolution: boolean;
  distribution: boolean;
  diseases: boolean;
  alerts: boolean;
  priorityZones: boolean;
  establishments: boolean;
  recentCases: boolean;
}

export const DEFAULT_PREFERENCES: DashboardPreferences = {
  stats: true,
  map: true,
  evolution: true,
  distribution: true,
  diseases: true,
  alerts: true,
  priorityZones: true,
  establishments: true,
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