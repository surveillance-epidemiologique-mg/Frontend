"use client";

import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "md" | "lg";
}

const SIZE_CLASSES = {
  md: "max-w-lg",
  lg: "max-w-2xl",
};

let openModals = 0;
let previousOverflow = "";

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    const dialog = dialogRef.current;
    dialog?.showModal();
    if (openModals === 0) previousOverflow = document.body.style.overflow;
    openModals += 1;
    document.body.style.overflow = "hidden";

    return () => {
      dialog?.close();
      openModals -= 1;
      if (openModals === 0) document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <dialog
      ref={dialogRef}
      className="modal-root fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none bg-transparent p-0 text-text-main outline-none backdrop:bg-slate-950/55 backdrop:backdrop-blur-sm"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <div
        className="flex h-full items-end justify-center px-2 pt-[max(0.5rem,env(safe-area-inset-top))] pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:items-center sm:p-6"
        onClick={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
      >
        <div
          className={cn(
            "modal-panel relative flex max-h-full min-h-0 w-full flex-col overflow-hidden rounded-2xl border border-border bg-bg-surface shadow-2xl sm:rounded-3xl",
            SIZE_CLASSES[size],
          )}
        >
          <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border bg-primary/5 px-4 py-3 sm:px-6 sm:py-5">
            <div className="min-w-0">
              <h2
                id={titleId}
                className="text-base font-semibold tracking-tight text-text-main [overflow-wrap:anywhere] sm:text-lg"
              >
                {title}
              </h2>
              {description ? (
                <p id={descriptionId} className="mt-1 max-h-[20dvh] overflow-y-auto text-sm leading-relaxed text-text-muted [overflow-wrap:anywhere]">{description}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer"
              className="grid size-11 shrink-0 place-items-center rounded-xl border border-border bg-bg-surface text-text-muted shadow-sm transition-colors hover:border-primary/30 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="modal-body min-h-0 overflow-y-auto overscroll-contain px-4 py-4 [overflow-wrap:anywhere] sm:px-6 sm:py-6">{children}</div>

          {footer ? (
            <div className="modal-footer flex shrink-0 flex-col-reverse gap-2 border-t border-border bg-bg-muted/40 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-3 sm:px-6 sm:py-4">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </dialog>
  );
}
