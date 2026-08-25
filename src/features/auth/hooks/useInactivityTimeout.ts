"use client";

import { useEffect } from "react";

const ACTIVITY_EVENTS = [
  "mousemove",
  "keydown",
  "click",
  "scroll",
  "touchstart",
] as const;

export const DEFAULT_INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000;

interface UseInactivityTimeoutOptions {
  timeoutMs?: number;
  enabled?: boolean;
  onExpire: () => void;
}

export function useInactivityTimeout({
  timeoutMs = DEFAULT_INACTIVITY_TIMEOUT_MS,
  enabled = true,
  onExpire,
}: UseInactivityTimeoutOptions): void {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    let timer: ReturnType<typeof setTimeout>;

    function reset() {
      clearTimeout(timer);
      timer = setTimeout(() => onExpire(), timeoutMs);
    }

    function handleActivity() {
      reset();
    }

    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, handleActivity, { passive: true });
    }
    reset();

    return () => {
      clearTimeout(timer);
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, handleActivity);
      }
    };
  }, [timeoutMs, enabled, onExpire]);
}
