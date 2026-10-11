import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { BrandLoader } from '../BrandLoader';
import { useLocale } from '../../i18n/LocaleContext';

export function AddCaseFormSkeleton() {
  const { t } = useLocale();

  return (
    <div className="app-page space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-9 w-56 max-w-full" />
        <Skeleton className="h-4 w-full max-w-lg" />
      </div>
      <Card className="app-panel shadow-sm">
        <CardContent className="space-y-6 pt-6">
          <BrandLoader size="sm" label={t('common.loading')} />
          {Array.from({ length: 3 }).map((_, section) => (
            <div key={section} className="space-y-4">
              <Skeleton className="h-5 w-40" />
              <div className="grid gap-4 md:grid-cols-2">
                {Array.from({ length: 4 }).map((__, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            </div>
          ))}
          <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>
    </div>
  );
}
