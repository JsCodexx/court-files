import React from 'react';
import { Copy, History, Mail, MessageCircle, Pencil } from 'lucide-react';
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
import { trimParties, trimText } from '../utils/text';
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
}

export function CaseTable({ cases, title, onSelect, compact = false }: Props) {
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

  const partiesFull = (c: CourtCase) =>
    `${c.party1.name} ${t('common.vs')} ${c.party2.name}`;

  const partiesShort = (c: CourtCase) =>
    trimParties(c.party1.name, c.party2.name, t('common.vs'), compact ? 12 : 16);

  const nextProc = (c: CourtCase) =>
    c.hearings[0]?.proceeding || c.proceeding || '';

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap gap-2 border-b bg-muted/40 px-3 py-2.5 sm:px-4 sm:py-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-xs sm:text-sm"
          onClick={() => shareWhatsApp(text)}
        >
          <MessageCircle className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{t('table.shareWhatsApp')}</span>
          <span className="sm:hidden">WA</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-xs sm:text-sm"
          onClick={() => shareEmail(title, text)}
        >
          <Mail className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{t('table.shareEmail')}</span>
          <span className="sm:hidden">Email</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-xs sm:text-sm"
          onClick={() => shareNative(title, text, t('table.copied'))}
        >
          <Copy className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{t('table.shareCopy')}</span>
          <span className="sm:hidden">Copy</span>
        </Button>
      </div>
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
                title={partiesFull(c)}
              >
                <span className="block truncate">{partiesShort(c)}</span>
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
    </Card>
  );
}
