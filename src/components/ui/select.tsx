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
        {label && (
            <label
                htmlFor={selectId}
                className={cn(
                    "block text-xs font-semibold uppercase tracking-wider transition-colors",
                    props.disabled
                        ? "text-text-muted/60"
                        : error
                            ? "text-error"
                            : "text-text-muted"
                )}
            >
              {label}
            </label>
        )}

        <div className="group relative flex items-center">
          <select
              id={selectId}
              className={cn(
                  // Style de base & Typo
                  "w-full appearance-none rounded-lg py-2 pl-3.5 pr-10 text-sm font-medium transition-all duration-200",
                  "bg-bg-surface cursor-pointer shadow-sm border",
                  // Couleur du texte dynamique : grisé si c'est le placeholder, sinon couleur principale
                  !props.value && !props.defaultValue ? "text-text-muted" : "text-text-main",
                  // Bordures & Focus
                  error
                      ? "border-error focus:ring-2 focus:ring-error/20"
                      : "border-border hover:border-border/80 focus:ring-2 focus:ring-primary/20",
                  // Focus & Outline
                  "outline-none",
                  // État Désactivé
                  "disabled:cursor-not-allowed disabled:bg-bg-muted/40 disabled:opacity-60 disabled:shadow-none",
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

          {/* Icône animée au focus */}
          <ChevronDown
              aria-hidden="true"
              className={cn(
                  "pointer-events-none absolute right-3 size-4 transition-transform duration-200",
                  "group-focus-within:rotate-180",
                  props.disabled
                      ? "text-text-muted/40"
                      : error
                          ? "text-error"
                          : "text-primary group-hover:scale-110"
              )}
          />
        </div>

        {error && (
            <p className="text-xs font-medium text-error flex items-center gap-1">
              {error}
            </p>
        )}
      </div>
  );
}