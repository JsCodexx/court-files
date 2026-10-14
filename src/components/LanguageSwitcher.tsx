import React, { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, Globe } from './icons';
import { motion } from './motion';
import { transitionFast } from '../motion/presets';
import { Button } from './ui/button';
import { useLocale } from '../i18n/LocaleContext';
import { Locale } from '../i18n/translations';
import { computePopoverPlacement } from '../lib/popoverPlacement';
import { cn } from '../lib/utils';

const MENU_WIDTH = 152;

interface Props {
  variant?: 'light' | 'dark';
  menuAbove?: boolean;
  trigger?: 'icon' | 'row';
  menuAside?: boolean;
  className?: string;
}

export function LanguageSwitcher({
  variant = 'light',
  menuAbove = false,
  trigger = 'icon',
  menuAside = false,
  className,
}: Props) {
  const { locale, setLocale, t } = useLocale();
  const dark = variant === 'dark';
  const rowTrigger = trigger === 'row';
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, above: false });

  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const el = rootRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const placement = computePopoverPlacement(rect, {
        width: MENU_WIDTH,
        maxHeight: 120,
        preferAbove: menuAbove || menuAside,
        alignEnd: !menuAside && !rowTrigger,
        alignAside: menuAside,
      });
      setMenuPos({
        top: placement.top,
        left: placement.left,
        above: placement.openAbove,
      });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open, menuAbove, menuAside, rowTrigger]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (rootRef.current?.contains(target)) return;
      const menu = document.getElementById(menuId);
      if (menu?.contains(target)) return;
      setOpen(false);
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
  }, [open, menuId]);

  const options: { code: Locale; label: string }[] = [
    { code: 'en', label: t('lang.en') },
    { code: 'ur', label: t('lang.ur') },
  ];

  const current = options.find((o) => o.code === locale)?.label ?? locale;

  const menuPanel = (
    <div
      className="fixed z-[100]"
      style={{
        top: menuPos.top,
        left: menuPos.left,
        width: MENU_WIDTH,
        transform: menuPos.above ? 'translateY(-100%)' : undefined,
      }}
    >
      <motion.div
        id={menuId}
        role="menu"
        aria-label={t('nav.language')}
        initial={{ opacity: 0, y: menuPos.above ? 4 : -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transitionFast}
        className={cn(
          'min-w-[9.5rem] overflow-hidden rounded-xl border py-1 shadow-lg',
          dark
            ? 'border-sidebar-foreground/20 bg-sidebar text-sidebar-foreground'
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
                'flex w-full items-center gap-2 px-3 py-2.5 text-start text-sm transition-colors',
                dark ? 'text-sidebar-foreground' : 'text-popover-foreground',
                active
                  ? dark
                    ? 'bg-sidebar-foreground/15 font-semibold'
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
    </div>
  );

  const triggerButton = rowTrigger ? (
    <button
      type="button"
      className={cn(
        'flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-start text-sm transition-colors',
        dark
          ? 'text-sidebar-foreground hover:bg-sidebar-foreground/10'
          : 'text-foreground hover:bg-accent/60',
        className
      )}
      aria-label={t('nav.language')}
      aria-expanded={open}
      aria-haspopup="menu"
      aria-controls={menuId}
      onClick={() => setOpen((v) => !v)}
    >
      <Globe className="h-4 w-4 shrink-0 opacity-90" weight="regular" />
      <span className="min-w-0 flex-1 truncate">{t('nav.language')}</span>
      <span
        className={cn(
          'shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
          dark
            ? 'bg-sidebar-foreground/10 text-sidebar-muted'
            : 'bg-muted text-muted-foreground'
        )}
      >
        {locale}
      </span>
      <ChevronDown
        className={cn(
          'h-3.5 w-3.5 shrink-0 opacity-60 transition-transform',
          open && 'rotate-180'
        )}
      />
    </button>
  ) : (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn(
        'h-8 w-8 shrink-0',
        !dark && 'min-h-11 min-w-11 sm:min-h-8 sm:min-w-8',
        dark &&
          'text-sidebar-muted hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground',
        className
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
  );

  return (
    <div
      ref={rootRef}
      className={cn('relative', rowTrigger ? 'w-full' : 'inline-flex')}
    >
      {triggerButton}
      {open && createPortal(menuPanel, document.body)}
    </div>
  );
}
