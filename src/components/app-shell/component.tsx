"use client";

import { useCallback, useEffect, useState } from "react";
import { Navbar, type NavbarUser } from "@/components/navbar/component";
import { Sidebar } from "@/components/sidebar/component";
import { ToastProvider } from "@/components/toast/component";
import { InactivityProvider } from "@/components/inactivity-provider/component";

interface AppShellProps {
  user: NavbarUser;
  laboratoryCanDeclareCases?: boolean;
  children: React.ReactNode;
}

export function AppShell({
  user,
  laboratoryCanDeclareCases = false,
  children,
}: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMobile = useCallback(
    () => setMobileOpen((prev) => !prev),
    [],
  );
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  // Fermeture par touche Échap quand le tiroir mobile est ouvert
  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeMobile();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen, closeMobile]);

  // Verrouille le scroll du fond pendant que le tiroir est ouvert
  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  return (
    <ToastProvider>
      <InactivityProvider>
        <div className="flex min-h-dvh w-full">
          <Sidebar
            role={user.role}
            laboratoryCanDeclareCases={laboratoryCanDeclareCases}
            mobileOpen={mobileOpen}
            onCloseMobile={closeMobile}
          />

          <div className="flex min-w-0 flex-1 flex-col">
            <Navbar user={user} mobileOpen={mobileOpen} onMenuClick={toggleMobile} />
            <main className="flex-1">
              <div className="mx-auto w-full px-4 py-8 sm:px-6 lg:px-8">
                {children}
              </div>
            </main>
          </div>
        </div>
      </InactivityProvider>
    </ToastProvider>
  );
}
