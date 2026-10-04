import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0 space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-text-main sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="max-w-3xl text-sm leading-6 text-text-muted">{description}</p>
        ) : null}
      </div>
      {children ? (
        <div className="flex w-full shrink-0 flex-wrap items-center gap-3 sm:w-auto">{children}</div>
      ) : null}
    </div>
  );
}
