interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-xl font-semibold tracking-tight text-text-main">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-1.5 text-sm text-text-muted">{subtitle}</p>
          ) : null}
        </div>
        <div className="rounded-xl border border-border bg-bg-surface p-8 shadow-sm">
          {children}
        </div>
      </div>
    </main>
  );
}