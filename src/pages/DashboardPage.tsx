import React, { useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CaseTable } from '../components/CaseTable';
import { HearingModal } from '../components/HearingModal';
import { Button } from '../components/ui/button';
import { COURT_CATEGORIES } from '../constants';
import { useCases } from '../context/CasesContext';
import { useLocale } from '../i18n/LocaleContext';
import { TranslationKey } from '../i18n/translations';
import { cn } from '../lib/utils';
import { CourtCase, CourtCategory } from '../types';

type DayScope = 'today' | 'tomorrow' | 'all';
type CategoryFilter = CourtCategory | 'all';

export function DashboardPage() {
  const { cases, fetchToday, fetchTomorrow, version } = useCases();
  const { t } = useLocale();
  const [scope, setScope] = useState<DayScope>('today');
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [selected, setSelected] = useState<CourtCase | null>(null);
  const [todayCases, setTodayCases] = useState<CourtCase[]>([]);
  const [tomorrowCases, setTomorrowCases] = useState<CourtCase[]>([]);

  useEffect(() => {
    let alive = true;
    Promise.all([fetchToday(), fetchTomorrow()])
      .then(([today, tomorrow]) => {
        if (!alive) return;
        setTodayCases(today);
        setTomorrowCases(tomorrow);
      })
      .catch(() => {
        /* keep previous lists on error */
      });
    return () => {
      alive = false;
    };
  }, [fetchToday, fetchTomorrow, version]);

  const scopePool = useMemo(() => {
    if (scope === 'today') return todayCases;
    if (scope === 'tomorrow') return tomorrowCases;
    return cases;
  }, [scope, todayCases, tomorrowCases, cases]);

  const listed = useMemo(() => {
    if (category === 'all') return scopePool;
    return scopePool.filter((c) => c.category === category);
  }, [scopePool, category]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: scopePool.length };
    for (const cat of COURT_CATEGORIES) {
      counts[cat] = scopePool.filter((c) => c.category === cat).length;
    }
    return counts;
  }, [scopePool]);

  const scopes: { key: DayScope; label: string; value: number }[] = [
    {
      key: 'today',
      label: t('dashboard.today'),
      value: todayCases.length,
    },
    {
      key: 'tomorrow',
      label: t('dashboard.tomorrow'),
      value: tomorrowCases.length,
    },
    {
      key: 'all',
      label: t('dashboard.all'),
      value: cases.length,
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

  return (
    <div className="animate-rise-in space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="page-title">{t('dashboard.title')}</h1>
          <p className="page-lede">{t('dashboard.lede')}</p>
        </div>
        <Button asChild size="sm" className="shrink-0">
          <Link to="/cases/new">
            <Plus className="h-4 w-4" />
            {t('dashboard.addCase')}
          </Link>
        </Button>
      </div>

      <div className="rounded-lg border bg-card/95 px-2.5 py-2.5 shadow-sm backdrop-blur-[2px] sm:px-4 sm:py-3">
        <div className="flex flex-col gap-3">
          {/* Primary: Today / Tomorrow / All */}
          <div
            role="tablist"
            aria-label={t('dashboard.hearingScope')}
            className="grid w-full grid-cols-3 rounded-md border bg-muted/50 p-0.5"
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

          {/* Secondary: All courts / High / Session / … (counts for current scope) */}
          <div
            role="tablist"
            aria-label={t('dashboard.courtType')}
            className="-mx-0.5 flex gap-0.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {categoryTabs.map((tab) => {
              const active = category === tab.key;
              const total = categoryCounts[tab.key] ?? 0;
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
                    {total}
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
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="font-display text-lg font-semibold tracking-tight">
            {title}
          </h2>
          <p className="text-xs text-muted-foreground tabular-nums">
            {listed.length}
          </p>
        </div>
        <CaseTable
          cases={listed}
          title={title}
          compact
          onSelect={(c) => setSelected(c)}
        />
      </div>

      {selected && (
        <HearingModal courtCase={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
