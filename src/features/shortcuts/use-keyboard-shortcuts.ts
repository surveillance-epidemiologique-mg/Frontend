"use client";

import { useEffect, useRef } from "react";

export interface ShortcutHandlers {
  "/"?: () => void;
  "?"?: () => void;
  t?: () => void;
  p?: () => void;
  gd?: () => void;
  gs?: () => void;
  ga?: () => void;
  gc?: () => void;
  gr?: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  const ref = useRef<ShortcutHandlers>(handlers);

  useEffect(() => {
    ref.current = handlers;
  }, [handlers]);

  useEffect(() => {
    let buffer = "";
    let timer: ReturnType<typeof setTimeout> | null = null;

    function handleKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      const key = event.key.toLowerCase();

      if (key === "/") {
        event.preventDefault();
        ref.current["/"]?.();
        return;
      }
      if (key === "?") {
        event.preventDefault();
        ref.current["?"]?.();
        return;
      }
      if (key === "t") {
        event.preventDefault();
        ref.current.t?.();
        return;
      }
      if (key === "p") {
        event.preventDefault();
        ref.current.p?.();
        return;
      }
      if (key === "g") {
        buffer = "g";
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          buffer = "";
        }, 1500);
        return;
      }
      if (buffer === "g" && ["d", "s", "a", "c", "r"].includes(key)) {
        buffer = "";
        ref.current[`g${key}` as keyof ShortcutHandlers]?.();
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);
}