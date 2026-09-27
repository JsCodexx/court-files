import React from 'react';
import { Link } from 'react-router-dom';
import { Scale } from 'lucide-react';
import { CompanyFooter } from './CompanyFooter';
import { LanguageSwitcher } from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import { Button } from './ui/button';
import { COMPANY } from '../constants/company';
import { useLocale } from '../i18n/LocaleContext';

export function SiteShell({
  children,
  wide = false,
}: {
  children: React.ReactNode;
  wide?: boolean;
}) {
  const { t, dir } = useLocale();

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background" dir={dir}>
      <header className="sticky top-0 z-40 border-b border-border bg-card shadow-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
          <Link to="/" className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Scale className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {COMPANY.legalName}
              </span>
              <span className="block truncate font-display text-lg font-semibold tracking-tight sm:text-xl">
                {COMPANY.productName}
              </span>
            </span>
          </Link>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
              <Link to="/pricing">{t('site.nav.pricing')}</Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link to="/checkout">{t('site.nav.checkout')}</Link>
            </Button>
            <LanguageSwitcher />
            <ThemeToggle />
            <Button asChild variant="ghost" size="sm" className="hidden lg:inline-flex">
              <Link to="/login">{t('landing.nav.signIn')}</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/checkout">{t('landing.nav.buyNow')}</Link>
            </Button>
          </div>
        </div>
      </header>

      <main
        className={
          wide
            ? 'mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-14'
            : 'mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 sm:py-14'
        }
      >
        {children}
      </main>

      <CompanyFooter />
    </div>
  );
}

export { SiteFooterLinks } from './CompanyFooter';
