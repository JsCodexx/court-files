import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { X } from '../components/icons';
import { cn } from '../lib/utils';

export type ToastVariant = 'error' | 'success' | 'info';

interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: {
    error: (message: string) => void;
    success: (message: string) => void;
    info: (message: string) => void;
  };
}

const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_CLASS: Record<ToastVariant, string> = {
  error: 'border-destructive/40 bg-destructive text-destructive-foreground',
  success: 'border-success/40 bg-success text-success-foreground',
  info: 'border-primary/40 bg-card text-foreground',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const push = useCallback((variant: ToastVariant, message: string) => {
    const text = message.trim();
    if (!text) return;
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setItems((prev) => [...prev.slice(-4), { id, message: text, variant }]);
    window.setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 7000);
  }, []);

  const dismiss = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useMemo(
    () => ({
      error: (message: string) => push('error', message),
      success: (message: string) => push('success', message),
      info: (message: string) => push('info', message),
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 top-[max(0.75rem,env(safe-area-inset-top))] z-[200] flex flex-col items-center gap-2 px-3 sm:top-4"
        aria-live="assertive"
        role="status"
      >
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              'pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg',
              VARIANT_CLASS[item.variant]
            )}
            role="alert"
          >
            <p className="flex-1 leading-snug">{item.message}</p>
            <button
              type="button"
              className="shrink-0 rounded-md opacity-80 hover:opacity-100"
              aria-label="Dismiss"
              onClick={() => dismiss(item.id)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue['toast'] {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx.toast;
}
