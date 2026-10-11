import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import { useLocale } from '../i18n/LocaleContext';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

function graceDismissKey(userId: string): string {
  const day = new Date().toISOString().slice(0, 10);
  return `cf_sub_grace_promo_${userId}_${day}`;
}

function wasGraceDismissedToday(userId: string): boolean {
  try {
    return localStorage.getItem(graceDismissKey(userId)) === '1';
  } catch {
    return false;
  }
}

/** Grace: daily reminder. Lapsed: must renew — primary action goes to plans/payment. */
export function SubscriptionRenewalDialog() {
  const { t } = useLocale();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { status, loading } = useSubscription();
  const [open, setOpen] = useState(false);

  const inGrace =
    !loading &&
    status?.phase === 'grace' &&
    Boolean(status.showDailyRenewalPromo);

  const lockedOut =
    !loading &&
    status?.phase === 'lapsed' &&
    status.canAccessApp === false;

  const mode = lockedOut ? 'lockout' : inGrace ? 'grace' : null;

  useEffect(() => {
    if (!user?.userId || !mode) {
      setOpen(false);
      return;
    }
    if (mode === 'grace' && wasGraceDismissedToday(user.userId)) {
      setOpen(false);
      return;
    }
    setOpen(true);
  }, [user?.userId, mode, status?.graceDaysRemaining, status?.phase]);

  const dismissGrace = () => {
    if (user?.userId) {
      try {
        localStorage.setItem(graceDismissKey(user.userId), '1');
      } catch {
        /* ignore */
      }
    }
    setOpen(false);
  };

  const goToPlans = () => {
    setOpen(false);
    navigate('/plans');
  };

  if (!user || !mode) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (mode === 'lockout') {
          if (v) setOpen(true);
          else goToPlans();
          return;
        }
        if (v) setOpen(true);
        else dismissGrace();
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'lockout'
              ? t('subscription.lockoutTitle')
              : t('subscription.graceTitle')}
          </DialogTitle>
          <DialogDescription>
            {mode === 'lockout'
              ? t('subscription.lockoutLede')
              : t('subscription.graceLede')}
          </DialogDescription>
        </DialogHeader>
        {mode === 'grace' && (
          <p className="text-sm text-muted-foreground">
            {t('subscription.graceCountdown', {
              days: status!.graceDaysRemaining,
            })}
          </p>
        )}
        {mode === 'lockout' && (
          <p className="text-sm text-muted-foreground">
            {t('subscription.casesUsed', {
              count: status!.caseCount,
              limit: status!.freeCaseLimit,
            })}
          </p>
        )}
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          {mode === 'grace' ? (
            <>
              <Button asChild className="w-full sm:w-auto">
                <Link to="/plans" onClick={dismissGrace}>
                  {t('subscription.upgradeCta')}
                </Link>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={dismissGrace}
              >
                {t('subscription.graceDismiss')}
              </Button>
            </>
          ) : (
            <Button
              type="button"
              className="w-full sm:w-auto"
              onClick={goToPlans}
            >
              {t('subscription.upgradeCta')}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
