import React from 'react';
import { PwaInstallPrompt } from './PwaInstallPrompt';
import { useLocale } from '../i18n/LocaleContext';

type AuthPageShellProps = {
  children: React.ReactNode;
  /** Logged-in auth step (e.g. forced password change) — show in-app install banner. */
  signedIn?: boolean;
};

/** Login / register / password flows — safe areas, scroll, install banner. */
export function AuthPageShell({ children, signedIn = false }: AuthPageShellProps) {
  const { dir } = useLocale();

  return (
    <div className="page-shell" dir={dir}>
      <PwaInstallPrompt guest={!signedIn} />
      {children}
    </div>
  );
}
