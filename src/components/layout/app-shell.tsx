"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar, type NavbarUser } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { ToastProvider } from "@/components/ui/toast";
import { HelpDialog } from "@/features/help/components/help-dialog";
import { InactivityProvider } from "@/features/auth/providers/inactivity-provider";
import { usePresentationMode } from "@/features/presentation/use-presentation";
import { useKeyboardShortcuts } from "@/features/shortcuts/use-keyboard-shortcuts";
import { useTheme } from "@/features/theme/theme-provider";
import { RouteProgress } from "@/features/ui/route-progress";

interface AppShellProps {
  isAdmin: boolean;
  user: NavbarUser;
  children: React.ReactNode;
}

export function AppShell({ isAdmin, user, children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const router = useRouter();
  const { presentation, toggle: togglePresentation } = usePresentationMode();
  const { toggleTheme } = useTheme();

  useKeyboardShortcuts({
    "/": () => window.dispatchEvent(new Event("episuivi:focus-search")),
    "?": () => setHelpOpen(true),
    t: toggleTheme,
    p: togglePresentation,
    gd: () => router.push("/dashboard"),
    gs: () => router.push("/statistiques"),
    ga: () => router.push("/alerts"),
    gc: () => router.push("/cases"),
    gr: () => router.push("/reports"),
  });

  return (
    <ToastProvider>
      <InactivityProvider>
        <RouteProgress />

        {presentation ? (
          <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>
        ) : (
          <div className="flex min-h-dvh w-full">
            <Sidebar
              isAdmin={isAdmin}
              mobileOpen={mobileOpen}
              onCloseMobile={() => setMobileOpen(false)}
            />

            <div className="flex min-w-0 flex-1 flex-col">
              <Navbar
                user={user}
                onMenuClick={() => setMobileOpen(true)}
                presentation={presentation}
                onTogglePresentation={togglePresentation}
                onOpenHelp={() => setHelpOpen(true)}
              />
              <main className="flex-1">
                <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                  {children}
                </div>
              </main>
            </div>
          </div>
        )}

        <HelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
      </InactivityProvider>
    </ToastProvider>
  );
}