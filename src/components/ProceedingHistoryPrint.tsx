import React from 'react';
import { useLocale } from '../i18n/LocaleContext';
import { CourtCase } from '../types';
import { formatDMYDate } from '../utils/dates';
import { groupHearingsByJudge } from '../utils/hearings';

type Props = {
  cases: CourtCase[];
  /** Document subtitle, e.g. Today's Cases — All courts */
  subtitle?: string;
};

/**
 * Print sheet matching Punjab-style "Proceeding History":
 * each case, then judge grey bars with Sr / Date / Stage / Short Order.
 */
export function ProceedingHistoryPrint({ cases, subtitle }: Props) {
  const { t } = useLocale();
  const dash = t('common.dash');

  const th =
    'border border-[#bbb] bg-[#f0f0f0] px-2 py-1.5 text-start text-xs font-bold';
  const td = 'border border-[#bbb] px-2 py-1.5 text-start align-top text-sm';

  // Same-judge cases together for easier reading of today's docket
  const ordered = [...cases].sort((a, b) => {
    const byJudge = a.judgeName.localeCompare(b.judgeName, undefined, {
      sensitivity: 'base',
    });
    if (byJudge !== 0) return byJudge;
    return a.caseId.localeCompare(b.caseId);
  });

  if (!ordered.length) {
    return (
      <div className="print-sheet space-y-3 text-foreground">
        <h1 className="text-lg font-bold">{t('print.proceedingHistory')}</h1>
        {subtitle ? <p className="text-sm">{subtitle}</p> : null}
        <p className="text-sm text-muted-foreground">{t('print.noCases')}</p>
      </div>
    );
  }

  return (
    <div className="print-sheet space-y-10 text-foreground">
      <div className="space-y-1 border-b border-[#bbb] pb-3">
        <h1 className="text-lg font-bold tracking-tight">
          {t('print.proceedingHistory')}
        </h1>
        {subtitle ? <p className="text-sm">{subtitle}</p> : null}
      </div>

      {ordered.map((courtCase) => {
        const hearings = courtCase.hearings ?? [];
        // New cases may only have nextDate/proceeding until the first hearing is logged
        const forHistory =
          hearings.length > 0
            ? hearings
            : courtCase.nextDate
              ? [
                  {
                    id: `${courtCase.id}-next`,
                    date: courtCase.nextDate,
                    proceeding: courtCase.proceeding || '',
                    shortOrder: '',
                    remarks: '',
                    judgeName: courtCase.judgeName,
                    party1Advocate: courtCase.party1Advocate,
                    party2Advocate: courtCase.party2Advocate,
                    judgePersonId: courtCase.judgePersonId ?? null,
                    party1AdvocateId: courtCase.party1AdvocateId ?? null,
                    party2AdvocateId: courtCase.party2AdvocateId ?? null,
                    createdAt: courtCase.createdAt,
                  },
                ]
              : [];
        const groups = groupHearingsByJudge(forHistory);
        return (
          <section
            key={courtCase.id}
            className="space-y-3 break-after-page last:break-after-auto"
          >
            <div className="space-y-0.5">
              <p className="text-sm font-semibold">
                <span dir="ltr">{courtCase.caseId}</span>
                {' — '}
                <span className="urdu-text">{courtCase.party1.name}</span>
                {' vs '}
                <span className="urdu-text">{courtCase.party2.name}</span>
              </p>
              {(courtCase.courtNumber || courtCase.city) && (
                <p className="text-xs text-muted-foreground">
                  {courtCase.courtNumber ? (
                    <>
                      {t('hover.court')}{' '}
                      <span dir="ltr">{courtCase.courtNumber}</span>
                    </>
                  ) : null}
                  {courtCase.courtNumber && courtCase.city ? ' — ' : null}
                  {courtCase.city ? (
                    <span className="urdu-text">{courtCase.city}</span>
                  ) : null}
                </p>
              )}
            </div>

            <h2 className="text-base font-bold">
              {t('print.proceedingHistory')}
            </h2>

            {groups.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('history.empty')}</p>
            ) : (
              groups.map((group) => (
                <div key={group.judgeKey} className="space-y-0 break-inside-avoid">
                  <div className="proceeding-judge-bar">
                    <span className="font-semibold">{group.judgeName}</span>
                    {courtCase.city ? (
                      <span>
                        {', '}
                        <span className="urdu-text">{courtCase.city}</span>
                      </span>
                    ) : null}
                  </div>
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className={`${th} w-14`}>{t('print.sr')}</th>
                        <th className={`${th} w-32`}>
                          {t('print.proceedingDate')}
                        </th>
                        <th className={th}>{t('print.stage')}</th>
                        <th className={th}>{t('history.shortOrder')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.rows.map((row) => (
                        <tr key={row.id}>
                          <td className={`${td} tabular-nums`}>{row.serial}</td>
                          <td
                            className={`${td} whitespace-nowrap tabular-nums`}
                          >
                            {formatDMYDate(row.date)}
                          </td>
                          <td className={`${td} urdu-text`}>
                            {row.proceeding || dash}
                          </td>
                          <td className={`${td} urdu-text`}>
                            {row.shortOrder?.trim() || ''}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))
            )}
          </section>
        );
      })}
    </div>
  );
}
