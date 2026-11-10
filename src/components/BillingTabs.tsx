import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useLocale } from '../i18n/LocaleContext';
import { cn } from '../lib/utils';

const tabs = [
  {
    to: '/plans',
    labelKey: 'plans.title' as const,
    end: true,
    isActive: (p: string) => p === '/plans',
  },
  {
    to: '/payments',
    labelKey: 'payments.title' as const,
    end: true,
    isActive: (p: string) => p === '/payments',
  },
  {
    to: '/payments/manual',
    labelKey: 'nav.billingManual' as const,
    end: false,
    isActive: (p: string) => p.startsWith('/payments/manual'),
  },
];

export function BillingTabs() {
  const { t, dir } = useLocale();
  const { pathname } = useLocation();

  return (
    <div
      role="tablist"
      aria-label={t('nav.billingSection')}
      dir={dir}
      className="scroll-x-tabs border-b"
    >
      {tabs.map((tab) => {
        const active = tab.isActive(pathname);
        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            role="tab"
            aria-selected={active}
            className={cn(
              'relative px-3 py-2 text-sm font-medium transition-colors',
              active
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {t(tab.labelKey)}
            <span
              className={cn(
                'absolute inset-x-2 -bottom-px h-0.5 rounded-full',
                active ? 'bg-primary' : 'bg-transparent'
              )}
            />
          </NavLink>
        );
      })}
    </div>
  );
}
