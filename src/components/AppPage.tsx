import React from 'react';
import { cn } from '../lib/utils';

/**
 * Standard in-app page shell: responsive width, spacing, and overflow safety (PWA-friendly).
 */
export function AppPage({
  children,
  className,
  narrow,
  wide,
}: {
  children: React.ReactNode;
  className?: string;
  narrow?: boolean;
  wide?: boolean;
}) {
  return (
    <div
      className={cn(
        'app-page',
        narrow && 'app-page--narrow',
        wide && 'app-page--wide',
        className
      )}
    >
      {children}
    </div>
  );
}

export function PageHeader({
  children,
  className,
  actions,
}: {
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className={cn('page-header', className)}>
      <div className="page-header__main">{children}</div>
      {actions ? <div className="page-actions">{actions}</div> : null}
    </div>
  );
}
