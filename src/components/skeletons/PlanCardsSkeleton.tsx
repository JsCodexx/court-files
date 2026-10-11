import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { BrandLoader } from '../BrandLoader';
import { useLocale } from '../../i18n/LocaleContext';

export function PlanCardsSkeleton({ count = 2 }: { count?: number }) {
  const { t } = useLocale();

  return (
    <div className="space-y-4">
      <BrandLoader size="sm" label={t('plans.loading')} className="px-1" />
      <div className="grid gap-5 sm:grid-cols-2">
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i} className="overflow-hidden shadow-sm">
            <CardHeader className="space-y-2 pb-2">
              <Skeleton className="h-6 w-28" />
              <Skeleton className="h-4 w-full max-w-xs" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-8 w-32" />
              {Array.from({ length: 4 }).map((__, j) => (
                <Skeleton key={j} className="h-3 w-full" />
              ))}
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full rounded-md" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
