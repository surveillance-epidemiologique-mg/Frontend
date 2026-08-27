"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, MapPin, Pill, Search, X } from "lucide-react";
import { fetchReportOptions } from "@/features/reports/services/reports";
import { fetchCentres } from "@/features/settings/services/settings";
import type { SignalementOptions } from "@/features/cases/types";
import type { CentreSante } from "@/types/auth";

interface SearchResult {
  kind: "maladie" | "region" | "etablissement";
  label: string;
  sublabel?: string;
  href: string;
}

export function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<SignalementOptions | null>(null);
  const [centres, setCentres] = useState<CentreSante[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleFocus() {
      inputRef.current?.focus();
    }
    window.addEventListener("episuivi:focus-search", handleFocus);
    return () => window.removeEventListener("episuivi:focus-search", handleFocus);
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([fetchReportOptions(), fetchCentres()])
      .then(([opt, cen]) => {
        if (active) {
          setOptions(opt);
          setCentres(cen);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const results = useMemo<SearchResult[]>(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) {
      return [];
    }
    const out: SearchResult[] = [];

    for (const maladie of options?.maladies ?? []) {
      if (maladie.name.toLowerCase().includes(q)) {
        out.push({
          kind: "maladie",
          label: maladie.name,
          sublabel: "Maladie",
          href: `/statistiques?maladieId=${maladie.id}`,
        });
      }
    }
    for (const region of options?.regions ?? []) {
      if (region.name.toLowerCase().includes(q)) {
        out.push({
          kind: "region",
          label: region.name,
          sublabel: "Région",
          href: `/statistiques?regionId=${region.id}`,
        });
      }
      for (const district of region.districts ?? []) {
        if (district.name.toLowerCase().includes(q)) {
          out.push({
            kind: "region",
            label: district.name,
            sublabel: `${region.name} · District`,
            href: `/statistiques?regionId=${region.id}&districtId=${district.id}`,
          });
        }
      }
    }
    for (const centre of centres) {
      if (centre.name.toLowerCase().includes(q)) {
        out.push({
          kind: "etablissement",
          label: centre.name,
          sublabel: centre.zone?.name ?? "Établissement",
          href: "/etablissements",
        });
      }
    }
    return out.slice(0, 8);
  }, [query, options, centres]);

  function navigate(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  return (
    <div className="relative w-full max-w-md">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setOpen(false);
          }
          if (e.key === "Enter" && results.length > 0) {
            navigate(results[0].href);
          }
        }}
        placeholder="Recherche globale… ( / )"
        aria-label="Recherche globale"
        className="h-10 w-full rounded-lg border border-border bg-bg-app pl-9 pr-9 text-sm text-text-main placeholder:text-text-subtle transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
      {query ? (
        <button
          type="button"
          onClick={() => {
            setQuery("");
            setOpen(false);
          }}
          aria-label="Effacer"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main"
        >
          <X className="size-4" />
        </button>
      ) : null}

      {open && results.length > 0 ? (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-border bg-bg-surface shadow-lg">
            {results.map((result, index) => (
              <button
                key={`${result.kind}-${result.label}-${index}`}
                type="button"
                onClick={() => navigate(result.href)}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-bg-app"
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-bg-app text-text-muted">
                  {result.kind === "maladie" ? (
                    <Pill className="size-4" />
                  ) : result.kind === "region" ? (
                    <MapPin className="size-4" />
                  ) : (
                    <Building2 className="size-4" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-text-main">
                    {result.label}
                  </span>
                  <span className="block truncate text-xs text-text-muted">
                    {result.sublabel}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}