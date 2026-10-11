import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from './icons';
import { BrandLogo } from './BrandLogo';
import { LanguageSwitcher } from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import { Button } from './ui/button';
import { COMPANY } from '../constants/company';
import { useLocale } from '../i18n/LocaleContext';
import { cn } from '../lib/utils';

const SECONDARY_LINKS = [
  { to: '/pricing', labelKey: 'site.nav.pricing' as const },
  { to: '/how-it-works', labelKey: 'site.nav.howItWorks' as const },
  { to: '/checkout', labelKey: 'site.nav.checkout' as const },
  { to: '/contact', labelKey: 'site.nav.contact' as const },
];

export function PublicHeader({
  className,
  showSecondary = true,
}: {
  className?: string;
  /** Show Pricing / How it works / Checkout in the desktop bar and mobile sheet */
  showSecondary?: boolean;
}) {
  const { t } = useLocale();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b border-border bg-card shadow-sm',
        className
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-3 pt-[env(safe-area-inset-top)] sm:h-16 sm:gap-3 sm:px-6 sm:pt-0">
        <Link
          to="/"
          className="flex min-w-0 items-center gap-2 sm:gap-2.5"
          onClick={() => setMenuOpen(false)}
        >
          <BrandLogo
            variant="publicHeader"
            className="h-8 w-auto max-w-[9.5rem] sm:h-9 sm:max-w-[11.5rem]"
          />
          <span className="hidden min-w-0 md:block">
            <span className="truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {COMPANY.legalName}
            </span>
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
          {showSecondary && (
            <nav className="mr-1 hidden items-center gap-0.5 lg:flex">
              {SECONDARY_LINKS.map((link) => (
                <Button key={link.to} asChild variant="ghost" size="sm">
                  <Link to={link.to}>{t(link.labelKey)}</Link>
                </Button>
              ))}
            </nav>
          )}

          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>
          <ThemeToggle className="hidden sm:inline-flex" />

          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-8 px-2 text-[11px] sm:px-3 sm:text-xs"
          >
            <Link to="/login">{t('landing.nav.signIn')}</Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="h-8 px-2 text-[11px] sm:px-3 sm:text-xs"
          >
            <Link to="/checkout">{t('landing.nav.buyNow')}</Link>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="public-mobile-menu"
            aria-label={menuOpen ? t('nav.closeMenu') : t('nav.menu')}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {menuOpen && (
        <>
          <div
            className="fixed inset-0 top-14 z-30 bg-foreground/40 backdrop-blur-[1px] sm:top-16 lg:hidden"
            onClick={() => setMenuOpen(false)}
            aria-hidden
          />
          <div
            id="public-mobile-menu"
            className="absolute inset-x-0 top-full z-40 max-h-[min(70dvh,calc(100dvh-3.5rem-env(safe-area-inset-top)))] overflow-y-auto border-b border-border bg-card shadow-lg lg:hidden"
          >
            <div className="mx-auto flex max-w-6xl flex-col gap-3 px-3 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
              <div className="flex items-center justify-between gap-2 sm:hidden">
                <LanguageSwitcher />
                <ThemeToggle />
              </div>

              {showSecondary && (
                <nav className="flex flex-col gap-1">
                  {SECONDARY_LINKS.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setMenuOpen(false)}
                      className="rounded-md px-3 py-2.5 text-sm font-semibold text-foreground hover:bg-accent"
                    >
                      {t(link.labelKey)}
                    </Link>
                  ))}
                </nav>
              )}

              <div className="grid grid-cols-2 gap-2 border-t border-border pt-3">
                <Button asChild variant="outline" className="w-full">
                  <Link to="/login" onClick={() => setMenuOpen(false)}>
                    {t('landing.nav.signIn')}
                  </Link>
                </Button>
                <Button asChild className="w-full">
                  <Link to="/register" onClick={() => setMenuOpen(false)}>
                    {t('landing.nav.getStarted')}
                  </Link>
                </Button>
              </div>
              <Button asChild className="w-full">
                <Link to="/checkout" onClick={() => setMenuOpen(false)}>
                  {t('landing.nav.buyNow')}
                </Link>
              </Button>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
