import React, { useEffect, useId, useRef, useState } from 'react';
import { Check, Globe } from './icons';
import { motion } from './motion';
import { transitionFast } from '../motion/presets';
import { Button } from './ui/button';
import { useLocale } from '../i18n/LocaleContext';
import { Locale } from '../i18n/translations';
import { cn } from '../lib/utils';

interface Props {
  variant?: 'light' | 'dark';
}

export function LanguageSwitcher({ variant = 'light' }: Props) {
  const { locale, setLocale, t } = useLocale();
  const dark = variant === 'dark';
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent | TouchEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('touchstart', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('touchstart', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const options: { code: Locale; label: string }[] = [
    { code: 'en', label: t('lang.en') },
    { code: 'ur', label: t('lang.ur') },
  ];

  const current = options.find((o) => o.code === locale)?.label ?? locale;

  return (
    <div ref={rootRef} className="relative inline-flex">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn(
          'h-8 w-8 shrink-0',
          dark &&
            'text-sidebar-muted hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground'
        )}
        aria-label={t('nav.language')}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        title={current}
        onClick={() => setOpen((v) => !v)}
      >
        <Globe className="h-[1.125rem] w-[1.125rem]" weight="regular" />
      </Button>

      {open && (
        <motion.div
          id={menuId}
          role="menu"
          aria-label={t('nav.language')}
          initial={{ opacity: 0, y: -4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={transitionFast}
          className={cn(
            'absolute end-0 top-full z-50 mt-1 min-w-[9.5rem] overflow-hidden rounded-lg border py-1 shadow-lg',
            dark
              ? 'border-sidebar-foreground/15 bg-sidebar text-sidebar-foreground'
              : 'border-border bg-popover text-popover-foreground'
          )}
        >
          {options.map(({ code, label }) => {
            const active = locale === code;
            return (
              <button
                key={code}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                className={cn(
                  'flex w-full items-center gap-2 px-3 py-2 text-start text-sm transition-colors',
                  active
                    ? dark
                      ? 'bg-sidebar-foreground/10 font-semibold'
                      : 'bg-accent font-semibold text-accent-foreground'
                    : dark
                      ? 'hover:bg-sidebar-foreground/10'
                      : 'hover:bg-accent/60'
                )}
                onClick={() => {
                  setLocale(code);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    'h-4 w-4 shrink-0',
                    active ? 'opacity-100' : 'opacity-0'
                  )}
                  weight="bold"
                  aria-hidden
                />
                <span className={cn(code === 'ur' && 'urdu-text flex-1')}>
                  {label}
                </span>
              </button>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
