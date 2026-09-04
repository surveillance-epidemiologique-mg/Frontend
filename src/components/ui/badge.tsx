import { cn } from "@/lib/utils";

type BadgeVariant =
  | "default"
  | "secondary"
  | "outline"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "suspect"
  | "probable"
  | "confirmed"
  | "recovered"
  | "deceased";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  default: "bg-bg-app text-text-muted ring-border",
  secondary: "bg-secondary/10 text-secondary ring-secondary/25",
  outline: "bg-transparent text-text-main ring-border",
  success: "bg-success/10 text-success ring-success/25",
  warning: "bg-warning/10 text-warning ring-warning/25",
  danger: "bg-error/10 text-error ring-error/25",
  info: "bg-info/10 text-info ring-info/25",
  suspect: "bg-status-suspect-bg text-status-suspect-fg ring-status-suspect-fg/20",
  probable:
    "bg-status-probable-bg text-status-probable-fg ring-status-probable-fg/20",
  confirmed:
    "bg-status-confirmed-bg text-status-confirmed-fg ring-status-confirmed-fg/20",
  recovered:
    "bg-status-recovered-bg text-status-recovered-fg ring-status-recovered-fg/20",
  deceased:
    "bg-status-deceased-bg text-status-deceased-fg ring-status-deceased-fg/20",
};

const DOT_CLASSES: Record<BadgeVariant, string> = {
  default: "bg-text-muted",
  secondary: "bg-secondary",
  outline: "bg-text-main",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-error",
  info: "bg-info",
  suspect: "bg-status-suspect-fg",
  probable: "bg-status-probable-fg",
  confirmed: "bg-status-confirmed-fg",
  recovered: "bg-status-recovered-fg",
  deceased: "bg-status-deceased-fg",
};

export function Badge({
  variant = "default",
  dot = false,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        VARIANT_CLASSES[variant],
        className,
      )}
      {...props}
    >
      {dot ? (
        <span
          className={cn("size-1.5 rounded-full", DOT_CLASSES[variant])}
          aria-hidden="true"
        />
      ) : null}
      {children}
    </span>
  );
}