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
      className="modal-root fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none bg-transparent p-0 text-text-main outline-none backdrop:bg-bg-inverse/55 backdrop:backdrop-blur-sm"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <div
        className="flex h-full items-center justify-center px-2 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-6"
        onClick={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
      >
        <div
          className={cn(
            "modal-panel relative flex max-h-[min(92dvh,56rem)] min-h-0 w-full flex-col overflow-hidden rounded-[1.5rem] border border-border/80 bg-bg-surface shadow-[0_24px_80px_-24px_rgb(15_23_42/0.45)] ring-1 ring-black/5 dark:ring-white/10 sm:rounded-[1.75rem]",
            SIZE_CLASSES[size],
          )}
        >
          <div className="flex shrink-0 items-start justify-between gap-4 px-5 pb-3 pt-6 sm:px-7 sm:pb-4 sm:pt-7">
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
              className="grid size-9 shrink-0 place-items-center rounded-lg text-text-muted transition-colors hover:bg-bg-muted hover:text-text-main focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:size-10"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="modal-body min-h-0 overflow-y-auto overscroll-contain px-5 pb-6 pt-2 [overflow-wrap:anywhere] sm:px-7 sm:pb-7 sm:pt-2">{children}</div>

          {footer ? (
            <div className="modal-footer flex shrink-0 flex-col-reverse gap-2 border-t border-border/70 bg-bg-surface px-5 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-3 sm:px-7 sm:py-5">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </dialog>
  );
}
