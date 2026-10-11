import React from 'react';
import { CompanyFooter } from './CompanyFooter';
import { PublicHeader } from './PublicHeader';
import { PwaInstallPrompt } from './PwaInstallPrompt';
import { useLocale } from '../i18n/LocaleContext';

export function SiteShell({
  children,
  wide = false,
}: {
  children: React.ReactNode;
  wide?: boolean;
}) {
  const { dir } = useLocale();

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background" dir={dir}>
      <PublicHeader />

      <main
        className={
          wide
            ? 'site-main-surface mx-auto w-full min-w-0 max-w-6xl flex-1 px-3 py-8 pb-[max(2rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-14'
            : 'site-main-surface mx-auto w-full min-w-0 max-w-3xl flex-1 px-3 py-8 pb-[max(2rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-14'
        }
      >
        {children}
      </main>

      <PwaInstallPrompt guest />
      <CompanyFooter />
    </div>
  );
}

export { SiteFooterLinks } from './CompanyFooter';
