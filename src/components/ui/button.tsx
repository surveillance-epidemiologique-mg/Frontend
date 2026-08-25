import { Children, cloneElement, isValidElement } from "react";
import type { ButtonHTMLAttributes } from "react";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "danger"
  | "ghost";

type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  asChild?: boolean;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-b from-primary to-primary-hover text-primary-foreground shadow-md shadow-primary/25 hover:-translate-y-px hover:shadow-lg hover:shadow-primary/30 active:translate-y-0 active:shadow-sm focus-visible:outline-primary",
  secondary:
    "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary-hover focus-visible:outline-secondary",
  outline:
    "border border-border bg-bg-surface text-text-main shadow-sm hover:bg-bg-app hover:text-text-main focus-visible:outline-border",
  danger:
    "bg-error text-error-foreground shadow-sm hover:opacity-90 focus-visible:outline-error",
  ghost:
    "bg-transparent text-text-main hover:bg-bg-app focus-visible:outline-border",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-8 rounded-lg px-3 text-xs",
  md: "h-10 rounded-lg px-4 text-sm",
  lg: "h-11 rounded-xl px-6 text-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  loading = false,
  disabled,
  asChild = false,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    className,
  );

  const content = loading ? (
    <>
      <Spinner className="size-4" />
      {children}
    </>
  ) : (
    children
  );

  if (asChild && isValidElement(children)) {
    const child = Children.only(
      children as React.ReactElement<{ className?: string }>,
    );
    return cloneElement(child, {
      className: cn(child.props.className, classes),
    });
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {content}
    </button>
  );
}