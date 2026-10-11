import React, { useCallback, useEffect, useState } from 'react';
import { Smartphone, X } from './icons';
import { useAuth } from '../context/AuthContext';
import { useAppShell } from '../hooks/useAppShell';
import { useLocale } from '../i18n/LocaleContext';
import { cn } from '../lib/utils';
import {
  clearDeferredInstallPrompt,
  getDeferredInstallPrompt,
  subscribeInstallPrompt,
  type BeforeInstallPromptEvent,
} from '../pwa/captureInstallPrompt';
import { Button } from './ui/button';

const SNOOZE_KEY = 'cf_pwa_install_snooze_until';

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

function isIosDevice(): boolean {
  if (typeof window === 'undefined') return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  if (nav.standalone) return false;
  const ua = nav.userAgent || '';
  if (/iPad|iPhone|iPod/.test(ua)) return true;
  return ua.includes('Macintosh') && 'ontouchend' in document;
}

function isAndroidDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android/i.test(window.navigator.userAgent || '');
}

type PwaInstallPromptProps = {
  /** Public marketing pages — show mobile hints without login. */
  guest?: boolean;
};

/** Prompt install (Chromium) or show Add to Home Screen steps on iOS / Android. */
export function PwaInstallPrompt({ guest = false }: PwaInstallPromptProps) {
  const { t } = useLocale();
  const { user, authReady } = useAuth();
  const { showBottomNav, isStandalone, isNarrow } = useAppShell();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    () => getDeferredInstallPrompt()
  );
  const [iosHint, setIosHint] = useState(false);
  const [androidHint, setAndroidHint] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    return subscribeInstallPrompt(() => {
      setDeferred(getDeferredInstallPrompt());
    });
  }, []);

  useEffect(() => {
    if (isStandalone || isSnoozed()) {
      setVisible(false);
      return;
    }

    const loggedIn = Boolean(authReady && user);
    if (guest && loggedIn) {
      setVisible(false);
      return;
    }
    if (!guest && !loggedIn) {
      setVisible(false);
      return;
    }

    if (deferred) {
      setVisible(true);
      setIosHint(false);
      setAndroidHint(false);
      return;
    }

    const onMobile = isNarrow || showBottomNav;
    if (!onMobile && guest) {
      setVisible(false);
      return;
    }

    if (isIosDevice()) {
      setIosHint(true);
      setAndroidHint(false);
      setVisible(true);
      return;
    }

    if (isAndroidDevice()) {
      setIosHint(false);
      setAndroidHint(true);
      setVisible(true);
      return;
    }

    setVisible(false);
  }, [
    authReady,
    user,
    deferred,
    isStandalone,
    guest,
    isNarrow,
    showBottomNav,
  ]);

  const dismiss = useCallback(() => {
    snooze(14);
    setVisible(false);
    setDeferred(null);
    clearDeferredInstallPrompt();
    setIosHint(false);
    setAndroidHint(false);
  }, []);

  const onInstall = useCallback(async () => {
    const prompt = deferred ?? getDeferredInstallPrompt();
    if (!prompt) return;
    try {
      await prompt.prompt();
      await prompt.userChoice;
    } catch {
      /* ignore */
    }
    clearDeferredInstallPrompt();
    setDeferred(null);
    setVisible(false);
  }, [deferred]);

  if (!visible || isStandalone) return null;

  const showChromium = Boolean(deferred ?? getDeferredInstallPrompt());
  const showIos = iosHint && !showChromium;
  const showAndroid = androidHint && !showChromium;

  if (!showChromium && !showIos && !showAndroid) return null;

  const title = showIos
    ? t('pwa.installIosTitle')
    : showAndroid
      ? t('pwa.installAndroidTitle')
      : t('pwa.installTitle');

  const body = showIos
    ? t('pwa.installIosSteps')
    : showAndroid
      ? t('pwa.installAndroidSteps')
      : t('pwa.installLede');

  return (
    <div
      className={cn(
        'no-print fixed inset-x-3 z-[200] mx-auto max-w-md animate-rise-in rounded-lg border border-primary/30 bg-card p-4 shadow-lg',
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
              {title}
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
          <p className="text-sm text-muted-foreground">{body}</p>
          <div className="flex flex-col gap-2 pt-1 sm:flex-row">
            {showChromium && (
              <Button
                type="button"
                size="sm"
                className="w-full sm:w-auto"
                onClick={onInstall}
              >
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
