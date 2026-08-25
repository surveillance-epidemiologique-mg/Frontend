"use client";

import { useState } from "react";
import { Navbar, type NavbarUser } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { ToastProvider } from "@/components/ui/toast";
import { InactivityProvider } from "@/features/auth/providers/inactivity-provider";

interface AppShellProps {
  isAdmin: boolean;
  user: NavbarUser;
  children: React.ReactNode;
}

export function AppShell({ isAdmin, user, children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <ToastProvider>
      <InactivityProvider>
        <div className="flex min-h-dvh w-full">
          <Sidebar
            isAdmin={isAdmin}
            mobileOpen={mobileOpen}
            onCloseMobile={() => setMobileOpen(false)}
          />

          <div className="flex min-w-0 flex-1 flex-col">
            <Navbar user={user} onMenuClick={() => setMobileOpen(true)} />
            <main className="flex-1">
              <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {children}
              </div>
            </main>
          </div>
        </div>
      </InactivityProvider>
    </ToastProvider>
  );
}