import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Printer } from '../components/icons';
import { Link } from 'react-router-dom';
import { CaseTable } from '../components/CaseTable';
import { HearingModal } from '../components/HearingModal';
import { ProceedingHistoryPrint } from '../components/ProceedingHistoryPrint';
import { Button } from '../components/ui/button';
import { COURT_CATEGORIES } from '../constants';
import {
  DashboardScope,
  useCases,
} from '../context/CasesContext';
import type { DashboardCategory } from '../context/casesCache';
import { useLocale } from '../i18n/LocaleContext';
import { TranslationKey } from '../i18n/translations';
import { PageHeader } from '../components/AppPage';
import { useSubscription } from '../hooks/useSubscription';
import { Alert } from '../components/ui/alert';
import { cn } from '../lib/utils';
import { CourtCase, CourtCategory } from '../types';

type CategoryFilter = CourtCategory | 'all';

export function DashboardPage() {
  const {
    fetchDashboardPage,
    getCachedDashboardMeta,
    getCachedTabCounts,
    version,
  } = useCases();
  const { status: subscription } = useSubscription(version);
  const { t } = useLocale();
  const [scope, setScope] = useState<DashboardScope>('today');
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [page, setPage] = useState(1);
  const [listed, setListed] = useState<CourtCase[]>([]);
  const [total, setTotal] = useState(0);
  const [tabCounts, setTabCounts] = useState(getCachedTabCounts());
  const [scopeMeta, setScopeMeta] = useState(getCachedDashboardMeta(scope));
  const [selected, setSelected] = useState<CourtCase | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [scope, category]);

  useEffect(() => {
    let alive = true;
    setLoadError(false);

    const needMeta = !getCachedDashboardMeta(scope);
    const needTabCounts = !getCachedTabCounts();

    void fetchDashboardPage(scope, category as DashboardCategory, page, {
      includeMeta: needMeta,
      includeTabCounts: needTabCounts,
    })
      .then((res) => {
        if (!alive) return;
        setListed(res.cases);
        setTotal(res.total);
        if (res.tabCounts) setTabCounts(res.tabCounts);
        if (res.scopeMeta) setScopeMeta(res.scopeMeta);
      })
      .catch(() => {
        if (alive) setLoadError(true);
      });

    return () => {
      alive = false;
    };
  }, [
    scope,
    category,
    page,
    version,
    fetchDashboardPage,
    getCachedDashboardMeta,
    getCachedTabCounts,
  ]);

  useEffect(() => {
    const meta = getCachedDashboardMeta(scope);
    if (meta) setScopeMeta(meta);
  }, [scope, getCachedDashboardMeta, version]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: scopeMeta?.total ?? total,
    };
    for (const cat of COURT_CATEGORIES) {
      counts[cat] = scopeMeta?.byCategory[cat] ?? 0;
    }
    return counts;
  }, [scopeMeta, total]);

  const totalPages = Math.max(1, Math.ceil(total / 10));

  const scopes: { key: DashboardScope; label: string; value: number }[] = [
    {
      key: 'today',
      label: t('dashboard.today'),
      value: tabCounts?.today ?? 0,
    },
    {
      key: 'tomorrow',
      label: t('dashboard.tomorrow'),
      value: tabCounts?.tomorrow ?? 0,
    },
    {
      key: 'all',
      label: t('dashboard.all'),
      value: tabCounts?.all ?? 0,
    },
  ];

  const categoryTabs: { key: CategoryFilter; label: string }[] = [
    { key: 'all', label: t('dashboard.allCourts') },
    ...COURT_CATEGORIES.map((cat) => ({
      key: cat as CategoryFilter,
      label: t(`category.${cat}` as TranslationKey),
    })),
  ];

  const scopeLabel =
    scope === 'today'
      ? t('dashboard.today')
      : scope === 'tomorrow'
        ? t('dashboard.tomorrow')
        : t('dashboard.all');
  const categoryLabel =
    category === 'all'
      ? t('dashboard.allCourts')
      : t(`category.${category}` as TranslationKey);
  const title = `${scopeLabel} — ${categoryLabel}`;

  const printCases = listed;

  return (
    <div className="app-page app-page--wide">
      <div className="no-print space-y-5">
        <PageHeader
          actions={
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                title={t('dashboard.printHint')}
                disabled={listed.length === 0}
                onClick={() => window.print()}
              >
                <Printer className="h-4 w-4" />
                {t('dashboard.print')}
              </Button>
              {subscription?.canAddCase !== false ? (
                <Button asChild size="sm" className="w-full sm:w-auto">
                  <Link to="/cases/new">
                    <Plus className="h-4 w-4" />
                    {t('dashboard.addCase')}
                  </Link>
                </Button>
              ) : (
                <Button asChild size="sm" className="w-full sm:w-auto">
                  <Link to="/plans">{t('subscription.upgradeCta')}</Link>
                </Button>
              )}
            </>
          }
        >
          <h1 className="page-title">{t('dashboard.title')}</h1>
          <p className="page-lede">{t('dashboard.lede')}</p>
        </PageHeader>

        {subscription && (
          <Alert
            variant={
              subscription.phase === 'grace'
                ? 'default'
                : subscription.canAddCase
                  ? 'default'
                  : 'destructive'
            }
          >
            {subscription.phase === 'grace'
              ? t('subscription.graceBanner', {
                  days: subscription.graceDaysRemaining,
                })
              : subscription.hasActiveSubscription &&
                  subscription.subscriptionExpiresAt
                ? t('subscription.activeUntil', {
                    date: new Date(
                      subscription.subscriptionExpiresAt
                    ).toLocaleDateString(),
                  })
                : t('subscription.casesUsed', {
                    count: subscription.caseCount,
                    limit: subscription.freeCaseLimit,
                  })}
          </Alert>
        )}

        {loadError && (
          <Alert variant="destructive">{t('errors.network')}</Alert>
        )}

        <div className="rounded-lg border border-border bg-card px-2.5 py-2.5 shadow-sm sm:px-4 sm:py-3">
          <div className="flex flex-col gap-3">
            <div
              role="tablist"
              aria-label={t('dashboard.hearingScope')}
              className="grid w-full grid-cols-3 rounded-md border border-border bg-muted p-0.5"
            >
              {scopes.map((stat) => {
                const active = scope === stat.key;
                return (
                  <button
                    key={stat.key}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setScope(stat.key)}
                    className={cn(
                      'inline-flex items-center justify-center gap-1.5 rounded-[5px] px-2 py-2 text-xs font-semibold transition-all sm:px-3 sm:text-sm',
                      active
                        ? 'bg-card text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <span className="truncate">{stat.label}</span>
                    <span
                      className={cn(
                        'inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-md px-1.5 text-[11px] font-semibold tabular-nums',
                        active
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {stat.value}
                    </span>
                  </button>
                );
              })}
            </div>

            <div
              role="tablist"
              aria-label={t('dashboard.courtType')}
              className="scroll-x-tabs"
            >
              {categoryTabs.map((tab) => {
                const active = category === tab.key;
                const tabTotal = categoryCounts[tab.key] ?? 0;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setCategory(tab.key)}
                    className={cn(
                      'group relative inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap px-2.5 py-2 text-xs font-medium transition-colors sm:gap-2 sm:px-3 sm:text-sm',
                      active
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={cn(
                        'inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-md px-1.5 text-[11px] font-semibold tabular-nums',
                        active
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground group-hover:bg-secondary'
                      )}
                    >
                      {tabTotal}
                    </span>
                    <span
                      className={cn(
                        'absolute inset-x-2 -bottom-px h-0.5 rounded-full transition-colors',
                        active ? 'bg-primary' : 'bg-transparent'
                      )}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-display text-lg font-semibold tracking-tight">
              {title}
            </h2>
            <p className="text-xs text-muted-foreground tabular-nums">
              {t('dashboard.pageTotal', { count: total })}
            </p>
          </div>
          <CaseTable
            cases={listed}
            title={title}
            compact
            onSelect={(c) => setSelected(c)}
          />

          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
              <p className="text-sm text-muted-foreground tabular-nums">
                {t('dashboard.pageOf', { page, total: totalPages })}
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
                  {t('dashboard.prevPage')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  {t('dashboard.nextPage')}
                  <ChevronRight className="h-4 w-4 rtl:rotate-180" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {selected && (
          <HearingModal
            courtCase={selected}
            onClose={() => setSelected(null)}
          />
        )}
      </div>

      <div className="print-only">
        <ProceedingHistoryPrint cases={printCases} subtitle={title} />
      </div>
    </div>
  );
}
