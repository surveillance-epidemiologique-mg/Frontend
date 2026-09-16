"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
}

export function Select({
  label,
  options,
  placeholder,
  error,
  id,
  className,
  ...props
}: SelectProps) {
  const selectId =
    id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
      <div className="w-full space-y-1.5">
        {label ? (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-text-main"
          >
            {label}
          </label>
        ) : null}

        <div className="group relative flex items-center">
          <select
              id={selectId}
              className={cn(
                  // Style aligné sur l'Input (arrondi, bordure 1.5px, padding, taille de texte)
                  "w-full appearance-none rounded-xl border-[1.5px] border-border/60",
                  "bg-bg-surface px-3.5 py-2.5 pr-10",
                  "text-md text-text-main outline-none cursor-pointer",
                  "transition-all duration-200",
                  "hover:border-primary",
                  // Couleur du texte dynamique si placeholder actif
                  !props.value && !props.defaultValue ? "text-text-muted/70" : "text-text-main",
                  // Bordures & Focus en cas d'erreur ou normal
                  error
                      ? "border-error focus:border-error focus:ring-2 focus:ring-error/20"
                      : "focus:border-primary focus:ring-2 focus:ring-primary/20",
                  // État Désactivé
                  "disabled:cursor-not-allowed disabled:bg-bg-muted/40 disabled:opacity-60",
                  className
              )}
              {...props}
          >
            {placeholder && (
                <option value="" disabled className="text-text-muted bg-bg-surface">
                  {placeholder}
                </option>
            )}
            {options.map((option) => (
                <option
                    key={option.value}
                    value={option.value}
                    className="text-text-main bg-bg-surface py-1"
                >
                  {option.label}
                </option>
            ))}
          </select>

          {/* Icône flèche */}
          <ChevronDown
              aria-hidden="true"
              className={cn(
                  "pointer-events-none absolute right-3.5 size-4 transition-transform duration-200",
                  "group-focus-within:rotate-180",
                  props.disabled
                      ? "text-text-muted/40"
                      : error
                          ? "text-error"
                          : "text-text-muted"
              )}
          />
        </div>

        {error && (
            <p className="text-xs text-error">
              {error}
            </p>
        )}
      </div>
  );
}