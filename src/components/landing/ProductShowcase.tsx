import React from 'react';
import { CalendarDays, Scale, Smartphone } from '../icons';
import { useLocale } from '../../i18n/LocaleContext';
import { TranslationKey } from '../../i18n/translations';
import { cn } from '../../lib/utils';

const STAT_KEYS: TranslationKey[] = [
  'landing.showcase.statCases',
  'landing.showcase.statHearings',
  'landing.showcase.statToday',
  'landing.showcase.statHistory',
];

const PHONE_ROWS: { title: TranslationKey; meta: TranslationKey }[] = [
  { title: 'landing.preview.case1', meta: 'landing.preview.case1Meta' },
  { title: 'landing.preview.case2', meta: 'landing.preview.case2Meta' },
];

const DESK_ROWS: { title: TranslationKey; meta: TranslationKey }[] = [
  { title: 'landing.preview.case1', meta: 'landing.preview.case1Meta' },
  { title: 'landing.preview.case2', meta: 'landing.preview.case2Meta' },
  { title: 'landing.preview.case3', meta: 'landing.preview.case3Meta' },
];

type ProductShowcaseProps = {
  className?: string;
};

/** CSS-only laptop + phone mock — no stock photos from brand boards. */
export function ProductShowcase({ className }: ProductShowcaseProps) {
  const { t } = useLocale();

  return (
    <div className={cn('relative mx-auto w-full max-w-[min(100%,28rem)] lg:max-w-none', className)}>
      <div
        className="absolute -right-8 top-8 hidden h-40 w-40 rounded-full bg-[hsl(var(--brand-fresh)/0.12)] blur-3xl lg:block"
        aria-hidden
      />
      <div
        className="absolute -left-6 bottom-16 h-32 w-32 rounded-full bg-[hsl(var(--brand-forest)/0.08)] blur-2xl"
        aria-hidden
      />

      <div className="relative rounded-2xl border border-border/80 bg-gradient-to-b from-card to-muted/40 p-3 shadow-2xl shadow-[hsl(var(--brand-forest)/0.12)] sm:p-4">
        <div className="mb-3 flex items-center gap-2 px-1">
          <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-[hsl(var(--brand-fresh))]" />
          <span className="ms-2 truncate text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            clerkdiary.com
          </span>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-background">
          <div className="grid grid-cols-2 gap-2 border-b border-border bg-muted/30 p-3 sm:grid-cols-4 sm:gap-3 sm:p-4">
            {STAT_KEYS.map((key, i) => (
              <div
                key={key}
                className="rounded-lg border border-border/60 bg-card px-2.5 py-2 sm:px-3 sm:py-2.5"
              >
                <p className="text-lg font-semibold tabular-nums text-[hsl(var(--brand-forest))] dark:text-[hsl(var(--brand-fresh))]">
                  {[12, 4, 3, 8][i]}
                </p>
                <p className="mt-0.5 text-[0.65rem] leading-tight text-muted-foreground sm:text-[0.7rem]">
                  {t(key)}
                </p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[hsl(var(--brand-fresh))]">
                {t('landing.preview.badge')}
              </p>
              <p className="mt-0.5 font-display text-sm font-semibold text-foreground sm:text-base">
                {t('landing.preview.court')}
              </p>
            </div>
            <Scale className="h-7 w-7 text-[hsl(var(--brand-forest))] dark:text-[hsl(var(--brand-fresh))]" weight="duotone" />
          </div>
          <ul className="divide-y divide-border">
            {DESK_ROWS.map((row) => (
              <li key={row.title} className="flex items-start justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{t(row.title)}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{t(row.meta)}</p>
                </div>
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[hsl(var(--brand-fresh))]" />
              </li>
            ))}
          </ul>
        </div>

        <div className="mx-auto mt-2 h-1.5 w-[42%] rounded-full bg-border" aria-hidden />
      </div>

      <div
        className="absolute -bottom-2 start-0 z-10 w-[38%] max-w-[9.5rem] animate-soft-float sm:-bottom-4 sm:-start-4 sm:w-[42%] sm:max-w-[10.5rem]"
        style={{ animationDelay: '400ms' }}
        aria-hidden
      >
        <div className="rounded-[1.35rem] border-[3px] border-foreground/10 bg-sidebar p-1.5 shadow-xl">
          <div className="overflow-hidden rounded-[1rem] bg-sidebar-foreground/5">
            <div className="flex items-center justify-center gap-1 border-b border-sidebar-foreground/10 py-2">
              <Smartphone className="h-3.5 w-3.5 text-sidebar-accent" weight="fill" />
              <span className="text-[9px] font-semibold uppercase tracking-wide text-sidebar-muted">
                {t('landing.showcase.mobileLabel')}
              </span>
            </div>
            <ul className="divide-y divide-sidebar-foreground/10 px-2.5 py-1">
              {PHONE_ROWS.map((row) => (
                <li key={row.title} className="py-2">
                  <p className="truncate text-[10px] font-semibold text-sidebar-foreground">
                    {t(row.title)}
                  </p>
                  <p className="mt-0.5 text-[9px] text-sidebar-muted">{t(row.meta)}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Mini calendar grid for alternating sections */
export function CalendarShowcase({ className }: { className?: string }) {
  const { t } = useLocale();
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const cells = Array.from({ length: 28 }, (_, i) => i + 1);
  const highlighted = new Set([5, 12, 22]);

  return (
    <div
      className={cn(
        'rounded-2xl border border-border bg-card p-5 shadow-lg shadow-[hsl(var(--brand-forest)/0.08)]',
        className
      )}
      aria-hidden
    >
      <div className="flex items-center gap-2">
        <CalendarDays className="h-6 w-6 text-[hsl(var(--brand-forest))] dark:text-[hsl(var(--brand-fresh))]" weight="duotone" />
        <p className="font-display text-base font-semibold text-foreground">
          {t('landing.showcase.calendarTitle')}
        </p>
      </div>
      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-muted-foreground">
        {days.map((d, i) => (
          <span key={`${d}-${i}`}>{d}</span>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-1">
        {cells.map((n) => (
          <span
            key={n}
            className={cn(
              'flex aspect-square items-center justify-center rounded-md text-xs',
              highlighted.has(n)
                ? 'bg-[hsl(var(--brand-forest))] font-semibold text-primary-foreground dark:bg-[hsl(var(--brand-fresh))] dark:text-primary-foreground'
                : 'text-muted-foreground'
            )}
          >
            {n}
          </span>
        ))}
      </div>
      <p className="mt-4 text-xs text-muted-foreground">{t('landing.showcase.calendarNote')}</p>
    </div>
  );
}

/** Paper stack vs digital — abstract, no photo assets */
export function TraditionContrast({ className }: { className?: string }) {
  const { t } = useLocale();

  return (
    <div className={cn('relative flex min-h-[14rem] items-center justify-center', className)} aria-hidden>
      <div className="absolute start-[8%] top-6 w-[42%] rotate-[-6deg] rounded-lg border border-border bg-muted/80 p-4 shadow-md">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {t('landing.showcase.paperLabel')}
        </p>
        <div className="mt-3 space-y-2">
          <div className="h-2 w-full rounded bg-border" />
          <div className="h-2 w-[85%] rounded bg-border" />
          <div className="h-2 w-[70%] rounded bg-border" />
        </div>
      </div>
      <div className="absolute end-[6%] top-10 w-[48%] rotate-[4deg] rounded-xl border border-[hsl(var(--brand-forest)/0.25)] bg-card p-4 shadow-xl">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--brand-fresh))]">
          {t('landing.showcase.digitalLabel')}
        </p>
        <ul className="mt-3 space-y-2">
          {DESK_ROWS.slice(0, 2).map((row) => (
            <li key={row.title} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--brand-fresh))]" />
              <span className="truncate text-xs font-medium text-foreground">{t(row.title)}</span>
            </li>
          ))}
        </ul>
      </div>
      <Scale
        className="relative z-10 h-14 w-14 text-[hsl(var(--brand-forest))] opacity-90 dark:text-[hsl(var(--brand-fresh))]"
        weight="duotone"
      />
    </div>
  );
}
