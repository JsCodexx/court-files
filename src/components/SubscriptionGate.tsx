import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSubscription } from '../hooks/useSubscription';

/** Redirects to plans when API would block app routes (kept in sync with billing guard). */
export function SubscriptionGate() {
  const { status, loading } = useSubscription();

  if (loading && !status) {
    return <Outlet />;
  }

  if (status && !status.canAccessApp) {
    return <Navigate to="/plans" replace state={{ subscriptionLockout: true }} />;
  }

  return <Outlet />;
}
