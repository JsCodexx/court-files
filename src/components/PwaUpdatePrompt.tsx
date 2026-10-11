import React, { useCallback, useEffect, useState } from 'react';
import { Button } from './ui/button';
import { useAppShell } from '../hooks/useAppShell';
import { useLocale } from '../i18n/LocaleContext';
import { cn } from '../lib/utils';
import {
  applyWaitingServiceWorkerUpdate,
  register as registerServiceWorker,
  subscribeServiceWorkerUpdates,
} from '../serviceWorkerRegistration';

export function PwaUpdatePrompt() {
  const { t } = useLocale();
  const { showBottomNav } = useAppShell();
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    registerServiceWorker();

    return subscribeServiceWorkerUpdates((registration) => {
      if (registration.waiting) setWaiting(registration.waiting);
    });
  }, []);

  const onUpdate = useCallback(async () => {
    if (applying) return;
    setApplying(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const worker = reg.waiting ?? waiting;
      if (worker) {
        await applyWaitingServiceWorkerUpdate(worker);
      }
      window.location.reload();
    } catch {
      setApplying(false);
    }
  }, [applying, waiting]);

  if (!waiting) return null;

  return (
    <div
      className={cn(
        'no-print fixed inset-x-3 z-[190] mx-auto flex max-w-md flex-col gap-2 rounded-lg border border-border bg-card p-3 shadow-lg sm:flex-row sm:items-center sm:justify-between',
        showBottomNav
          ? 'bottom-[calc(4.75rem+max(0.75rem,env(safe-area-inset-bottom)))]'
          : 'bottom-[max(0.75rem,env(safe-area-inset-bottom))]'
      )}
      role="status"
      aria-live="polite"
    >
      <p className="text-sm text-foreground">{t('pwa.updateAvailable')}</p>
      <Button
        type="button"
        size="sm"
        className="shrink-0"
        disabled={applying}
        onClick={() => void onUpdate()}
      >
        {applying ? t('common.loading') : t('pwa.reload')}
      </Button>
    </div>
  );
}
