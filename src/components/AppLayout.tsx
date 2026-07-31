import React, { useState } from 'react';
import { Menu, Scale } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../i18n/LocaleContext';
import { cn } from '../lib/utils';
import { LanguageSwitcher } from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import { Button } from './ui/button';

export function AppLayout() {
  const { user, logout } = useAuth();
  const { t } = useLocale();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const links = [
    { to: '/dashboard', label: t('nav.dashboard') },
    { to: '/cases/new', label: t('nav.addCase') },
    { to: '/calendar', label: t('nav.calendar') },
    { to: '/search', label: t('nav.search') },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen">
      {open && (
        <div
          className="fixed inset-0 z-30 bg-foreground/50 backdrop-blur-[2px] lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 start-0 z-40 flex w-72 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full lg:rtl:translate-x-0'
        )}
      >
        <div className="border-b border-sidebar-foreground/10 px-6 py-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-sidebar-accent/20 text-sidebar-accent">
              <Scale className="h-5 w-5" />
            </span>
            <div>
              <p className="font-display text-xl font-semibold tracking-wide">
                {t('brand.name')}
              </p>
              <p className="text-xs text-sidebar-muted">{t('brand.sub')}</p>
            </div>
          </div>
        </div>

        <nav
          className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-4"
          onClick={() => setOpen(false)}
        >
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'rounded-md px-4 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-primary-foreground'
                    : 'text-sidebar-muted hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground'
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="space-y-3 border-t border-sidebar-foreground/10 px-4 py-4">
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
            className="w-full justify-start text-sidebar-muted hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground"
            onClick={handleLogout}
          >
            {t('nav.signOut')}
          </Button>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <div className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b bg-card px-4 py-3 lg:hidden">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setOpen(true)}
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
        <div className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
