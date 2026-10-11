import React from 'react';
import { useLocale } from '../i18n/LocaleContext';
import { cn } from '../lib/utils';

/**
 * Standard in-app page shell: spacing and overflow safety (width via AppLayout column).
 */
export function AppPage({
  children,
  className,
  /** @deprecated Width is unified — kept for call-site compatibility */
  narrow,
  /** @deprecated Width is unified — kept for call-site compatibility */
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
        (narrow || wide) && 'app-page--wide',
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

/** In-app page title block — matches landing typography (eyebrow + forest headline). */
export function AppPageHeader({
  title,
  lede,
  hideEyebrow,
  className,
}: {
  title: string;
  lede?: string;
  hideEyebrow?: boolean;
  className?: string;
}) {
  const { t } = useLocale();
  return (
    <div className={cn('app-page-header', className)}>
      {!hideEyebrow && <p className="page-eyebrow">{t('brand.sub')}</p>}
      <h1 className="page-title">{title}</h1>
      {lede ? <p className="page-lede">{lede}</p> : null}
    </div>
  );
}
