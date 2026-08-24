import { cn } from "@/lib/utils";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Textarea({
  label,
  error,
  hint,
  id,
  className,
  ...props
}: TextareaProps) {
  const textareaId =
    id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
  const describedById = error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined;

  return (
    <div className="space-y-1.5">
      {label ? (
        <label
          htmlFor={textareaId}
          className="block text-sm font-medium text-text-main"
        >
          {label}
        </label>
      ) : null}

      <textarea
        id={textareaId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedById}
        className={cn(
          "w-full rounded-lg border bg-bg-surface px-3.5 py-2.5 text-sm text-text-main placeholder:text-text-muted transition-colors duration-200 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60",
          error
            ? "border-error focus:border-error focus:ring-error/20"
            : "border-border focus:border-primary focus:ring-primary/20",
          className,
        )}
        {...props}
      />

      {error ? (
        <p id={`${textareaId}-error`} className="text-xs text-error">
          {error}
        </p>
      ) : hint ? (
        <p id={`${textareaId}-hint`} className="text-xs text-text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}