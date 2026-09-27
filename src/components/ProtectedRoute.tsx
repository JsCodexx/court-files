import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
  if (user) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
