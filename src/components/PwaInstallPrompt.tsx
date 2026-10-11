import React, { useCallback, useEffect, useState } from 'react';
import { Smartphone, X } from './icons';
import { useAuth } from '../context/AuthContext';
import { useAppShell } from '../hooks/useAppShell';
import { useLocale } from '../i18n/LocaleContext';
import { cn } from '../lib/utils';
import { Button } from './ui/button';

const SNOOZE_KEY = 'cf_pwa_install_snooze_until';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

function isSnoozed(): boolean {
  try {
    const raw = localStorage.getItem(SNOOZE_KEY);
    if (!raw) return false;
    const until = Number(raw);
    if (Number.isNaN(until)) return false;
    return Date.now() < until;
  } catch {
    return false;
  }
}

function snooze(days: number) {
  try {
    localStorage.setItem(
      SNOOZE_KEY,
      String(Date.now() + days * 24 * 60 * 60 * 1000)
    );
  } catch {
    /* ignore */
  }
}

function isIosBrowserNeedingHint(): boolean {
  if (typeof window === 'undefined') return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  if (nav.standalone) return false;
  const ua = nav.userAgent || '';
  const ios = /iPad|iPhone|iPod/.test(ua);
  if (!ios) return false;
  // iPadOS desktop UA
  if (ua.includes('Macintosh') && 'ontouchend' in document) return true;
  return ios;
}

/** Prompt install after login (Chromium) or show iOS Add to Home Screen steps. */
export function PwaInstallPrompt() {
  const { t } = useLocale();
  const { user, authReady } = useAuth();
  const { showBottomNav, isStandalone } = useAppShell();
  const [deferred, setDeferred] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [iosHint, setIosHint] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isStandalone || isSnoozed()) return;

    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', onBip);
    return () => window.removeEventListener('beforeinstallprompt', onBip);
  }, [isStandalone]);

  useEffect(() => {
    if (!authReady || !user || isStandalone || isSnoozed()) {
      setVisible(false);
      return;
    }
    if (deferred) {
      setVisible(true);
      return;
    }
    if (isIosBrowserNeedingHint()) {
      setIosHint(true);
      setVisible(true);
    }
  }, [authReady, user, deferred, isStandalone]);

  const dismiss = useCallback(() => {
    snooze(14);
    setVisible(false);
    setDeferred(null);
    setIosHint(false);
  }, []);

  const onInstall = useCallback(async () => {
    if (!deferred) return;
    try {
      await deferred.prompt();
      await deferred.userChoice;
    } catch {
      /* ignore */
    }
    setDeferred(null);
    setVisible(false);
  }, [deferred]);

  if (!visible || isStandalone) return null;

  const showChromium = Boolean(deferred);
  const showIos = iosHint && !deferred;

  if (!showChromium && !showIos) return null;

  return (
    <div
      className={cn(
        'no-print fixed inset-x-3 z-[185] mx-auto max-w-md animate-rise-in rounded-lg border border-primary/30 bg-card p-4 shadow-lg',
        showBottomNav
          ? 'bottom-[calc(4.75rem+max(0.75rem,env(safe-area-inset-bottom)))]'
          : 'bottom-[max(0.75rem,env(safe-area-inset-bottom))]'
      )}
      role="dialog"
      aria-labelledby="pwa-install-title"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Smartphone className="h-5 w-5" weight="duotone" />
        </span>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h2
              id="pwa-install-title"
              className="font-display text-base font-semibold leading-snug"
            >
              {showIos ? t('pwa.installIosTitle') : t('pwa.installTitle')}
            </h2>
            <button
              type="button"
              className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
              onClick={dismiss}
              aria-label={t('pwa.installDismiss')}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-sm text-muted-foreground">
            {showIos ? t('pwa.installIosSteps') : t('pwa.installLede')}
          </p>
          <div className="flex flex-col gap-2 pt-1 sm:flex-row">
            {showChromium && (
              <Button type="button" size="sm" className="w-full sm:w-auto" onClick={onInstall}>
                {t('pwa.installCta')}
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              variant={showChromium ? 'outline' : 'default'}
              className="w-full sm:w-auto"
              onClick={dismiss}
            >
              {t('pwa.installDismiss')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
