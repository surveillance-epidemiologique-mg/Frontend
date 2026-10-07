import { ThemeToggle } from "@/components/theme-toggle/component";

interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <main className="relative flex min-h-dvh items-center justify-center bg-bg-app px-4 py-12">
      <div className="absolute right-6 top-6 z-30">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        <div className="mb-6 text-center sm:mb-8">
          <h1 className="text-[1.625rem] font-semibold leading-tight tracking-tight text-text-main">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-1.5 text-sm text-text-muted">{subtitle}</p>
          ) : null}
        </div>
        <div className="rounded-3xl border border-border bg-bg-surface p-5 shadow-card sm:p-8">
          {children}
        </div>
      </div>
    </main>
  );
}
