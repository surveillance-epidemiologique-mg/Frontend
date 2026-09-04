"use client";

import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  cell: (row: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
  align?: "left" | "right" | "center";
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  getRowId: (row: T) => string;
  loading?: boolean;
  pageSize?: number;
  onRowClick?: (row: T) => void;
  emptyState?: React.ReactNode;
  ariaLabel?: string;
}

const ALIGN_CLASSES = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
};

export function DataTable<T>({
  columns,
  data,
  getRowId,
  loading = false,
  pageSize = 10,
  onRowClick,
  emptyState,
  ariaLabel,
}: DataTableProps<T>) {
  const [page, setPage] = useState(0);

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const start = safePage * pageSize;

  const visibleRows = useMemo(
    () => data.slice(start, start + pageSize),
    [data, start, pageSize],
  );

  const skeletonRows = Array.from({ length: pageSize });

  return (
      <div className="flex flex-col">
        <div className="overflow-x-auto">
          <table
              className="w-full min-w-full border-collapse text-sm"
              aria-label={ariaLabel}
          >
            <thead>
            <tr className="border-b border-border bg-bg-muted">
              {columns.map((column) => (
                  <th
                      key={column.key}
                      scope="col"
                      className={cn(
                          "whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted",
                          ALIGN_CLASSES[column.align ?? "left"],
                          column.headerClassName,
                      )}
                  >
                    {column.header}
                  </th>
              ))}
            </tr>
            </thead>
            <tbody className="divide-y divide-border">
            {loading
                ? skeletonRows.map((_, index) => (
                    <tr key={index}>
                      {columns.map((column) => (
                          <td key={column.key} className="px-4 py-3.5">
                            <Skeleton className="h-4 w-full max-w-[10rem]" />
                          </td>
                      ))}
                    </tr>
                ))
                : visibleRows.map((row) => (
                    <tr
                        key={getRowId(row)}
                        onClick={
                          onRowClick ? () => onRowClick(row) : undefined
                        }
                        className={cn(
                            "transition-colors duration-150 hover:bg-bg-surface-hover",
                            onRowClick && "cursor-pointer",
                        )}
                    >
                      {columns.map((column) => (
                          <td
                              key={column.key}
                              className={cn(
                                  "whitespace-nowrap px-4 py-3.5 text-text-main",
                                  ALIGN_CLASSES[column.align ?? "left"],
                                  column.className,
                              )}
                          >
                            {column.cell(row)}
                          </td>
                      ))}
                    </tr>
                ))}
            </tbody>
          </table>

          {!loading && data.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                {emptyState ?? (
                    <p className="text-sm text-text-muted">Aucune donnée.</p>
                )}
              </div>
          ) : null}
        </div>

        {data.length > 0 ? (
            <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-4 py-3 sm:flex-row">
              <p className="text-xs text-text-muted">
                {data.length === 0
                    ? "0 résultat"
                    : `${start + 1}–${Math.min(start + pageSize, data.length)} sur ${data.length} résultats`}
              </p>

              <div className="flex items-center gap-1">
                <PaginationButton
                    onClick={() => setPage(0)}
                    disabled={safePage === 0}
                    ariaLabel="Première page"
                >
                  <ChevronsLeft className="size-4" />
                </PaginationButton>
                <PaginationButton
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={safePage === 0}
                    ariaLabel="Page précédente"
                >
                  <ChevronLeft className="size-4" />
                </PaginationButton>

                <span className="px-2 text-xs font-medium text-text-main">
              {safePage + 1} / {totalPages}
            </span>

                <PaginationButton
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={safePage >= totalPages - 1}
                    ariaLabel="Page suivante"
                >
                  <ChevronRight className="size-4" />
                </PaginationButton>
                <PaginationButton
                    onClick={() => setPage(totalPages - 1)}
                    disabled={safePage >= totalPages - 1}
                    ariaLabel="Dernière page"
                >
                  <ChevronsRight className="size-4" />
                </PaginationButton>
              </div>
            </div>
        ) : null}
      </div>
  );
}

function PaginationButton({
  children,
  onClick,
  disabled,
  ariaLabel,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className="grid size-8 place-items-center rounded-lg border border-border text-text-muted transition-colors duration-150 hover:border-primary/30 hover:bg-bg-app hover:text-text-main disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}