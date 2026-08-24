"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "info" | "warning";

interface ToastInput {
  title: string;
  description?: string;
  variant?: ToastVariant;
}

interface ToastItem extends ToastInput {
  id: number;
}

interface ToastContextValue {
  toast: (input: ToastInput) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_STYLES: Record<
  ToastVariant,
  { icon: typeof Info; className: string }
> = {
  success: {
    icon: CheckCircle2,
    className: "text-success",
  },
  error: {
    icon: XCircle,
    className: "text-error",
  },
  info: {
    icon: Info,
    className: "text-info",
  },
  warning: {
    icon: AlertTriangle,
    className: "text-warning",
  },
};

const AUTO_DISMISS_MS = 4500;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    (input: ToastInput) => {
      const id = ++idRef.current;
      setToasts((prev) => [...prev, { ...input, id }]);

      window.setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, AUTO_DISMISS_MS);
    },
    [],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div
        className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-3"
        aria-live="polite"
        aria-label="Notifications"
      >
        {toasts.map((toast) => {
          const style = VARIANT_STYLES[toast.variant ?? "info"];
          const Icon = style.icon;

          return (
            <div
              key={toast.id}
              className="animate-toast-in pointer-events-auto flex items-start gap-3 rounded-xl border border-border bg-bg-surface p-4 shadow-lg"
              role="status"
            >
              <Icon
                className={cn("mt-0.5 size-5 shrink-0", style.className)}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-text-main">
                  {toast.title}
                </p>
                {toast.description ? (
                  <p className="mt-0.5 text-sm text-text-muted">
                    {toast.description}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                aria-label="Fermer la notification"
                className="grid size-6 shrink-0 place-items-center rounded-md text-text-muted transition-colors hover:bg-bg-app hover:text-text-main"
              >
                <X className="size-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast doit être utilisé dans un <ToastProvider>.");
  }

  return context;
}