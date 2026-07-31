import React from 'react';
import { Copy, History, Mail, MessageCircle } from 'lucide-react';
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
import { CaseHoverCard } from './CaseHoverCard';
import { Badge } from './ui/badge';
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
}

export function CaseTable({ cases, title, onSelect }: Props) {
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

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap gap-2 border-b bg-muted/40 px-4 py-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => shareWhatsApp(text)}
        >
          <MessageCircle className="h-3.5 w-3.5" />
          {t('table.shareWhatsApp')}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => shareEmail(title, text)}
        >
          <Mail className="h-3.5 w-3.5" />
          {t('table.shareEmail')}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => shareNative(title, text, t('table.copied'))}
        >
          <Copy className="h-3.5 w-3.5" />
          {t('table.shareCopy')}
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('table.serial')}</TableHead>
            <TableHead>{t('table.caseId')}</TableHead>
            <TableHead>{t('table.parties')}</TableHead>
            <TableHead>{t('table.courtNo')}</TableHead>
            <TableHead>{t('table.judge')}</TableHead>
            <TableHead>{t('table.todayProc')}</TableHead>
            <TableHead>{t('table.nextDate')}</TableHead>
            <TableHead>{t('table.nextProc')}</TableHead>
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
                <div className="flex items-center gap-2">
                  <CaseHoverCard courtCase={c}>
                    <Link
                      to={`/cases/${c.id}/detail`}
                      dir="ltr"
                      className="font-semibold text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {c.caseId}
                    </Link>
                  </CaseHoverCard>
                  {c.status === 'decided' && (
                    <Badge variant="success">{t('status.decided')}</Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="urdu-text">
                {c.party1.name} {t('common.vs')} {c.party2.name}
              </TableCell>
              <TableCell dir="ltr">
                {c.courtNumber || t('common.dash')}
              </TableCell>
              <TableCell className="urdu-text">{c.judgeName}</TableCell>
              <TableCell className="urdu-text">
                {c.proceeding || t('common.dash')}
              </TableCell>
              <TableCell dir="ltr">
                {formatDisplayDate(c.nextDate, monthLabel)}
              </TableCell>
              <TableCell className="urdu-text">
                {c.hearings[0]?.proceeding || c.proceeding || t('common.dash')}
              </TableCell>
              <TableCell className="text-end">
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
