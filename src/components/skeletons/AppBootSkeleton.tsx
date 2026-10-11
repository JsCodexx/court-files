import React from 'react';
import { BrandLoader } from '../BrandLoader';
import { useLocale } from '../../i18n/LocaleContext';
import { cn } from '../../lib/utils';

export function AppBootSkeleton({
  className,
  minHeight = 'min-h-[40vh]',
}: {
  className?: string;
  minHeight?: string;
}) {
  const { t } = useLocale();
  return (
    <div
      className={cn(
        'flex items-center justify-center px-4',
        minHeight,
        className
      )}
      role="status"
      aria-live="polite"
    >
      <BrandLoader size="sm" label={t('common.loading')} />
    </div>
  );
}
