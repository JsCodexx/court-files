import React, { useEffect, useState } from 'react';
import { ArrowLeft, History, Printer } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Alert } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { useCases } from '../context/CasesContext';
import { useLocale } from '../i18n/LocaleContext';
import { TranslationKey } from '../i18n/translations';
import { CourtCase } from '../types';
import { formatDisplayDate } from '../utils/dates';

/**
 * Full-page case view styled like the official printed cause list:
 * centered court/judge header, bordered detail grid and a fully
 * ruled hearings table. Printable via the toolbar button.
 */
export function CaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { getCase, version } = useCases();
  const { t } = useLocale();
  const [courtCase, setCourtCase] = useState<CourtCase | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    let alive = true;
    getCase(id)
      .then((c) => {
        if (alive) {
          setCourtCase(c);
          setNotFound(false);
        }
      })
      .catch(() => {
        if (alive) setNotFound(true);
      });
    return () => {
      alive = false;
    };
  }, [id, getCase, version]);

  const monthLabel = (index: number, short?: boolean) =>
    t((short ? `monthShort.${index}` : `month.${index}`) as TranslationKey);

  if (notFound) {
    return (
      <div className="animate-rise-in space-y-4">
        <Alert variant="destructive">{t('history.notFound')}</Alert>
        <Button asChild variant="secondary">
          <Link to="/dashboard">
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            {t('history.back')}
          </Link>
        </Button>
      </div>
    );
  }

  if (!courtCase) {
    return (
      <div className="p-10 text-center text-sm text-muted-foreground">
        {t('common.dash')}
      </div>
    );
  }

  const dash = t('common.dash');

  const cellHead =
    'border border-foreground/40 bg-muted/60 px-3 py-2 text-start text-xs font-bold uppercase tracking-wide print:bg-transparent';
  const cell = 'border border-foreground/40 px-3 py-2 text-start align-top text-sm';

  const detailRow = (
    label: string,
    value: React.ReactNode,
    urdu = false
  ) => (
    <tr>
      <th className={`${cellHead} w-44 normal-case`}>{label}</th>
      <td className={`${cell} ${urdu ? 'urdu-text' : ''}`}>{value}</td>
    </tr>
  );

  return (
    <div className="animate-rise-in space-y-4">
      {/* Toolbar (hidden when printing) */}
      <div className="no-print flex flex-wrap items-center justify-between gap-2">
        <Button asChild variant="secondary" size="sm">
          <Link to="/dashboard">
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            {t('history.back')}
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to={`/cases/${courtCase.id}/history`}>
              <History className="h-4 w-4" />
              {t('detail.editHistory')}
            </Link>
          </Button>
          <Button size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4" />
            {t('detail.print')}
          </Button>
        </div>
      </div>

      {/* The document sheet */}
      <div className="print-sheet mx-auto w-full max-w-4xl rounded-sm border-2 border-foreground/30 bg-card p-6 shadow-sm md:p-10 print:border-0 print:p-0 print:shadow-none">
        {/* Centered header, like the printed cause list */}
        <div className="space-y-1 border-b-4 border-double border-foreground/40 pb-4 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground">
            {t('hover.title')}
          </p>
          <p className="text-sm font-semibold">
            {t(`category.${courtCase.category}` as TranslationKey)}
            {courtCase.courtNumber ? (
              <>
                {' — '}
                {t('hover.court')} <span dir="ltr">{courtCase.courtNumber}</span>
              </>
            ) : null}
          </p>
          <p className="urdu-text font-display text-xl font-bold">
            {t('hover.judgeLine', { name: courtCase.judgeName })}
          </p>
          <p className="text-sm text-muted-foreground">
            {t('detail.dateLine', {
              date: formatDisplayDate(courtCase.nextDate, monthLabel),
            })}
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <p className="urdu-text text-lg font-bold">
              {courtCase.party1.name} {t('common.vs')} {courtCase.party2.name}
            </p>
            <Badge
              variant={courtCase.status === 'decided' ? 'success' : 'secondary'}
            >
              {t(
                courtCase.status === 'decided'
                  ? 'status.decided'
                  : 'status.pending'
              )}
            </Badge>
          </div>
        </div>

        {/* Bordered case detail grid */}
        <table className="mt-6 w-full border-collapse">
          <tbody>
            {detailRow(
              t('hover.caseNo'),
              <span dir="ltr" className="font-bold">
                {courtCase.caseId}
              </span>
            )}
            {detailRow(
              t('hover.titleLabel'),
              `${courtCase.party1.name} ${t('common.vs')} ${courtCase.party2.name}`,
              true
            )}
            {detailRow(t('hover.stage'), courtCase.proceeding || dash, true)}
            {detailRow(
              t('hover.nextDate'),
              <span dir="ltr">
                {formatDisplayDate(courtCase.nextDate, monthLabel)}
              </span>
            )}
            {detailRow(
              t('hover.advocateFor'),
              t(`advocateFor.${courtCase.advocateFor}` as TranslationKey)
            )}
            {detailRow(
              t('hover.opponent'),
              courtCase.opponentCounsel || dash,
              true
            )}
            {detailRow(
              t('addCase.party1'),
              <>
                <span className="urdu-text">{courtCase.party1.name}</span>
                {courtCase.party1.idCard ? (
                  <span dir="ltr"> · {courtCase.party1.idCard}</span>
                ) : null}
                {courtCase.party1.phone ? (
                  <span dir="ltr"> · {courtCase.party1.phone}</span>
                ) : null}
              </>
            )}
            {detailRow(
              t('addCase.party2'),
              <>
                <span className="urdu-text">{courtCase.party2.name}</span>
                {courtCase.party2.idCard ? (
                  <span dir="ltr"> · {courtCase.party2.idCard}</span>
                ) : null}
                {courtCase.party2.phone ? (
                  <span dir="ltr"> · {courtCase.party2.phone}</span>
                ) : null}
              </>
            )}
            {courtCase.client.name
              ? detailRow(
                  t('hover.client'),
                  <>
                    <span className="urdu-text">{courtCase.client.name}</span>
                    {courtCase.client.phone ? (
                      <span dir="ltr"> · {courtCase.client.phone}</span>
                    ) : null}
                  </>
                )
              : null}
            {courtCase.remarks
              ? detailRow(t('history.remarks'), courtCase.remarks, true)
              : null}
          </tbody>
        </table>

        {/* Fully ruled hearings table, like the cause-list rows */}
        <h2 className="urdu-text mt-8 mb-2 text-center font-display text-lg font-bold">
          {t('hover.recent')}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr>
                <th className={`${cellHead} w-12`}>{t('table.serial')}</th>
                <th className={cellHead}>{t('hover.date')}</th>
                <th className={cellHead}>{t('history.stage')}</th>
                <th className={cellHead}>{t('history.adjournment')}</th>
                <th className={cellHead}>{t('history.shortOrder')}</th>
                <th className={cellHead}>{t('history.remarks')}</th>
              </tr>
            </thead>
            <tbody>
              {courtCase.hearings.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className={`${cell} py-6 text-center text-muted-foreground`}
                  >
                    {t('history.empty')}
                  </td>
                </tr>
              ) : (
                courtCase.hearings.map((h, index) => (
                  <tr key={h.id}>
                    <td className={`${cell} text-center`}>{index + 1}</td>
                    <td dir="ltr" className={`${cell} whitespace-nowrap font-medium`}>
                      {formatDisplayDate(h.date, monthLabel)}
                    </td>
                    <td className={`${cell} urdu-text`}>
                      {h.proceeding || dash}
                    </td>
                    <td className={`${cell} urdu-text`}>
                      {h.adjournmentReason || t('history.nil')}
                    </td>
                    <td className={`${cell} urdu-text`}>
                      {h.shortOrder || t('history.nil')}
                    </td>
                    <td className={`${cell} urdu-text`}>
                      {h.remarks || dash}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
