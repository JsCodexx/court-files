import React from 'react';
import { Button } from './ui/button';
import { useLocale } from '../i18n/LocaleContext';

type Props = {
  whatsappNumber: string;
  whatsappUrl: string;
  compact?: boolean;
};

export function ManualPaymentWhatsAppCard({
  whatsappNumber,
  whatsappUrl,
  compact = false,
}: Props) {
  const { t } = useLocale();

  if (!whatsappNumber.trim() || !whatsappUrl) return null;

  return (
    <div
      className={
        compact
          ? 'rounded-lg border border-[hsl(var(--brand-fresh)/0.35)] bg-[hsl(var(--brand-fresh)/0.08)] p-4'
          : 'app-panel mt-4 border border-[hsl(var(--brand-fresh)/0.35)] bg-[hsl(var(--brand-fresh)/0.06)] p-5 sm:p-6'
      }
    >
      <p className="font-display text-base font-semibold text-foreground">
        {t('manualPayment.whatsappTitle')}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        {t('manualPayment.whatsappHint')}
      </p>
      <p
        className="mt-3 font-mono text-lg font-semibold tracking-wide text-foreground"
        dir="ltr"
      >
        {whatsappNumber}
      </p>
      <Button asChild className="mt-4 w-full sm:w-auto" variant="default">
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
          {t('manualPayment.whatsappOpen')}
        </a>
      </Button>
    </div>
  );
}
