import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { useLocale } from '../../i18n/LocaleContext';

type Props = {
  activeUntil: string | null;
  manualPending: boolean;
  hasManualRequests: boolean;
};

export function PlansStatusActions({
  activeUntil,
  manualPending,
  hasManualRequests,
}: Props) {
  const { t } = useLocale();

  const showBar = Boolean(activeUntil) || manualPending || hasManualRequests;
  if (!showBar) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {activeUntil && (
        <Button asChild variant="secondary" size="sm">
          <Link to="/payments">
            {t('plans.btnActiveUntil', { date: activeUntil })}
          </Link>
        </Button>
      )}
      {manualPending && (
        <Button asChild variant="secondary" size="sm">
          <Link to="/payments/manual">{t('plans.btnPendingReview')}</Link>
        </Button>
      )}
      {hasManualRequests && !manualPending && (
        <Button asChild variant="outline" size="sm">
          <Link to="/payments/manual">{t('manualPayment.viewRequests')}</Link>
        </Button>
      )}
    </div>
  );
}
