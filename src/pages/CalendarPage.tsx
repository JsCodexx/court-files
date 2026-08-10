import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CaseTable } from '../components/CaseTable';
import { HearingModal } from '../components/HearingModal';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { useCases } from '../context/CasesContext';
import { useLocale } from '../i18n/LocaleContext';
import { TranslationKey } from '../i18n/translations';
import { cn } from '../lib/utils';
import { CourtCase } from '../types';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  formatDisplayDate,
  formatMonthYear,
  isSameDay,
  isSameMonth,
  isSunday,
  nextWorkingDayISO,
  startOfMonth,
  startOfWeek,
  toISODate,
  todayISO,
} from '../utils/dates';

export function CalendarPage() {
  const { fetchByDate, fetchHearingDates, version } = useCases();
  const { t } = useLocale();
  const [cursor, setCursor] = useState<Date>(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => nextWorkingDayISO());
  const [selectedCase, setSelectedCase] = useState<CourtCase | null>(null);
  const [hearingDates, setHearingDates] = useState<Set<string>>(new Set());
  const [dayCases, setDayCases] = useState<CourtCase[]>([]);
  const today = todayISO();

  // Markers from next dates + full hearing history
  useEffect(() => {
    let alive = true;
    fetchHearingDates()
      .then((dates) => {
        if (alive) setHearingDates(dates);
      })
      .catch(() => {
        /* keep previous markers on error */
      });
    return () => {
      alive = false;
    };
  }, [fetchHearingDates, version]);

  // Cases for the selected day (includes historical hearings)
  useEffect(() => {
    let alive = true;
    fetchByDate(selectedDate)
      .then((list) => {
        if (alive) setDayCases(list);
      })
      .catch(() => {
        if (alive) setDayCases([]);
      });
    return () => {
      alive = false;
    };
  }, [selectedDate, fetchByDate, version]);

  const monthLabel = (index: number, short?: boolean) =>
    t((short ? `monthShort.${index}` : `month.${index}`) as TranslationKey);

  const weekdays = [
    t('calendar.sun'),
    t('calendar.mon'),
    t('calendar.tue'),
    t('calendar.wed'),
    t('calendar.thu'),
    t('calendar.fri'),
    t('calendar.sat'),
  ];

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor));
    const end = endOfWeek(endOfMonth(cursor));
    return eachDayOfInterval(start, end);
  }, [cursor]);

  const formattedSelected = formatDisplayDate(selectedDate, monthLabel);
  const selectedIsPast = selectedDate < today;

  return (
    <div className="animate-rise-in space-y-6">
      <div>
        <h1 className="page-title">{t('calendar.title')}</h1>
        <p className="page-lede">{t('calendar.lede')}</p>
      </div>

      <Card>
        <CardContent className="pt-4 sm:pt-6">
          <div className="mb-3 flex items-center justify-between gap-2 sm:mb-4">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setCursor((d: Date) => addMonths(d, -1))}
            >
              <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
              <span className="hidden sm:inline">{t('calendar.prev')}</span>
            </Button>
            <h2 className="font-display text-base font-semibold sm:text-xl" dir="ltr">
              {formatMonthYear(cursor, monthLabel)}
            </h2>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setCursor((d: Date) => addMonths(d, 1))}
            >
              <span className="hidden sm:inline">{t('calendar.next')}</span>
              <ChevronRight className="h-4 w-4 rtl:rotate-180" />
            </Button>
          </div>

          <div className="mb-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground sm:mb-4">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-700 dark:bg-amber-500" />
              {t('calendar.legendPast')}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-600 dark:bg-emerald-400" />
              {t('calendar.legendUpcoming')}
            </span>
          </div>

          <div className="grid grid-cols-7 gap-0.5 sm:gap-1.5">
            {weekdays.map((d) => (
              <div
                key={d}
                className="pb-1 text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-xs"
              >
                {d}
              </div>
            ))}
            {days.map((day: Date) => {
              const iso = toISODate(day);
              const sunday = isSunday(day);
              const hasHearing = !sunday && hearingDates.has(iso);
              const isPast = iso < today;
              const selected = selectedDate === iso;
              const todayMark = isSameDay(day, new Date());
              return (
                <button
                  key={iso}
                  type="button"
                  disabled={sunday}
                  aria-disabled={sunday}
                  title={sunday ? t('calendar.sundayClosed') : undefined}
                  onClick={() => {
                    if (!sunday) setSelectedDate(iso);
                  }}
                  className={cn(
                    'relative flex aspect-square min-h-[2.25rem] flex-col items-center justify-center rounded-md border text-xs transition-colors sm:min-h-0 sm:text-sm',
                    sunday
                      ? 'cursor-not-allowed border-dashed bg-muted/40 text-muted-foreground/40 opacity-60'
                      : 'hover:border-primary/60',
                    !isSameMonth(day, cursor) &&
                      !sunday &&
                      'text-muted-foreground/50',
                    todayMark &&
                      !sunday &&
                      'border-primary/60 font-semibold text-primary',
                    selected &&
                      !sunday &&
                      (isPast
                        ? 'border-amber-800 bg-amber-800 text-amber-50 hover:border-amber-800 dark:border-amber-600 dark:bg-amber-700'
                        : 'border-primary bg-primary text-primary-foreground hover:border-primary')
                  )}
                >
                  <span>{day.getDate()}</span>
                  {hasHearing ? (
                    <span
                      className={cn(
                        'absolute bottom-1 h-1 w-1 rounded-full sm:bottom-1.5 sm:h-1.5 sm:w-1.5',
                        selected
                          ? 'bg-current opacity-90'
                          : isPast
                            ? 'bg-amber-700 dark:bg-amber-500'
                            : 'bg-emerald-600 dark:bg-emerald-400'
                      )}
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="font-display text-lg font-semibold sm:text-xl">
          {t('calendar.casesOn', { date: formattedSelected })}
          {selectedIsPast ? (
            <span className="ms-2 text-sm font-normal text-amber-800 dark:text-amber-400">
              ({t('calendar.legendPast')})
            </span>
          ) : null}
        </h2>
        <CaseTable
          cases={dayCases}
          title={t('calendar.casesOn', { date: formattedSelected })}
          onSelect={setSelectedCase}
        />
      </div>

      {selectedCase && (
        <HearingModal
          courtCase={selectedCase}
          onClose={() => setSelectedCase(null)}
        />
      )}
    </div>
  );
}
