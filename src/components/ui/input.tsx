import type { InputHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type InputVariant = "default" | "glass";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: LucideIcon;
  rightSlot?: React.ReactNode;
  error?: string;
  hint?: string;
  variant?: InputVariant;
}

export function Input({
  label,
  icon: Icon,
  rightSlot,
  error,
  hint,
  variant = "default",
  id,
  className,
  ...props
}: InputProps) {
  const inputId =
    id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
  const describedById = error
    ? `${inputId}-error`
    : hint
      ? `${inputId}-hint`
      : undefined;

  return (
    <div className="space-y-1.5">
      {label ? (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-text-main"
        >
          {label}
        </label>
      ) : null}

      <div className="relative">
        {Icon ? (
          <Icon
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-text-muted"
            strokeWidth={1.75}
          />
        ) : null}
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedById}
          className={cn(
            "w-full rounded-xl border bg-bg-surface px-3.5 py-2.5 text-sm text-text-main placeholder:text-text-muted transition-all duration-200 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60",
            Icon && "pl-10",
            rightSlot ? "pr-10" : false,
            variant === "glass" &&
              "border-white/60 bg-white/55 shadow-sm backdrop-blur-sm placeholder:text-text-subtle focus:bg-white/80",
            error
              ? "border-error focus:border-error focus:ring-error/20"
              : "focus:border-primary focus:ring-primary/20",
            className,
          )}
          {...props}
        />
        {rightSlot ? (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            {rightSlot}
          </div>
        ) : null}
      </div>

      {error ? (
        <p id={`${inputId}-error`} className="text-xs text-error">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="text-xs text-text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
