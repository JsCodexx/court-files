import React from 'react';
import { Skeleton } from '../ui/skeleton';
import { BrandLoader } from '../BrandLoader';
import { useLocale } from '../../i18n/LocaleContext';
import { cn } from '../../lib/utils';

/** Dashed panel for in-page actions (checkout redirect, verify email, etc.). */
export function InlinePanelSkeleton({
  className,
  labelKey = 'common.loading',
}: {
  className?: string;
  labelKey?: 'common.loading' | 'verify.verifying' | 'payments.redirecting';
}) {
  const { t } = useLocale();
  const label =
    labelKey === 'verify.verifying'
      ? t('verify.verifying')
      : labelKey === 'payments.redirecting'
        ? t('payments.redirecting')
        : t('common.loading');

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 p-4',
        className
      )}
      role="status"
      aria-live="polite"
    >
      <BrandLoader size="sm" label={label} />
      <Skeleton className="hidden h-4 flex-1 sm:block" aria-hidden />
    </div>
  );
}
