import React from 'react';
import {
  CalendarDays,
  CreditCard,
  LayoutDashboard,
  PlusCircle,
  Search,
  UserRound,
} from './icons';
import { NavLink, useLocation } from 'react-router-dom';
import { useLocale } from '../i18n/LocaleContext';
import { useSubscription } from '../hooks/useSubscription';
import { cn } from '../lib/utils';
import { isBillingRoute } from '../utils/billingRoutes';

type TabKey = 'dashboard' | 'calendar' | 'add' | 'search' | 'billing' | 'profile';

const tabs: {
  key: TabKey;
  to: string;
  labelKey:
    | 'nav.tabHome'
    | 'nav.tabCalendar'
    | 'nav.tabAdd'
    | 'nav.tabSearch'
    | 'nav.tabPlans'
    | 'nav.tabProfile';
  icon: typeof LayoutDashboard;
  center?: boolean;
}[] = [
  { key: 'dashboard', to: '/dashboard', labelKey: 'nav.tabHome', icon: LayoutDashboard },
  { key: 'calendar', to: '/calendar', labelKey: 'nav.tabCalendar', icon: CalendarDays },
  { key: 'add', to: '/cases/new', labelKey: 'nav.tabAdd', icon: PlusCircle, center: true },
  { key: 'search', to: '/search', labelKey: 'nav.tabSearch', icon: Search },
  { key: 'billing', to: '/plans', labelKey: 'nav.tabPlans', icon: CreditCard },
  { key: 'profile', to: '/profile', labelKey: 'nav.tabProfile', icon: UserRound },
];

const billingTabs = [
  {
    key: 'billing' as const,
    to: '/plans',
    labelKey: 'nav.tabPlans' as const,
    icon: CreditCard,
  },
  {
    key: 'profile' as const,
    to: '/profile',
    labelKey: 'nav.tabProfile' as const,
    icon: UserRound,
  },
];

function isTabActive(pathname: string, key: TabKey): boolean {
  switch (key) {
    case 'dashboard':
      return (
        pathname === '/dashboard' ||
        /^\/cases\/[^/]+\/(detail|history)$/.test(pathname)
      );
    case 'calendar':
      return pathname === '/calendar';
    case 'add':
      return pathname === '/cases/new' || /^\/cases\/[^/]+\/edit$/.test(pathname);
    case 'search':
      return pathname === '/search';
    case 'billing':
      return isBillingRoute(pathname);
    case 'profile':
      return pathname.startsWith('/profile');
    default:
      return false;
  }
}

type AppBottomNavProps = {
  onOpenAccountMenu?: () => void;
};

export function AppBottomNav({ onOpenAccountMenu }: AppBottomNavProps) {
  const { t, dir } = useLocale();
  const { pathname } = useLocation();
  const { status } = useSubscription();
  const billingOnly = Boolean(status && !status.canAccessApp);

  if (billingOnly) {
    return (
      <nav
        className="app-bottom-nav no-print"
        aria-label={t('nav.main')}
        dir={dir}
      >
        <div className="app-bottom-nav__inner app-bottom-nav__inner--billing">
          {billingTabs.map((tab) => {
            const Icon = tab.icon;
            const active =
              tab.key === 'billing'
                ? isBillingRoute(pathname)
                : pathname.startsWith('/profile');
            return (
              <NavLink
                key={tab.key}
                to={tab.to}
                end={tab.key === 'profile'}
                className={cn(
                  'app-bottom-nav__item',
                  active && 'app-bottom-nav__item--active'
                )}
                aria-current={active ? 'page' : undefined}
              >
                <span className="app-bottom-nav__icon-wrap">
                  <Icon
                    className="app-bottom-nav__icon"
                    weight={active ? 'fill' : 'regular'}
                  />
                </span>
                <span className="app-bottom-nav__label">{t(tab.labelKey)}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    );
  }

  return (
    <nav
      className="app-bottom-nav no-print"
      aria-label={t('nav.main')}
      dir={dir}
    >
      <div className="app-bottom-nav__inner">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isTabActive(pathname, tab.key);
          if (tab.key === 'profile' && onOpenAccountMenu) {
            return (
              <button
                key={tab.key}
                type="button"
                className={cn(
                  'app-bottom-nav__item',
                  active && 'app-bottom-nav__item--active'
                )}
                aria-current={active ? 'page' : undefined}
                aria-haspopup="dialog"
                onClick={onOpenAccountMenu}
              >
                <span className="app-bottom-nav__icon-wrap">
                  <Icon
                    className="app-bottom-nav__icon"
                    weight={active ? 'fill' : 'regular'}
                  />
                </span>
                <span className="app-bottom-nav__label">{t(tab.labelKey)}</span>
              </button>
            );
          }
          return (
            <NavLink
              key={tab.key}
              to={tab.to}
              className={cn(
                'app-bottom-nav__item',
                tab.center && 'app-bottom-nav__item--center',
                active && 'app-bottom-nav__item--active'
              )}
              aria-current={active ? 'page' : undefined}
            >
              <span
                className={cn(
                  'app-bottom-nav__icon-wrap',
                  tab.center && 'app-bottom-nav__icon-wrap--center'
                )}
              >
                <Icon
                  className="app-bottom-nav__icon"
                  weight={tab.center || active ? 'fill' : 'regular'}
                />
              </span>
              <span className="app-bottom-nav__label">{t(tab.labelKey)}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
