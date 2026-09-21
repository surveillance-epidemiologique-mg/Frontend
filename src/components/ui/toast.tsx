"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";

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
    className: "toast-success",
  },
  error: {
    icon: XCircle,
    className: "toast-error",
  },
  info: {
    icon: Info,
    className: "toast-info",
  },
  warning: {
    icon: AlertTriangle,
    className: "toast-warning",
  },
};

// Roughly 180 words/minute, plus time to notice the notification.
function readingTime(input: ToastInput) {
  const words = `${input.title} ${input.description ?? ""}`
    .trim()
    .split(/\s+/).length;
  return Math.max(input.variant === "error" ? 10000 : 7000, 2000 + words * 350);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);
  const timers = useRef(new Map<number, number>());
  const [portalHost, setPortalHost] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Content outside a modal dialog is inert, even in the top layer. Place
    // notifications inside the active dialog so their close button stays usable.
    const syncHost = () => {
      const dialogs =
        document.querySelectorAll<HTMLDialogElement>("dialog[open]");
      setPortalHost(dialogs.item(dialogs.length - 1) ?? document.body);
    };
    syncHost();
    const observer = new MutationObserver(syncHost);
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["open"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach((timer) => window.clearTimeout(timer));
      pending.clear();
    };
  }, []);

  const dismiss = useCallback((id: number) => {
    window.clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    (input: ToastInput) => {
      const id = ++idRef.current;
      setToasts((prev) => [...prev, { ...input, id }]);

      timers.current.set(
        id,
        window.setTimeout(() => dismiss(id), readingTime(input)),
      );
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      {portalHost &&
        createPortal(
          <div
            className="toast-region"
            data-open={toasts.length > 0 ? "true" : "false"}
            aria-live="polite"
            aria-label="Notifications"
          >
            {toasts.map((toast) => {
              const style = VARIANT_STYLES[toast.variant ?? "info"];
              const Icon = style.icon;

              return (
                <div
                  key={toast.id}
                  className={`toast-card animate-toast-in ${style.className}`}
                  role="status"
                >
                  <Icon aria-hidden="true" className="toast-icon" />
                  <div className="min-w-0 flex-1">
                    <p className="toast-title">{toast.title}</p>
                    {toast.description ? (
                      <p className="toast-description">{toast.description}</p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => dismiss(toast.id)}
                    aria-label="Fermer la notification"
                    className="toast-close"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              );
            })}
          </div>,
          portalHost,
        )}
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
