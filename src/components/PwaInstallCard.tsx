import React, { useCallback, useEffect, useState } from 'react';
import { Smartphone } from './icons';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { useAppShell } from '../hooks/useAppShell';
import { useLocale } from '../i18n/LocaleContext';
import {
  clearDeferredInstallPrompt,
  getDeferredInstallPrompt,
  subscribeInstallPrompt,
  type BeforeInstallPromptEvent,
} from '../pwa/captureInstallPrompt';
import { isAndroidDevice, isIosDevice } from '../pwa/platform';
import { requestInstallBanner } from '../pwa/requestInstallBanner';

/** Always-available install help (not subject to the floating banner snooze). */
export function PwaInstallCard() {
  const { t } = useLocale();
  const { isStandalone } = useAppShell();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    () => getDeferredInstallPrompt()
  );

  useEffect(() => {
    return subscribeInstallPrompt(() => {
      setDeferred(getDeferredInstallPrompt());
    });
  }, []);

  const onInstall = useCallback(async () => {
    const prompt = deferred ?? getDeferredInstallPrompt();
    if (!prompt) {
      requestInstallBanner();
      return;
    }
    try {
      await prompt.prompt();
      await prompt.userChoice;
    } catch {
      /* ignore */
    }
    clearDeferredInstallPrompt();
    setDeferred(null);
  }, [deferred]);

  if (isStandalone) return null;

  const showChromium = Boolean(deferred ?? getDeferredInstallPrompt());
  const showIos = isIosDevice() && !showChromium;
  const showAndroid = isAndroidDevice() && !showChromium;

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
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Smartphone className="h-5 w-5" weight="duotone" />
          </span>
          <div className="min-w-0">
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription className="mt-1">{body}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {showChromium ? (
          <Button type="button" onClick={onInstall}>
            {t('pwa.installCta')}
          </Button>
        ) : (
          <p className="text-xs text-muted-foreground">{t('pwa.installHintMenu')}</p>
        )}
      </CardContent>
    </Card>
  );
}
