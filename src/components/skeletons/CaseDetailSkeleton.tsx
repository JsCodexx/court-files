import React from 'react';
import { Card } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { BrandLoader } from '../BrandLoader';
import { useLocale } from '../../i18n/LocaleContext';

export function CaseDetailSkeleton() {
  const { t } = useLocale();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Skeleton className="h-9 w-28" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
      <Card className="overflow-hidden border-2 p-4 shadow-sm sm:p-6">
        <div className="mb-6 flex justify-center">
          <BrandLoader size="sm" label={t('common.loading')} />
        </div>
        <div className="mx-auto max-w-2xl space-y-3 text-center">
          <Skeleton className="mx-auto h-5 w-3/4 max-w-md" />
          <Skeleton className="mx-auto h-4 w-1/2 max-w-xs" />
        </div>
        <div className="mt-8 grid gap-2 sm:grid-cols-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex gap-2 border border-border/60 p-2">
              <Skeleton className="h-4 w-20 shrink-0" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>
        <div className="mt-6 space-y-2">
          <Skeleton className="h-8 w-full" />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </Card>
    </div>
  );
}
