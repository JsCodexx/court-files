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

export function DashboardPage() {
  const { cases, fetchToday, fetchTomorrow, version } = useCases();
  const { t } = useLocale();
  const [category, setCategory] = useState<CourtCategory>(COURT_CATEGORIES[0]);
  const [scope, setScope] = useState<DayScope>('today');
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

  const byCategory = useMemo(() => {
    const inCat = (list: CourtCase[]) =>
      list.filter((c) => c.category === category);
    return {
      today: inCat(todayCases),
      tomorrow: inCat(tomorrowCases),
      all: inCat(cases),
    };
  }, [category, todayCases, tomorrowCases, cases]);

  const listed = byCategory[scope];
  const categoryLabel = t(`category.${category}` as TranslationKey);
  const scopeLabel =
    scope === 'today'
      ? t('dashboard.today')
      : scope === 'tomorrow'
        ? t('dashboard.tomorrow')
        : t('dashboard.all');
  const title = `${categoryLabel} — ${scopeLabel}`;

  const scopes: { key: DayScope; label: string; value: number }[] = [
    {
      key: 'today',
      label: t('dashboard.today'),
      value: byCategory.today.length,
    },
    {
      key: 'tomorrow',
      label: t('dashboard.tomorrow'),
      value: byCategory.tomorrow.length,
    },
    {
      key: 'all',
      label: t('dashboard.all'),
      value: byCategory.all.length,
    },
  ];

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

      {/* Slim filter bar: court type + hearing scope */}
      <div className="rounded-lg border bg-card/95 px-2.5 py-2.5 shadow-sm backdrop-blur-[2px] sm:px-4 sm:py-3">
        <div className="flex flex-col gap-3">
          {/* Court types — scrollable tabs on small screens */}
          <div
            role="tablist"
            aria-label={t('dashboard.courtType')}
            className="-mx-0.5 flex gap-0.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {COURT_CATEGORIES.map((cat) => {
              const active = category === cat;
              const total = cases.filter((c) => c.category === cat).length;
              return (
                <button
                  key={cat}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setCategory(cat)}
                  className={cn(
                    'group relative inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap px-2.5 py-2 text-xs font-medium transition-colors sm:gap-2 sm:px-3 sm:text-sm',
                    active
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <span>{t(`category.${cat}` as TranslationKey)}</span>
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

          {/* Today / Tomorrow / All — compact segmented control */}
          <div
            role="tablist"
            aria-label={t('dashboard.hearingScope', { court: categoryLabel })}
            className="grid w-full grid-cols-3 rounded-md border bg-muted/50 p-0.5 sm:inline-flex sm:w-auto"
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
                    'inline-flex items-center justify-center gap-1 rounded-[5px] px-2 py-1.5 text-[11px] font-semibold transition-all sm:gap-1.5 sm:px-3 sm:text-xs',
                    active
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <span className="truncate">{stat.label}</span>
                  <span
                    className={cn(
                      'tabular-nums',
                      active ? 'text-primary' : 'text-muted-foreground/80'
                    )}
                  >
                    {stat.value}
                  </span>
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
