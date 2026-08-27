"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "episuivi-presentation";

export function usePresentationMode() {
  const [presentation, setPresentation] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      try {
        setPresentation(window.localStorage.getItem(STORAGE_KEY) === "1");
      } catch {
        // stockage indisponible
      }
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  const toggle = useCallback(() => {
    setPresentation((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        // stockage indisponible
      }
      return next;
    });
  }, []);

  return { presentation, toggle };
}