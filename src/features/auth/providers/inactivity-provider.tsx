"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import {
  DEFAULT_INACTIVITY_TIMEOUT_MS,
  useInactivityTimeout,
} from "@/features/auth/hooks/useInactivityTimeout";
import {
  initAuthClient,
  logout,
  SESSION_EXPIRED_PATH,
} from "@/features/auth/services/auth.service";

function resolveInactivityTimeoutMs(): number {
  const raw = process.env.NEXT_PUBLIC_INACTIVITY_TIMEOUT_MINUTES;
  const minutes = raw ? Number(raw) : NaN;

  if (!Number.isFinite(minutes) || minutes <= 0) {
    return DEFAULT_INACTIVITY_TIMEOUT_MS;
  }

  return minutes * 60 * 1000;
}

const INACTIVITY_TIMEOUT_MS = resolveInactivityTimeoutMs();

export function InactivityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    initAuthClient();
  }, []);

  const handleExpire = useCallback(async () => {
    toast({
      title: "Session expirée suite à une longue période d'inactivité",
      variant: "warning",
    });

    await logout();
    router.replace(SESSION_EXPIRED_PATH);
  }, [toast, router]);

  useInactivityTimeout({
    onExpire: handleExpire,
    timeoutMs: INACTIVITY_TIMEOUT_MS,
  });

  return <>{children}</>;
}
