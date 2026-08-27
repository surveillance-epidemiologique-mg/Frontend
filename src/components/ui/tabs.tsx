"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TabItem {
  value: string;
  label: string;
  icon?: LucideIcon;
  badge?: string | number;
  disabled?: boolean;
}

interface TabsProps {
  tabs: TabItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function Tabs({ tabs, value, onChange, className }: TabsProps) {
  const tabsRef = React.useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    const enabledIndices = tabs
      .map((t, i) => (!t.disabled ? i : -1))
      .filter((i) => i !== -1);
    const currentPos = enabledIndices.indexOf(index);

    let nextIndex = index;

    if (e.key === "ArrowRight") {
      e.preventDefault();
      nextIndex = enabledIndices[(currentPos + 1) % enabledIndices.length];
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      nextIndex =
        enabledIndices[(currentPos - 1 + enabledIndices.length) % enabledIndices.length];
    } else if (e.key === "Home") {
      e.preventDefault();
      nextIndex = enabledIndices[0];
    } else if (e.key === "End") {
      e.preventDefault();
      nextIndex = enabledIndices[enabledIndices.length - 1];
    }

    if (nextIndex !== index) {
      onChange(tabs[nextIndex].value);
      tabsRef.current[nextIndex]?.focus();
    }
  };

  return (
    <div
      role="tablist"
      aria-label="Sections"
      className={cn(
        "no-scrollbar relative flex items-center gap-6 overflow-x-auto border-b border-border/60 select-none",
        className
      )}
    >
      {tabs.map((tab, index) => {
        const Icon = tab.icon;
        const isActive = tab.value === value;
        const isDisabled = tab.disabled;

        return (
          <button
            key={tab.value}
            ref={(el) => {
              tabsRef.current[index] = el;
            }}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${tab.value}`}
            tabIndex={isActive ? 0 : -1}
            disabled={isDisabled}
            onClick={() => !isDisabled && onChange(tab.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={cn(
              "group relative inline-flex shrink-0 items-center justify-center gap-2 pb-3 text-sm font-medium transition-colors outline-none",
              isDisabled
                ? "cursor-not-allowed opacity-40"
                : "cursor-pointer",

              isActive
                ? "text-primary font-semibold"
                : "text-text-muted hover:text-text-main"
            )}
          >
            {/* Icône */}
            {Icon ? (
              <Icon
                className={cn(
                  "size-4 transition-colors",
                  isActive
                    ? "text-primary stroke-[2.25]"
                    : "text-text-muted group-hover:text-text-main stroke-[1.75]"
                )}
              />
            ) : null}

            {/* Libellé */}
            <span>{tab.label}</span>

            {/* Badge */}
            {tab.badge !== undefined ? (
              <span
                className={cn(
                  "inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-bold tracking-tight transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "bg-bg-muted text-text-muted group-hover:text-text-main"
                )}
              >
                {tab.badge}
              </span>
            ) : null}

            {/* Ligne inférieure (Indicateur sous l'onglet actif) */}
            {isActive ? (
              <span className="absolute bottom-0 left-0 h-0.5 w-full bg-primary rounded-t-full transition-all duration-300" />
            ) : (
              <span className="absolute bottom-0 left-0 h-0.5 w-full bg-transparent group-hover:bg-border/60 transition-all duration-300" />
            )}
          </button>
        );
      })}
    </div>
  );
}