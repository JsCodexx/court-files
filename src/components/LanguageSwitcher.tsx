import React from 'react';
import { useLocale } from '../i18n/LocaleContext';
import { Locale } from '../i18n/translations';
import { cn } from '../lib/utils';

interface Props {
  variant?: 'light' | 'dark';
}

export function LanguageSwitcher({ variant = 'light' }: Props) {
  const { locale, setLocale, t } = useLocale();
  const dark = variant === 'dark';

  return (
    <div
      className={cn(
        'inline-flex items-center gap-0.5 rounded-md border p-0.5',
        dark ? 'border-sidebar-foreground/20' : 'border-border bg-card'
      )}
      role="group"
      aria-label={t('nav.language')}
    >
      {(['ur', 'en'] as Locale[]).map((code) => {
        const active = locale === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLocale(code)}
            aria-pressed={active}
            className={cn(
              'rounded-sm px-2.5 py-1 text-xs font-semibold transition-colors',
              active
                ? 'bg-primary text-primary-foreground'
                : dark
                  ? 'text-sidebar-muted hover:text-sidebar-foreground'
                  : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {t(code === 'ur' ? 'lang.ur' : 'lang.en')}
          </button>
        );
      })}
    </div>
  );
}
