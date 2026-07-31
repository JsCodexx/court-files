import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CaseTable } from '../components/CaseTable';
import { HearingModal } from '../components/HearingModal';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { COURT_CATEGORIES } from '../constants';
import { useCases } from '../context/CasesContext';
import { useLocale } from '../i18n/LocaleContext';
import { TranslationKey } from '../i18n/translations';
import { cn } from '../lib/utils';
import { CourtCase, CourtCategory } from '../types';

type ViewMode =
  | { kind: 'all' }
  | { kind: 'today' }
  | { kind: 'tomorrow' }
  | { kind: 'category'; category: CourtCategory };

export function DashboardPage() {
  const { cases, fetchToday, fetchTomorrow, fetchByCategory, version } =
    useCases();
  const { t } = useLocale();
  const [view, setView] = useState<ViewMode>({ kind: 'all' });
  const [selected, setSelected] = useState<CourtCase | null>(null);
  const [counts, setCounts] = useState({ today: 0, tomorrow: 0 });
  const [listed, setListed] = useState<CourtCase[]>([]);

  // Stat counts from server endpoints
  useEffect(() => {
    let alive = true;
    Promise.all([fetchToday(), fetchTomorrow()])
      .then(([today, tomorrow]) => {
        if (alive) {
          setCounts({ today: today.length, tomorrow: tomorrow.length });
        }
      })
      .catch(() => {
        /* counts stay stale on error */
      });
    return () => {
      alive = false;
    };
  }, [fetchToday, fetchTomorrow, version]);

  // Listed cases for the active view
  useEffect(() => {
    if (view.kind === 'all') {
      setListed(cases);
      return;
    }
    let alive = true;
    const load =
      view.kind === 'today'
        ? fetchToday()
        : view.kind === 'tomorrow'
          ? fetchTomorrow()
          : fetchByCategory(view.category);
    load
      .then((list) => {
        if (alive) setListed(list);
      })
      .catch(() => {
        /* keep previous list on error */
      });
    return () => {
      alive = false;
    };
  }, [view, cases, fetchToday, fetchTomorrow, fetchByCategory, version]);

  const title =
    view.kind === 'today'
      ? t('dashboard.today')
      : view.kind === 'tomorrow'
        ? t('dashboard.tomorrow')
        : view.kind === 'category'
          ? t(`category.${view.category}` as TranslationKey)
          : t('dashboard.all');

  const stats: { key: ViewMode['kind']; label: string; value: number; mode: ViewMode }[] = [
    {
      key: 'today',
      label: t('dashboard.today'),
      value: counts.today,
      mode: { kind: 'today' },
    },
    {
      key: 'tomorrow',
      label: t('dashboard.tomorrow'),
      value: counts.tomorrow,
      mode: { kind: 'tomorrow' },
    },
    {
      key: 'all',
      label: t('dashboard.all'),
      value: cases.length,
      mode: { kind: 'all' },
    },
  ];

  return (
    <div className="animate-rise-in space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">
            {t('dashboard.title')}
          </h1>
          <p className="text-sm text-muted-foreground">{t('dashboard.lede')}</p>
        </div>
        <Button asChild>
          <Link to="/cases/new">
            <Plus className="h-4 w-4" />
            {t('dashboard.addCase')}
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card
            key={stat.key}
            role="button"
            tabIndex={0}
            onClick={() => setView(stat.mode)}
            onKeyDown={(e) => e.key === 'Enter' && setView(stat.mode)}
            className={cn(
              'cursor-pointer p-5 transition-colors hover:border-primary/60',
              view.kind === stat.key && 'border-primary ring-1 ring-primary'
            )}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {stat.label}
            </p>
            <p className="mt-1 font-display text-4xl font-semibold text-primary">
              {stat.value}
            </p>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {COURT_CATEGORIES.map((category) => {
          const active =
            view.kind === 'category' && view.category === category;
          return (
            <Button
              key={category}
              type="button"
              size="sm"
              variant={active ? 'default' : 'outline'}
              onClick={() => setView({ kind: 'category', category })}
            >
              {t(`category.${category}` as TranslationKey)}
            </Button>
          );
        })}
      </div>

      <div className="space-y-3">
        <h2 className="font-display text-xl font-semibold">{title}</h2>
        <CaseTable cases={listed} title={title} onSelect={(c) => setSelected(c)} />
      </div>

      {selected && (
        <HearingModal courtCase={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
