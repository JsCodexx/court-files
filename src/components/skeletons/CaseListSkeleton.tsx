import React from 'react';
import { Card } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { BrandLoader } from '../BrandLoader';
import { useLocale } from '../../i18n/LocaleContext';

export function CaseListSkeleton({ rows = 5 }: { rows?: number }) {
  const { t } = useLocale();

  return (
    <Card className="app-panel overflow-hidden shadow-sm">
      <div className="flex items-center gap-3 border-b border-border bg-[hsl(var(--brand-forest)/0.04)] px-3 py-3 dark:bg-sidebar/40">
        <BrandLoader size="sm" label={t('common.loading')} />
      </div>
      <ul className="divide-y divide-border" aria-hidden>
        {Array.from({ length: rows }).map((_, i) => (
          <li key={i} className="flex gap-3 px-3 py-3.5">
            <Skeleton className="h-4 w-5 shrink-0" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
              <Skeleton className="h-4 w-full max-w-md" />
              <Skeleton className="h-3 w-32" />
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
