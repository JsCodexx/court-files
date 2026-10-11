import React, { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, Globe } from './icons';
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
  /** Prefer opening above the trigger (mobile top bar). */
  menuAbove?: boolean;
}

export function LanguageSwitcher({ variant = 'light', menuAbove = false }: Props) {
  const { locale, setLocale, t } = useLocale();
  const dark = variant === 'dark';
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
        preferAbove: menuAbove,
        alignEnd: true,
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
  }, [open, menuAbove]);

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
          'min-w-[9.5rem] overflow-hidden rounded-lg border py-1 shadow-lg',
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
            <span className={cn(code === 'ur' && 'urdu-text flex-1')}>{label}</span>
          </button>
        );
      })}
      </motion.div>
    </div>
  );

  return (
    <div ref={rootRef} className="relative inline-flex">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn(
          'h-8 w-8 shrink-0',
          !dark && 'min-h-11 min-w-11 sm:min-h-8 sm:min-w-8',
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

      {open && createPortal(menuPanel, document.body)}
    </div>
  );
}
