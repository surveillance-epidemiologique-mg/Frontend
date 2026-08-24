"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TabItem {
  value: string;
  label: string;
  icon?: LucideIcon;
}

interface TabsProps {
  tabs: TabItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function Tabs({ tabs, value, onChange, className }: TabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Sections"
      className={cn(
        "flex w-full gap-1 overflow-x-auto rounded-xl border border-border bg-bg-app p-1",
        className,
      )}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = tab.value === value;

        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.value)}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200",
              isActive
                ? "bg-bg-surface text-primary shadow-sm"
                : "text-text-muted hover:bg-bg-surface/60 hover:text-text-main",
            )}
          >
            {Icon ? <Icon className="size-4" /> : null}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}