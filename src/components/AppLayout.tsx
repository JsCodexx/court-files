import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
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
  X,
} from './icons';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion } from './motion';
import { transitionFast } from '../motion/presets';
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
import { BrandWordmark } from './BrandWordmark';
import { Button } from './ui/button';

const SIDEBAR_KEY = 'cf_sidebar_open';

export function AppLayout() {
  const { user, logout } = useAuth();
  const { t, dir } = useLocale();
  const navigate = useNavigate();
  const { showBottomNav, showSidebar } = useAppShell();
  const { status: subscription } = useSubscription();
  const billingOnly = Boolean(subscription && !subscription.canAccessApp);
  const [accountDrawerOpen, setAccountDrawerOpen] = useState(false);
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

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('app-in-shell');
    if (showBottomNav) {
      root.classList.add('has-bottom-nav');
    } else {
      root.classList.remove('has-bottom-nav');
    }
    return () => {
      root.classList.remove('app-in-shell', 'has-bottom-nav');
    };
  }, [showBottomNav]);

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
      className={cn(
        'app-shell-root flex h-[100dvh] max-h-[100dvh] min-h-0 overflow-hidden',
        showBottomNav && 'has-bottom-nav'
      )}
    >
      {showSidebar && (
        <aside
          className={cn(
            'z-40 flex h-full min-h-0 w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground transition-all duration-200',
            open ? 'w-64' : 'w-[4.25rem]'
          )}
        >
          <div
            className={cn(
              'flex shrink-0 items-center border-b border-sidebar-foreground/10 py-4',
              expanded ? 'justify-between gap-2 px-4' : 'flex-col gap-3 px-2'
            )}
          >
            <div
              className={cn(
                'flex min-w-0 items-center gap-3',
                !expanded && 'justify-center'
              )}
            >
              <BrandLogo variant="appSidebar" className="h-9 w-9 shrink-0" />
              {expanded && (
                <div className="min-w-0">
                  <BrandWordmark size="md" onDark className="truncate" />
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
              'flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto py-3',
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
                      'flex items-center rounded-xl text-sm font-medium transition-colors',
                      expanded ? 'gap-3 px-3 py-2.5' : 'justify-center px-2 py-2.5',
                      isActive
                        ? 'bg-sidebar-accent text-sidebar-foreground shadow-sm'
                        : 'text-sidebar-muted hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className="h-4 w-4 shrink-0"
                        weight={isActive ? 'fill' : 'regular'}
                      />
                      {expanded && <span className="truncate">{link.label}</span>}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          <div
            className={cn(
              'shrink-0 border-t border-sidebar-foreground/10 py-3',
              expanded ? 'px-3' : 'px-2'
            )}
          >
            {expanded ? (
              <div className="space-y-2 rounded-xl border border-sidebar-foreground/10 bg-sidebar-foreground/[0.06] p-2">
                <NavLink
                  to="/profile"
                  title={user?.name}
                  className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-sidebar-foreground/10"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-sm font-bold text-sidebar-foreground">
                    {(user?.name ?? '?').charAt(0).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="urdu-text block truncate text-sm font-semibold">
                      {user?.name}
                    </span>
                    {user?.email && (
                      <span
                        className="block truncate text-[11px] text-sidebar-muted"
                        dir="ltr"
                      >
                        {user.email}
                      </span>
                    )}
                  </span>
                </NavLink>
                <div className="space-y-0.5 border-t border-sidebar-foreground/10 pt-2">
                  <LanguageSwitcher
                    variant="dark"
                    trigger="row"
                    menuAside
                  />
                  <ThemeToggle
                    variant="dark"
                    trigger="row"
                    compactMenu
                    menuAside
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-9 w-full justify-start gap-2 rounded-xl text-sidebar-muted hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" weight="regular" />
                  {t('nav.signOut')}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5">
                <NavLink
                  to="/profile"
                  title={user?.name}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-accent text-sm font-bold text-sidebar-foreground hover:opacity-90"
                >
                  {(user?.name ?? '?').charAt(0).toUpperCase()}
                </NavLink>
                <LanguageSwitcher variant="dark" menuAbove />
                <ThemeToggle variant="dark" menuAbove compactMenu />
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

      <main className="app-main-surface flex min-h-0 min-w-0 flex-1 flex-col bg-background">
        {showBottomNav && (
          <header className="app-mobile-top-bar no-print shrink-0">
            <div className="app-content-column flex items-center justify-between gap-2 py-2.5">
              <div className="flex min-w-0 items-center gap-2">
                <BrandLogo variant="appMobileBar" className="h-8 w-8 shrink-0" />
                <BrandWordmark onDark size="sm" className="min-w-0 truncate" />
              </div>
              <div className="flex shrink-0 items-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-sidebar-muted hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground"
                  onClick={() => setAccountDrawerOpen(true)}
                  aria-label={t('nav.profile')}
                  title={t('nav.profile')}
                >
                  <UserRound className="h-[1.125rem] w-[1.125rem]" weight="regular" />
                </Button>
              </div>
            </div>
          </header>
        )}

        <div className="app-main-scroll min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain">
          <div className="app-main-content">
            <PwaInstallPrompt />
            <div className="app-content-column">
              <Outlet />
            </div>
          </div>
        </div>

        {showBottomNav && (
          <AppBottomNav onOpenAccountMenu={() => setAccountDrawerOpen(true)} />
        )}
        <AppAccountDrawer
          open={accountDrawerOpen}
          onOpenChange={setAccountDrawerOpen}
        />
      </main>
    </div>
  );
}

function AppAccountDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useLocale();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onOpenChange]);

  const close = () => onOpenChange(false);

  const onSignOut = () => {
    close();
    logout();
    navigate('/');
  };

  if (!open) return null;

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[60] bg-foreground/45 backdrop-blur-[1px]"
        onClick={close}
        aria-hidden
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-account-drawer-title"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        transition={transitionFast}
        className={cn(
          'fixed inset-x-0 bottom-0 z-[61] rounded-t-2xl border-t border-sidebar-foreground/15 bg-sidebar text-sidebar-foreground shadow-2xl',
          'pb-[max(0.75rem,env(safe-area-inset-bottom))]'
        )}
      >
        <div className="mx-auto max-w-lg px-4 pt-3">
          <div className="mb-1 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2
                id="app-account-drawer-title"
                className="urdu-text truncate font-display text-lg font-semibold"
              >
                {user?.name ?? t('nav.profile')}
              </h2>
              {user?.email && (
                <p className="truncate text-sm text-sidebar-muted" dir="ltr">
                  {user.email}
                </p>
              )}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-sidebar-muted hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground"
              onClick={close}
              aria-label={t('common.cancel')}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-3 space-y-2 pb-2">
            <div className="space-y-0.5 rounded-xl border border-sidebar-foreground/10 bg-sidebar-foreground/[0.06] p-1.5">
              <LanguageSwitcher variant="dark" trigger="row" menuAbove />
              <ThemeToggle
                variant="dark"
                trigger="row"
                compactMenu
                menuAbove
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              className="h-11 w-full justify-start gap-3 rounded-xl text-sidebar-foreground hover:bg-sidebar-foreground/10"
              asChild
            >
              <Link to="/profile" onClick={close}>
                <UserRound className="h-5 w-5 shrink-0" weight="duotone" />
                {t('nav.profile')}
              </Link>
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-11 w-full justify-start gap-3 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={onSignOut}
            >
              <LogOut className="h-5 w-5 shrink-0" weight="regular" />
              {t('nav.signOut')}
            </Button>
          </div>
        </div>
      </motion.div>
    </>,
    document.body
  );
}
