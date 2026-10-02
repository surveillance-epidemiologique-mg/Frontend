import type { LucideIcon } from "lucide-react";
import Image from "next/image";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  children?: React.ReactNode;
  imageSrc?: string;
  imageAlt?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  children,
  imageSrc,
  imageAlt = "",
}: EmptyStateProps) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-bg-surface px-4 py-12 text-center sm:px-6 sm:py-16">
      {imageSrc ? (
        <Image
          src={imageSrc}
          alt={imageAlt}
          width={180}
          height={140}
          className="h-auto w-36 max-w-full object-contain sm:w-44"
        />
      ) : (
        <span className="grid size-12 place-items-center rounded-full bg-primary-light text-primary">
          <Icon className="size-6" />
        </span>
      )}
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
