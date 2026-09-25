import React from 'react';
import { Link } from 'react-router-dom';
import { Scale } from 'lucide-react';
import { LanguageSwitcher } from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import { Button } from './ui/button';
import { useLocale } from '../i18n/LocaleContext';

const FOOTER_LINKS = [
  { to: '/about', labelKey: 'site.nav.about' as const },
  { to: '/pricing', labelKey: 'site.nav.pricing' as const },
  { to: '/contact', labelKey: 'site.nav.contact' as const },
  { to: '/terms', labelKey: 'site.nav.terms' as const },
  { to: '/privacy', labelKey: 'site.nav.privacy' as const },
  { to: '/refund-policy', labelKey: 'site.nav.refund' as const },
  { to: '/merchant-info.html', labelKey: 'site.nav.merchant' as const },
];

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
            <span className="truncate font-display text-lg font-semibold tracking-tight sm:text-xl">
              {t('brand.name')}
            </span>
          </Link>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link to="/login">{t('landing.nav.signIn')}</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/register">{t('landing.nav.getStarted')}</Link>
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

      <footer className="mt-auto border-t border-border bg-sidebar text-sidebar-foreground">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-sidebar-accent" />
                <span className="font-display text-sm font-semibold">
                  {t('brand.name')}
                </span>
              </div>
              <p className="mt-2 max-w-sm text-sm text-sidebar-muted">
                {t('landing.footer.rights')}
              </p>
              <p className="mt-1 text-sm text-sidebar-muted" dir="ltr">
                {t('site.company.website')}
              </p>
            </div>
            <nav
              className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm sm:text-end"
              aria-label={t('site.nav.legal')}
            >
              {FOOTER_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  reloadDocument={link.to.endsWith('.html')}
                  className="text-sidebar-muted transition-colors hover:text-sidebar-foreground"
                >
                  {t(link.labelKey)}
                </Link>
              ))}
            </nav>
          </div>
          <p className="mt-6 border-t border-sidebar-foreground/10 pt-4 text-xs text-sidebar-muted">
            {t('site.footer.updated')}
          </p>
        </div>
      </footer>
    </div>
  );
}

export function SiteFooterLinks() {
  const { t } = useLocale();
  return (
    <nav
      className="flex flex-wrap gap-x-4 gap-y-2 text-sm"
      aria-label={t('site.nav.legal')}
    >
      {FOOTER_LINKS.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          reloadDocument={link.to.endsWith('.html')}
          className="text-sidebar-muted transition-colors hover:text-sidebar-foreground"
        >
          {t(link.labelKey)}
        </Link>
      ))}
    </nav>
  );
}
