"use client";

import { CircleAlert, Info, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/button/component";
import { Modal } from "@/components/modal/component";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  icon?: LucideIcon;
  tone?: "danger" | "primary";
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirmer",
  tone = "danger",
  loading = false,
  icon,
}: ConfirmDialogProps) {
  const Icon = icon ?? (tone === "danger" ? CircleAlert : Info);
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button
            variant={tone === "danger" ? "danger" : "primary"}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-4">
        <span className={cn(
          "grid size-11 shrink-0 place-items-center rounded-2xl",
          tone === "danger" ? "bg-error/10 text-error" : "bg-primary/10 text-primary",
        )}>
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <p className="min-w-0 pt-1 text-sm leading-relaxed text-text-muted">{description}</p>
      </div>
    </Modal>
  );
}
