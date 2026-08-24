import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  children?: React.ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  children,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-bg-surface px-6 py-16 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-primary-light text-primary">
        <Icon className="size-6" />
      </span>
      <h2 className="mt-4 text-lg font-semibold tracking-tight text-text-main">
        {title}
      </h2>
      <p className="mt-1 max-w-md text-sm leading-relaxed text-text-muted">
        {description}
      </p>
      {children ? <div className="mt-6">{children}</div> : null}
    </div>
  );
}