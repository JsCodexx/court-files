import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { readSubscriptionAccessCache } from '../context/SubscriptionContext';
import { useSubscription } from '../hooks/useSubscription';
import { useLocale } from '../i18n/LocaleContext';

/** Paths reachable while subscription lapsed (over free case limit). */
const BILLING_PREFIXES = ['/plans', '/payments'];

function isBillingPath(pathname: string): boolean {
  return BILLING_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

function SubscriptionGuardSpinner() {
  const { t } = useLocale();
  return (
    <div
      className="flex min-h-[50vh] items-center justify-center px-4 text-center text-muted-foreground"
      role="status"
      aria-live="polite"
    >
      {t('common.loading')}
    </div>
  );
}

/**
 * Blocks direct URL access to app routes when subscription lockout applies.
 * Renders nothing except plans/payments until status is known (fail closed).
 */
export function SubscriptionBillingGuard() {
  const { user } = useAuth();
  const { status, loading } = useSubscription();
  const location = useLocation();
  const billing = isBillingPath(location.pathname);

  const cachedAccess = readSubscriptionAccessCache(user?.userId);
  const lockedOut =
    status != null
      ? !status.canAccessApp
      : cachedAccess === false
        ? true
        : false;

  if (lockedOut && !billing) {
    return (
      <Navigate
        to="/plans"
        replace
        state={{ subscriptionLockout: true, from: location.pathname }}
      />
    );
  }

  if (!billing && (loading || !status) && user) {
    if (cachedAccess === false) {
      return (
        <Navigate
          to="/plans"
          replace
          state={{ subscriptionLockout: true, from: location.pathname }}
        />
      );
    }
    return <SubscriptionGuardSpinner />;
  }

  return <Outlet />;
}
