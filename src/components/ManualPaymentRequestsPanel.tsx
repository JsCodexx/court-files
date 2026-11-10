import React from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useLocale } from '../i18n/LocaleContext';
import type { TranslationKey } from '../i18n/translations';
import type { ManualPaymentRequestDto, ManualRequestStatus } from '../types/manualPayment';

export type ManualPaymentRequestItem = Pick<
  ManualPaymentRequestDto,
  | 'id'
  | 'planId'
  | 'amountPkr'
  | 'status'
  | 'paidToMethod'
  | 'transactionId'
  | 'createdAt'
  | 'adminNote'
  | 'reviewedAt'
>;

const STATUS_KEYS: Record<ManualRequestStatus, TranslationKey> = {
  pending: 'manualPayment.statusPending',
  approved: 'manualPayment.statusApproved',
  rejected: 'manualPayment.statusRejected',
};

function normalizeStatus(raw: string): ManualRequestStatus {
  const s = raw.toLowerCase();
  if (s === 'approved' || s === 'rejected' || s === 'pending') return s;
  return 'pending';
}

function ManualRequestStatusBadge({ status }: { status: string }) {
  const { t } = useLocale();
  const normalized = normalizeStatus(status);
  const variant =
    normalized === 'approved'
      ? 'success'
      : normalized === 'rejected'
        ? 'destructive'
        : 'secondary';
  return <Badge variant={variant}>{t(STATUS_KEYS[normalized])}</Badge>;
}

function planLabel(planId: string) {
  if (planId === 'monthly') return 'Monthly';
  if (planId === 'yearly') return 'Yearly';
  return planId.charAt(0).toUpperCase() + planId.slice(1);
}

export const MANUAL_PAYMENT_FORM_ID = 'manual-payment-form';

export function ManualPaymentRequestsPanel({
  requests,
  compact = false,
  showResubmitAction = false,
}: {
  requests: ManualPaymentRequestItem[];
  compact?: boolean;
  showResubmitAction?: boolean;
}) {
  const { t } = useLocale();

  if (requests.length === 0) return null;

  const hasPending = requests.some((r) => normalizeStatus(r.status) === 'pending');
  const hasRejected = requests.some((r) => normalizeStatus(r.status) === 'rejected');
  const canResubmit = showResubmitAction && !hasPending && hasRejected;

  return (
    <section className="app-panel overflow-hidden">
      <div className="border-b border-border px-5 py-4">
        <h2 className="font-display text-lg font-semibold text-foreground">
          {t('manualPayment.myRequests')}
        </h2>
        {hasPending ? (
          <p className="mt-1 text-sm text-muted-foreground">
            {t('manualPayment.pendingReview')}
          </p>
        ) : hasRejected ? (
          <p className="mt-1 text-sm text-muted-foreground">
            {t('manualPayment.resubmitHint')}
          </p>
        ) : (
          <p className="mt-1 text-sm text-muted-foreground">
            {t('manualPayment.requestsHistoryLede')}
          </p>
        )}
        {canResubmit ? (
          <Button asChild variant="outline" size="sm" className="mt-3">
            <a href={`#${MANUAL_PAYMENT_FORM_ID}`}>{t('manualPayment.resubmitCta')}</a>
          </Button>
        ) : null}
      </div>
      <ul className={`divide-y divide-border ${compact ? 'px-4' : 'px-5'} sm:px-6`}>
        {requests.map((r) => {
          const status = normalizeStatus(r.status);
          return (
            <li key={r.id} className="py-4 first:pt-4 last:pb-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-foreground">
                    {planLabel(r.planId)} · Rs {r.amountPkr.toLocaleString('en-PK')}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground" dir="ltr">
                    {r.paidToMethod} · {r.transactionId}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t('manualPayment.submittedAt', {
                      date: new Date(r.createdAt).toLocaleString(),
                    })}
                  </p>
                  {r.reviewedAt && status !== 'pending' ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t('manualPayment.reviewedAt', {
                        date: new Date(r.reviewedAt).toLocaleString(),
                      })}
                    </p>
                  ) : null}
                </div>
                <ManualRequestStatusBadge status={r.status} />
              </div>
              {status === 'approved' ? (
                <p className="mt-2 text-sm text-[hsl(var(--brand-forest))] dark:text-[hsl(var(--brand-fresh))]">
                  {t('manualPayment.statusApprovedDetail')}
                </p>
              ) : null}
              {status === 'rejected' ? (
                <p className="mt-2 text-sm text-destructive">
                  {t('manualPayment.statusRejectedDetail')}
                </p>
              ) : null}
              {r.adminNote ? (
                <p className="mt-2 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm text-foreground">
                  <span className="font-medium">{t('manualPayment.adminNote')}: </span>
                  {r.adminNote}
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function hasPendingManualRequest(requests: ManualPaymentRequestItem[]): boolean {
  return requests.some((r) => normalizeStatus(r.status) === 'pending');
}

export function hasRejectedManualRequest(requests: ManualPaymentRequestItem[]): boolean {
  return requests.some((r) => normalizeStatus(r.status) === 'rejected');
}
