import React from 'react';
import { ChevronRight, Copy, History, Mail, MessageCircle, Pencil } from './icons';
import { Link } from 'react-router-dom';
import { useLocale } from '../i18n/LocaleContext';
import { TranslationKey } from '../i18n/translations';
import { CourtCase } from '../types';
import { formatDisplayDate } from '../utils/dates';
import {
  buildCaseListText,
  shareEmail,
  shareNative,
  shareWhatsApp,
} from '../utils/share';
import { getCasePartiesDisplay } from '../utils/casePartiesDisplay';
import { trimText } from '../utils/text';
import { CaseHoverCard } from './CaseHoverCard';
import { CaseStatusBadge } from './CaseStatusBadge';
import { Button } from './ui/button';
import { Card } from './ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';

interface Props {
  cases: CourtCase[];
  title: string;
  onSelect?: (c: CourtCase) => void;
  /**
   * Compact cause-list view: fewer columns.
   * Text fields are always trimmed with "...".
   */
  compact?: boolean;
  /** Dashboard mobile: stacked cards instead of wide table (bottom nav safe). */
  mobileStack?: boolean;
}

export function CaseTable({
  cases,
  title,
  onSelect,
  compact = false,
  mobileStack = false,
}: Props) {
  const { t } = useLocale();

  const monthLabel = (index: number, short?: boolean) =>
    t((short ? `monthShort.${index}` : `month.${index}`) as TranslationKey);

  const text = buildCaseListText(cases, title, {
    vs: t('common.vs'),
    court: t('share.court'),
    judge: t('share.judge'),
    todayProc: t('share.todayProc'),
    nextDate: t('share.nextDate'),
    nextProc: t('share.nextProc'),
    dash: t('common.dash'),
    copied: t('table.copied'),
    monthLabel,
  });

  if (cases.length === 0) {
    return (
      <Card className="p-10 text-center text-sm text-muted-foreground">
        {t('table.empty')}
      </Card>
    );
  }

  const vsLabel = t('common.vs');

  const partiesFor = (c: CourtCase, variant: 'mobile' | 'compact' | 'full') =>
    getCasePartiesDisplay(c, vsLabel, variant);

  const nextProc = (c: CourtCase) =>
    c.hearings[0]?.proceeding || c.proceeding || '';

  return (
    <Card className="app-panel overflow-hidden shadow-sm">
      <div className="grid grid-cols-3 gap-1.5 border-b border-border bg-[hsl(var(--brand-forest)/0.04)] p-2 dark:bg-sidebar/40 sm:flex sm:flex-row sm:flex-wrap sm:gap-2 sm:p-3 lg:px-4 lg:py-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="case-table-share-btn gap-1 px-1.5 text-[10px] sm:h-8 sm:min-h-8 sm:w-auto sm:px-3 sm:text-sm"
          onClick={() => shareWhatsApp(text)}
        >
          <MessageCircle className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{t('table.shareWhatsApp')}</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="case-table-share-btn gap-1 px-1.5 text-[10px] sm:h-8 sm:min-h-8 sm:w-auto sm:px-3 sm:text-sm"
          onClick={() => shareEmail(title, text)}
        >
          <Mail className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{t('table.shareEmail')}</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="case-table-share-btn gap-1 px-1.5 text-[10px] sm:h-8 sm:min-h-8 sm:w-auto sm:px-3 sm:text-sm"
          onClick={() => shareNative(title, text, t('table.copied'))}
        >
          <Copy className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{t('table.shareCopy')}</span>
        </Button>
      </div>

      {mobileStack && (
        <ul className="divide-y divide-border font-body lg:hidden">
          {cases.map((c, index) => {
            const partiesFull = partiesFor(c, 'full');
            const partiesMobile = partiesFor(c, 'mobile');
            return (
            <li key={c.id} className="bg-card">
              <button
                type="button"
                className="flex w-full items-stretch gap-3 px-3 py-3.5 text-start transition-colors active:bg-muted/50"
                onClick={() => onSelect?.(c)}
              >
                <span
                  className="w-6 shrink-0 pt-0.5 text-center text-xs font-medium tabular-nums text-muted-foreground"
                  aria-hidden
                >
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1 space-y-1.5">
                  <span className="flex items-center gap-2">
                    <Link
                      to={`/cases/${c.id}/detail`}
                      dir="ltr"
                      className="min-w-0 flex-1 truncate text-sm font-semibold text-primary"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {c.caseId}
                    </Link>
                    <CaseStatusBadge status={c.status} />
                  </span>
                  <span
                    className="urdu-text block text-sm leading-snug text-foreground line-clamp-2"
                    title={partiesFull.title}
                  >
                    {partiesMobile.text}
                  </span>
                  <span className="flex items-baseline gap-1.5 text-xs">
                    <span className="shrink-0 text-muted-foreground">
                      {t('table.nextDate')}
                    </span>
                    <span className="font-semibold text-foreground" dir="ltr">
                      {formatDisplayDate(c.nextDate, monthLabel)}
                    </span>
                  </span>
                </span>
                <ChevronRight
                  className="mt-1 h-4 w-4 shrink-0 text-muted-foreground/70 rtl:rotate-180"
                  aria-hidden
                />
              </button>
              <div className="flex items-center justify-end gap-1 border-t border-border/50 px-3 py-1.5">
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5 px-2 text-xs text-muted-foreground"
                >
                  <Link
                    to={`/cases/${c.id}/edit`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    {t('addCase.edit')}
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5 px-2 text-xs text-muted-foreground"
                >
                  <Link to={`/cases/${c.id}/history`}>
                    <History className="h-3.5 w-3.5" />
                    {t('history.title')}
                  </Link>
                </Button>
              </div>
            </li>
            );
          })}
        </ul>
      )}

      <div className={mobileStack ? 'hidden overflow-x-auto lg:block' : 'overflow-x-auto'}>
      <Table className={compact ? 'min-w-[560px]' : 'min-w-[720px]'}>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">{t('table.serial')}</TableHead>
            <TableHead>{t('table.caseId')}</TableHead>
            <TableHead>{t('table.parties')}</TableHead>
            {!compact && <TableHead>{t('table.courtNo')}</TableHead>}
            <TableHead>{t('table.judge')}</TableHead>
            <TableHead>{t('table.todayProc')}</TableHead>
            <TableHead>{t('table.nextDate')}</TableHead>
            {!compact && <TableHead>{t('table.nextProc')}</TableHead>}
            <TableHead className="text-end">{t('history.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cases.map((c, index) => (
            <TableRow
              key={c.id}
              onClick={() => onSelect?.(c)}
              className={onSelect ? 'cursor-pointer' : undefined}
            >
              <TableCell className="text-muted-foreground">
                {index + 1}
              </TableCell>
              <TableCell className="font-medium">
                <div className="flex max-w-[9rem] items-center gap-2">
                  <CaseHoverCard courtCase={c}>
                    <Link
                      to={`/cases/${c.id}/detail`}
                      dir="ltr"
                      className="block truncate font-semibold text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                      title={c.caseId}
                    >
                      {trimText(c.caseId, 14)}
                    </Link>
                  </CaseHoverCard>
                  <CaseStatusBadge status={c.status} />
                </div>
              </TableCell>
              <TableCell
                className="urdu-text max-w-[11rem]"
                title={partiesFor(c, 'full').title}
              >
                <span className="block truncate">
                  {partiesFor(c, compact ? 'compact' : 'full').text}
                </span>
              </TableCell>
              {!compact && (
                <TableCell dir="ltr" className="max-w-[5rem]">
                  <span className="block truncate" title={c.courtNumber || undefined}>
                    {c.courtNumber
                      ? trimText(c.courtNumber, 8)
                      : t('common.dash')}
                  </span>
                </TableCell>
              )}
              <TableCell
                className="urdu-text max-w-[8rem]"
                title={c.judgeName}
              >
                <span className="block truncate">
                  {trimText(c.judgeName, 16)}
                </span>
              </TableCell>
              <TableCell
                className="urdu-text max-w-[8rem]"
                title={c.proceeding || undefined}
              >
                <span className="block truncate">
                  {c.proceeding
                    ? trimText(c.proceeding, 16)
                    : t('common.dash')}
                </span>
              </TableCell>
              <TableCell dir="ltr" className="whitespace-nowrap">
                {formatDisplayDate(c.nextDate, monthLabel)}
              </TableCell>
              {!compact && (
                <TableCell
                  className="urdu-text max-w-[8rem]"
                  title={nextProc(c) || undefined}
                >
                  <span className="block truncate">
                    {nextProc(c)
                      ? trimText(nextProc(c), 16)
                      : t('common.dash')}
                  </span>
                </TableCell>
              )}
              <TableCell className="text-end">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    asChild
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    <Link
                      to={`/cases/${c.id}/edit`}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={t('addCase.edit')}
                      title={t('addCase.edit')}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    <Link
                      to={`/cases/${c.id}/history`}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={t('history.title')}
                      title={t('history.title')}
                    >
                      <History className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>
    </Card>
  );
}
