"use client";

import { useMemo, useRef, useState } from "react";
import { Check, ChevronDown, LayoutDashboard, Search } from "lucide-react";
import { DiseaseIcon } from "@/features/dashboard/components/disease-icon";
import type { Maladie } from "@/features/settings/types";
import { cn } from "@/lib/utils";

interface DiseaseFilterProps {
  diseases: Maladie[];
  selectedId?: string;
  onSelect: (id: string | undefined) => void;
}

export function DiseaseFilter({
  diseases,
  selectedId,
  onSelect,
}: DiseaseFilterProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const selected =
    diseases.find((disease) => String(disease.id) === selectedId) ?? null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return diseases;
    }
    return diseases.filter((disease) =>
      disease.name.toLowerCase().includes(q),
    );
  }, [diseases, query]);

  function select(id: string | undefined) {
    setOpen(false);
    setQuery("");
    onSelect(id);
  }

  return (
    <div className="relative w-full sm:w-80">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full items-center gap-3 rounded-xl border border-border bg-bg-surface px-3.5 py-2.5 text-left shadow-sm transition-colors hover:border-primary/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary-light text-primary">
          <DiseaseIcon name={selected?.iconName} className="size-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-semibold uppercase tracking-wider text-text-muted">
            Maladie
          </span>
          <span className="block truncate text-sm font-medium text-text-main">
            {selected ? selected.name : "Toutes les maladies"}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-text-muted transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {open ? (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            role="listbox"
            aria-label="Choisir une maladie"
            className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-border bg-bg-surface shadow-lg"
          >
            <div className="border-b border-border p-2">
              <div className="flex items-center gap-2 rounded-lg border border-border bg-bg-app px-3">
                <Search className="size-4 shrink-0 text-text-muted" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Rechercher une maladie..."
                  aria-label="Rechercher une maladie"
                  autoFocus
                  className="w-full bg-transparent py-2 text-sm text-text-main placeholder:text-text-subtle focus:outline-none"
                />
              </div>
            </div>

            <div className="max-h-72 overflow-y-auto p-1.5">
              <button
                type="button"
                role="option"
                aria-selected={selectedId === undefined}
                onClick={() => select(undefined)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-bg-app",
                  selectedId === undefined
                    ? "bg-primary-light text-primary"
                    : "text-text-main",
                )}
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-bg-app text-text-muted">
                  <LayoutDashboard className="size-4" />
                </span>
                <span className="flex-1 truncate text-left font-medium">
                  Toutes les maladies
                </span>
                {selectedId === undefined ? (
                  <Check className="size-4 shrink-0" />
                ) : null}
              </button>

              {filtered.map((disease) => {
                const active = String(disease.id) === selectedId;
                return (
                  <button
                    key={disease.id}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => select(String(disease.id))}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-bg-app",
                      active
                        ? "bg-primary-light text-primary"
                        : "text-text-main",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-8 shrink-0 place-items-center rounded-lg",
                        active
                          ? "bg-primary/15 text-primary"
                          : "bg-bg-app text-text-muted",
                      )}
                    >
                      <DiseaseIcon name={disease.iconName} className="size-4" />
                    </span>
                    <span className="flex-1 truncate text-left font-medium">
                      {disease.name}
                    </span>
                    {active ? <Check className="size-4 shrink-0" /> : null}
                  </button>
                );
              })}

              {filtered.length === 0 ? (
                <p className="px-3 py-4 text-center text-sm text-text-muted">
                  Aucune maladie ne correspond à votre recherche.
                </p>
              ) : null}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}