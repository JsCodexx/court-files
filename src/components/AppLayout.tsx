import React, { useEffect, useState } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Menu,
  PlusCircle,
  Scale,
  Search,
} from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../i18n/LocaleContext';
import { cn } from '../lib/utils';
import { LanguageSwitcher } from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import { Button } from './ui/button';

const SIDEBAR_KEY = 'cf_sidebar_open';

export function AppLayout() {
  const { user, logout } = useAuth();
  const { t, dir } = useLocale();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
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

  const links = [
    { to: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { to: '/cases/new', label: t('nav.addCase'), icon: PlusCircle },
    { to: '/calendar', label: t('nav.calendar'), icon: CalendarDays },
    { to: '/search', label: t('nav.search'), icon: Search },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const CollapseIcon = open
    ? dir === 'rtl'
      ? ChevronRight
      : ChevronLeft
    : dir === 'rtl'
      ? ChevronLeft
      : ChevronRight;

  return (
    <div className="flex min-h-screen">
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-foreground/50 backdrop-blur-[2px] lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 start-0 z-40 flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-200',
          'lg:sticky lg:top-0 lg:h-screen lg:translate-x-0',
          open ? 'w-64' : 'w-[4.25rem]',
          mobileOpen
            ? 'translate-x-0'
            : '-translate-x-full rtl:translate-x-full lg:rtl:translate-x-0'
        )}
      >
        <div
          className={cn(
            'flex items-center border-b border-sidebar-foreground/10 py-4',
            open ? 'justify-between gap-2 px-4' : 'flex-col gap-3 px-2'
          )}
        >
          <div
            className={cn(
              'flex min-w-0 items-center gap-3',
              !open && 'justify-center'
            )}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-sidebar-accent/20 text-sidebar-accent">
              <Scale className="h-4 w-4" />
            </span>
            {open && (
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
            className="hidden h-8 w-8 shrink-0 text-sidebar-muted hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground lg:inline-flex"
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
            open ? 'px-3' : 'px-2'
          )}
          onClick={() => setMobileOpen(false)}
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
                    open ? 'gap-3 px-3 py-2.5' : 'justify-center px-2 py-2.5',
                    isActive
                      ? 'bg-sidebar-accent text-primary-foreground'
                      : 'text-sidebar-muted hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground'
                  )
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                {open && <span className="truncate">{link.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        <div
          className={cn(
            'space-y-2 border-t border-sidebar-foreground/10 py-3',
            open ? 'px-3' : 'px-2'
          )}
        >
          {open ? (
            <>
              <div className="flex items-center justify-between gap-2">
                <LanguageSwitcher variant="dark" />
                <ThemeToggle className="text-sidebar-foreground hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground" />
              </div>
              <div className="urdu-text truncate rounded-md bg-sidebar-foreground/10 px-3 py-2 text-sm">
                {user?.name}
              </div>
              <Button
                type="button"
                variant="ghost"
                className="w-full justify-start gap-2 text-sidebar-muted hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
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
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <div className="no-print sticky top-0 z-20 flex items-center justify-between gap-2 border-b bg-card/95 px-4 py-3 backdrop-blur-[2px] lg:hidden">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-4 w-4" />
            {t('nav.menu')}
          </Button>
          <strong className="font-display text-lg">{t('brand.name')}</strong>
          <div className="flex items-center gap-1">
            <LanguageSwitcher variant="light" />
            <ThemeToggle />
          </div>
        </div>
        <div className="flex-1 px-3 py-4 sm:px-5 sm:py-6 md:px-8 md:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
