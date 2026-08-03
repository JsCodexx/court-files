import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocale } from '../i18n/LocaleContext';
import { TranslationKey } from '../i18n/translations';
import { CourtCase } from '../types';
import { formatDisplayDate } from '../utils/dates';
import { CaseStatusBadge } from './CaseStatusBadge';

interface Props {
  courtCase: CourtCase;
  children: React.ReactNode;
}

const CARD_WIDTH = 420;
const OPEN_DELAY = 150;

/**
 * Shows the case details styled like an official court cause list:
 * centered court/judge header, bordered detail grid, and a bordered
 * hearings table. Appears when hovering the wrapped Case ID.
 */
export function CaseHoverCard({ courtCase, children }: Props) {
  const { t } = useLocale();
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const timer = useRef<number | null>(null);

  const monthLabel = (index: number, short?: boolean) =>
    t((short ? `monthShort.${index}` : `month.${index}`) as TranslationKey);

  const open = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      const left = Math.max(
        8,
        Math.min(rect.left, window.innerWidth - CARD_WIDTH - 8)
      );
      setPos({ top: Math.min(rect.bottom + 6, window.innerHeight - 100), left });
    }, OPEN_DELAY);
  };

  const close = () => {
    if (timer.current) window.clearTimeout(timer.current);
    setPos(null);
  };

  const dash = t('common.dash');

  const detailRow = (label: string, value: React.ReactNode, urdu = false) => (
    <tr>
      <th className="w-32 border border-border bg-muted/60 px-2 py-1.5 text-start align-top text-xs font-semibold">
        {label}
      </th>
      <td
        className={`border border-border px-2 py-1.5 text-start align-top text-sm ${
          urdu ? 'urdu-text' : ''
        }`}
      >
        {value}
      </td>
    </tr>
  );

  return (
    <span
      className="cursor-help underline decoration-dotted underline-offset-4"
      onMouseEnter={open}
      onMouseLeave={close}
      onFocus={(e) => open(e as unknown as React.MouseEvent<HTMLElement>)}
      onBlur={close}
      tabIndex={0}
    >
      {children}
      {pos &&
        createPortal(
          <div
            className="fixed z-50 max-h-[70vh] animate-fade-in overflow-y-auto rounded-md border-2 border-foreground/30 bg-card p-4 text-card-foreground shadow-xl"
            style={{ top: pos.top, left: pos.left, width: CARD_WIDTH }}
            role="tooltip"
          >
            {/* Document header, like the printed cause list */}
            <div className="mb-3 space-y-0.5 border-b-2 border-double border-foreground/30 pb-2 text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {t('hover.title')}
              </p>
              <p className="urdu-text font-display text-base font-semibold">
                {t('hover.judgeLine', { name: courtCase.judgeName })}
              </p>
              <p className="text-xs text-muted-foreground">
                {t(`category.${courtCase.category}` as TranslationKey)}
                {courtCase.courtNumber ? (
                  <>
                    {' · '}
                    {t('hover.court')} <span dir="ltr">{courtCase.courtNumber}</span>
                  </>
                ) : null}
                {courtCase.city ? (
                  <>
                    {' · '}
                    {t('hover.city')}:{' '}
                    <span className="urdu-text">{courtCase.city}</span>
                  </>
                ) : null}
              </p>
              <p className="urdu-text pt-1 text-base font-bold">
                {courtCase.party1.name} {t('common.vs')} {courtCase.party2.name}
              </p>
            </div>

            {/* Bordered detail grid */}
            <table className="w-full border-collapse">
              <tbody>
                {detailRow(
                  t('hover.caseNo'),
                  <span dir="ltr" className="font-semibold">
                    {courtCase.caseId}
                  </span>
                )}
                {detailRow(
                  t('hover.status'),
                  <CaseStatusBadge status={courtCase.status} alwaysShow />
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
                {courtCase.client.name
                  ? detailRow(t('hover.client'), courtCase.client.name, true)
                  : null}
              </tbody>
            </table>

            {/* Bordered hearings table, like the cause list rows */}
            {courtCase.hearings.length > 0 && (
              <table className="mt-3 w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border border-border bg-muted/60 px-2 py-1 text-start text-xs font-semibold">
                      {t('hover.date')}
                    </th>
                    <th className="border border-border bg-muted/60 px-2 py-1 text-start text-xs font-semibold">
                      {t('hearing.proceeding')}
                    </th>
                    <th className="border border-border bg-muted/60 px-2 py-1 text-start text-xs font-semibold">
                      {t('hearing.shortOrder')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {courtCase.hearings.slice(0, 5).map((h) => (
                    <tr key={h.id}>
                      <td
                        dir="ltr"
                        className="whitespace-nowrap border border-border px-2 py-1 text-start text-xs font-medium"
                      >
                        {formatDisplayDate(h.date, monthLabel)}
                      </td>
                      <td className="urdu-text border border-border px-2 py-1 text-start text-xs">
                        {h.proceeding || dash}
                      </td>
                      <td className="urdu-text border border-border px-2 py-1 text-start text-xs">
                        {h.shortOrder || dash}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>,
          document.body
        )}
    </span>
  );
}
