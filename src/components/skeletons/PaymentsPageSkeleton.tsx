import React from 'react';
import { Skeleton } from '../ui/skeleton';
import { BrandLoader } from '../BrandLoader';
import { useLocale } from '../../i18n/LocaleContext';

export function PaymentsPageSkeleton() {
  const { t } = useLocale();

  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
      {Array.from({ length: 2 }).map((_, panel) => (
        <section key={panel} className="app-panel overflow-hidden">
          <div className="border-b border-border px-5 py-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-6 rounded-md" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-3 w-56 max-w-full" />
              </div>
            </div>
          </div>
          <div className="space-y-4 p-5 sm:p-6">
            {panel === 0 ? (
              <BrandLoader size="sm" label={t('common.loading')} />
            ) : null}
            {Array.from({ length: panel === 0 ? 3 : 4 }).map((__, i) => (
              <div key={i} className="flex justify-between gap-3 py-2">
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-full max-w-xs" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
