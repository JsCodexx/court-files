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
  startOfMonth,
  startOfWeek,
  toISODate,
  todayISO,
} from '../utils/dates';

export function CalendarPage() {
  const { fetchByDate, fetchHearingDates, version } = useCases();
  const { t } = useLocale();
  const [cursor, setCursor] = useState<Date>(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => todayISO());
  const [selectedCase, setSelectedCase] = useState<CourtCase | null>(null);
  const [hearingDates, setHearingDates] = useState<Set<string>>(new Set());
  const [dayCases, setDayCases] = useState<CourtCase[]>([]);

  // Gold-dot markers from the server
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

  // Cases for the selected day from the server
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

  return (
    <div className="animate-rise-in space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">
          {t('calendar.title')}
        </h1>
        <p className="text-sm text-muted-foreground">{t('calendar.lede')}</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="mb-4 flex items-center justify-between gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setCursor((d: Date) => addMonths(d, -1))}
            >
              <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
              {t('calendar.prev')}
            </Button>
            <h2 className="font-display text-xl font-semibold" dir="ltr">
              {formatMonthYear(cursor, monthLabel)}
            </h2>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setCursor((d: Date) => addMonths(d, 1))}
            >
              {t('calendar.next')}
              <ChevronRight className="h-4 w-4 rtl:rotate-180" />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {weekdays.map((d) => (
              <div
                key={d}
                className="pb-1 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                {d}
              </div>
            ))}
            {days.map((day: Date) => {
              const iso = toISODate(day);
              const hasHearing = hearingDates.has(iso);
              const selected = selectedDate === iso;
              const today = isSameDay(day, new Date());
              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => setSelectedDate(iso)}
                  className={cn(
                    'relative flex aspect-square flex-col items-center justify-center rounded-md border text-sm transition-colors hover:border-primary/60',
                    !isSameMonth(day, cursor) &&
                      'text-muted-foreground/50',
                    today && 'border-primary/60 font-semibold text-primary',
                    selected &&
                      'border-primary bg-primary text-primary-foreground hover:border-primary'
                  )}
                >
                  <span>{day.getDate()}</span>
                  {hasHearing ? (
                    <span
                      className={cn(
                        'absolute bottom-1.5 h-1.5 w-1.5 rounded-full bg-primary',
                        selected && 'bg-primary-foreground'
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
        <h2 className="font-display text-xl font-semibold">
          {t('calendar.casesOn', { date: formattedSelected })}
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
