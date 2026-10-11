import React, { useEffect, useState } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  Search,
  UserRound,
} from './icons';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppShell } from '../hooks/useAppShell';
import { useSubscription } from '../hooks/useSubscription';
import { useLocale } from '../i18n/LocaleContext';
import { cn } from '../lib/utils';
import { AppBottomNav } from './AppBottomNav';
import { PwaInstallPrompt } from './PwaInstallPrompt';
import { LanguageSwitcher } from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import { BrandLogo } from './BrandLogo';
import { Button } from './ui/button';

const SIDEBAR_KEY = 'cf_sidebar_open';

export function AppLayout() {
  const { user, logout } = useAuth();
  const { t, dir } = useLocale();
  const navigate = useNavigate();
  const { showBottomNav, showSidebar } = useAppShell();
  const { status: subscription } = useSubscription();
  const billingOnly = Boolean(subscription && !subscription.canAccessApp);
  const [open, setOpen] = useState(() => {
    try {
      const stored = localStorage.getItem(SIDEBAR_KEY);
      if (stored === '0') return false;
      if (stored === '1') return true;
    } catch {
      /* ignore */
    }
    return true;
  });

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_KEY, open ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, [open]);

  const links = billingOnly
    ? [
        { to: '/plans', label: t('nav.plans'), icon: CreditCard },
        { to: '/payments', label: t('profile.quickPayments'), icon: CreditCard },
      ]
    : [
        { to: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
        { to: '/cases/new', label: t('nav.addCase'), icon: PlusCircle },
        { to: '/calendar', label: t('nav.calendar'), icon: CalendarDays },
        { to: '/search', label: t('nav.search'), icon: Search },
        { to: '/plans', label: t('nav.plans'), icon: CreditCard },
        { to: '/profile', label: t('nav.profile'), icon: UserRound },
      ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const expanded = open;

  const CollapseIcon = open
    ? dir === 'rtl'
      ? ChevronRight
      : ChevronLeft
    : dir === 'rtl'
      ? ChevronLeft
      : ChevronRight;

  return (
    <div
      className={cn('flex min-h-[100dvh] overflow-x-clip', showBottomNav && 'has-bottom-nav')}
    >
      {showSidebar && (
      <aside
        className={cn(
          'sticky top-0 z-40 flex h-[100dvh] w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground transition-all duration-200',
          open ? 'w-64' : 'w-[4.25rem]'
        )}
      >
        <div
          className={cn(
            'flex items-center border-b border-sidebar-foreground/10 py-4',
            expanded ? 'justify-between gap-2 px-4' : 'flex-col gap-3 px-2'
          )}
        >
          <div
            className={cn(
              'flex min-w-0 items-center gap-3',
              !expanded && 'justify-center'
            )}
          >
            <BrandLogo
              variant="appSidebar"
              className="h-9 w-9 shrink-0"
            />
            {expanded && (
              <div className="min-w-0">
                <p className="truncate font-display text-lg font-semibold tracking-wide">
                  {t('brand.name')}
                </p>
                <p className="truncate text-[11px] text-sidebar-muted">
                  {t('brand.sub')}
                </p>
              </div>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="inline-flex h-8 w-8 shrink-0 text-sidebar-muted hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? t('nav.collapse') : t('nav.expand')}
            title={open ? t('nav.collapse') : t('nav.expand')}
          >
            <CollapseIcon className="h-4 w-4" />
          </Button>
        </div>

        <nav
          className={cn(
            'flex flex-1 flex-col gap-1 overflow-y-auto py-3',
            expanded ? 'px-3' : 'px-2'
          )}
        >
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                title={link.label}
                className={({ isActive }) =>
                  cn(
                    'flex items-center rounded-md text-sm font-medium transition-colors',
                    expanded ? 'gap-3 px-3 py-2.5' : 'justify-center px-2 py-2.5',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-foreground'
                      : 'text-sidebar-muted hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className="h-4 w-4 shrink-0" weight={isActive ? 'fill' : 'regular'} />
                    {expanded && <span className="truncate">{link.label}</span>}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div
          className={cn(
            'space-y-2 border-t border-sidebar-foreground/10 py-3',
            expanded ? 'px-3' : 'px-2'
          )}
        >
          {expanded ? (
            <>
              <div className="flex items-center justify-between gap-2">
                <LanguageSwitcher variant="dark" />
                <ThemeToggle className="text-sidebar-foreground hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground" />
              </div>
              <NavLink
                to="/profile"
                title={user?.name}
                className="urdu-text block truncate rounded-md bg-sidebar-foreground/10 px-3 py-2 text-sm hover:bg-sidebar-foreground/15"
              >
                {user?.name}
              </NavLink>
              <Button
                type="button"
                variant="ghost"
                className="w-full justify-start gap-2 text-sidebar-muted hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" weight="regular" />
                {t('nav.signOut')}
              </Button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <ThemeToggle className="text-sidebar-foreground hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground" />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-sidebar-muted hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground"
                onClick={handleLogout}
                aria-label={t('nav.signOut')}
                title={t('nav.signOut')}
              >
                <LogOut className="h-4 w-4" weight="regular" />
              </Button>
            </div>
          )}
        </div>
      </aside>
      )}

      <main className="flex min-w-0 flex-1 flex-col bg-background">
        {showBottomNav && (
          <div className="no-print sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-border bg-card/95 px-3 py-2.5 shadow-sm backdrop-blur-sm sm:px-4 pt-[max(0.5rem,env(safe-area-inset-top))]">
            <div className="flex min-w-0 items-center gap-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary p-1 shadow-sm">
                <BrandLogo variant="appMobileBar" className="h-full w-full" />
              </span>
              <strong className="min-w-0 truncate font-display text-base">
                {t('brand.name')}
              </strong>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <LanguageSwitcher variant="light" />
              <ThemeToggle />
            </div>
          </div>
        )}
        <div className="app-main-content min-w-0 flex-1 px-3 py-4 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-5 sm:py-6 md:px-8 md:py-8">
          <PwaInstallPrompt />
          <Outlet />
        </div>
        {showBottomNav && <AppBottomNav />}
      </main>
    </div>
  );
}
