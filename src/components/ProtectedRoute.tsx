import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { readSubscriptionAccessCache } from '../context/SubscriptionContext';
import { useSubscription } from '../hooks/useSubscription';

export function ProtectedRoute() {
  const { user, authReady } = useAuth();
  const location = useLocation();

  if (!authReady) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
        …
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (
    user.mustChangePassword &&
    location.pathname !== '/change-password-required'
  ) {
    return <Navigate to="/change-password-required" replace />;
  }

  return <Outlet />;
}

export function PublicOnlyRoute() {
  const { user, authReady } = useAuth();

  if (!authReady) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
        …
      </div>
    );
  }

  if (user?.mustChangePassword) {
    return <Navigate to="/change-password-required" replace />;
  }
  if (user) {
    return <AuthenticatedHomeRedirect />;
  }
  return <Outlet />;
}

/** Send paid/active users to the app; locked-out users to plans (not dashboard). */
function AuthenticatedHomeRedirect() {
  const { user } = useAuth();
  const { status } = useSubscription();
  const cached = readSubscriptionAccessCache(user?.userId);

  const canAccess =
    status != null
      ? status.canAccessApp
      : cached === false
        ? false
        : true;

  return (
    <Navigate to={canAccess ? '/dashboard' : '/plans'} replace />
  );
}
