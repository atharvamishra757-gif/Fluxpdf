"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

type Toast = {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactElement;
  variant?: "default" | "destructive";
};

type ToastContextType = {
  toasts: Toast[];
  addToast: (props: Omit<Toast, "id">) => void;
  dismissToast: (toastId?: string) => void;
};

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 4000;

const ToastContext = React.createContext<ToastContextType>({
  toasts: [],
  addToast: () => {},
  dismissToast: () => {},
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const addToast = React.useCallback((props: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2, 11);
    setToasts((prev) => [{ id, ...props }, ...prev].slice(0, TOAST_LIMIT));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, TOAST_REMOVE_DELAY);
  }, []);

  const dismissToast = React.useCallback((toastId?: string) => {
    setToasts((prev) =>
      toastId ? prev.filter((t) => t.id !== toastId) : []
    );
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, dismissToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return React.useContext(ToastContext);
}

const variantStyles = {
  default: "border-border bg-background text-foreground shadow-lg",
  destructive: "border-destructive/50 bg-destructive/10 text-destructive shadow-lg",
};

function ToastItem({ toast }: { toast: Toast }) {
  const { dismissToast } = React.useContext(ToastContext);
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      className={cn(
        "relative flex items-start gap-3 whitespace-nowrap rounded-xl border p-4 pr-3 shadow-xl transition-all duration-300",
        variantStyles[toast.variant ?? "default"],
        hovered && "scale-105"
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-primary/10 text-primary">
        <span className="text-[10px]">!</span>
      </div>
      <div className="flex-1 min-w-0">
        {toast.title && (
          <h4 className="text-sm font-semibold leading-none">{toast.title}</h4>
        )}
        {toast.description && (
          <p className="text-xs opacity-80 leading-relaxed">{toast.description}</p>
        )}
      </div>
      {toast.action && (
        <div className="flex shrink-0 items-center pt-0.5">{toast.action}</div>
      )}
      <button
        onClick={() => dismissToast(toast.id)}
        className="absolute top-2 right-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-sm opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

export function Toaster() {
  const { toasts } = React.useContext(ToastContext);

  return (
    <div className="fixed top-0 z-[100] max-h-[85dvh] w-full sm:max-w-[420px] right-0 flex flex-col gap-2 p-4 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto animate-in slide-in-from-top-2">
          <ToastItem toast={toast} />
        </div>
      ))}
    </div>
  );
}
