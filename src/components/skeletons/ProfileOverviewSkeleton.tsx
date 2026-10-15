import React from 'react';
import { Skeleton } from '../ui/skeleton';
import { BrandLoader } from '../BrandLoader';
import { useLocale } from '../../i18n/LocaleContext';

export function ProfileOverviewSkeleton() {
  const { t } = useLocale();

  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-2xl" />
        ))}
      </div>
      <div className="app-panel overflow-hidden">
        <div className="brand-band px-4 py-3 sm:px-5">
          <BrandLoader size="sm" label={t('common.loading')} />
        </div>
        <dl className="divide-y">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="grid gap-2 px-4 py-3 sm:grid-cols-[10rem_1fr] sm:px-5"
            >
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-full max-w-xs" />
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
