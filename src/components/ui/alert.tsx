import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

type AlertVariant = "error" | "success" | "info" | "warning";

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children?: React.ReactNode;
  className?: string;
}

const VARIANT_CONFIG: Record<
  AlertVariant,
  { icon: LucideIcon; classes: string; iconClasses: string }
> = {
  error: {
    icon: XCircle,
    classes: "bg-error/10 border-error/30 text-error",
    iconClasses: "text-error",
  },
  success: {
    icon: CheckCircle2,
    classes: "bg-success/10 border-success/30 text-success",
    iconClasses: "text-success",
  },
  info: {
    icon: Info,
    classes: "bg-info/10 border-info/30 text-info",
    iconClasses: "text-info",
  },
  warning: {
    icon: AlertTriangle,
    classes: "bg-warning/10 border-warning/30 text-warning",
    iconClasses: "text-warning",
  },
};

export function Alert({
  variant = "info",
  title,
  children,
  className,
}: AlertProps) {
  const config = VARIANT_CONFIG[variant];
  const Icon = config.icon;

  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 rounded-xl border px-4 py-3 text-sm",
        config.classes,
        className,
      )}
    >
      <Icon className={cn("mt-0.5 size-5 shrink-0", config.iconClasses)} />
      <div className="min-w-0">
        {title ? (
          <p className="font-semibold">{title}</p>
        ) : null}
        {children ? (
          <div className={cn(title && "mt-0.5")}>{children}</div>
        ) : null}
      </div>
    </div>
  );
}