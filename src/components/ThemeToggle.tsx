import React, { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, Palette } from './icons';
import { ThemePreviewThumb } from './theme/ThemePreviewThumb';
import { motion } from './motion';
import { transitionFast } from '../motion/presets';
import { Button } from './ui/button';
import { useLocale } from '../i18n/LocaleContext';
import { TranslationKey } from '../i18n/translations';
import { computePopoverPlacement } from '../lib/popoverPlacement';
import { cn } from '../lib/utils';
import { useTheme } from '../theme/ThemeContext';
import {
  ThemeMode,
  ThemePalette,
  ThemePreference,
  THEME_PREVIEW_COLORS,
  themePreferenceId,
} from '../theme/themes';

const MENU_WIDTH_COMPACT = 184;
const MENU_WIDTH_FULL = 248;

interface Props {
  className?: string;
  variant?: 'light' | 'dark';
  menuAbove?: boolean;
  /** Full-width labeled row (sidebar / drawer). */
  trigger?: 'icon' | 'row';
  /** 2×2 preview grid instead of a long list. */
  compactMenu?: boolean;
  /** Popover opens to the side of the trigger (desktop sidebar). */
  menuAside?: boolean;
}

const PALETTES: ThemePalette[] = ['forest', 'ocean'];
const MODES: ThemeMode[] = ['light', 'dark'];

const PALETTE_LABEL: Record<ThemePalette, TranslationKey> = {
  forest: 'theme.palette.forest',
  ocean: 'theme.palette.ocean',
};

const MODE_LABEL: Record<ThemeMode, TranslationKey> = {
  light: 'theme.mode.light',
  dark: 'theme.mode.dark',
};

const ALL_PREFERENCES: ThemePreference[] = PALETTES.flatMap((palette) =>
  MODES.map((mode) => ({ palette, mode }))
);

const ThemeToggle: React.FC<Props> = ({
  className,
  variant = 'light',
  menuAbove = false,
  trigger = 'icon',
  compactMenu = false,
  menuAside = false,
}) => {
  const { t } = useLocale();
  const { preference, setPreference, activeThemeId } = useTheme();
  const darkTrigger = variant === 'dark';
  const rowTrigger = trigger === 'row';
  const menuWidth = compactMenu ? MENU_WIDTH_COMPACT : MENU_WIDTH_FULL;
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
        width: menuWidth,
        maxHeight: compactMenu ? 200 : 320,
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
  }, [open, menuAbove, menuAside, rowTrigger, menuWidth, compactMenu]);

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

  const pick = (next: ThemePreference) => {
    setPreference(next);
    setOpen(false);
  };

  const activePreview = THEME_PREVIEW_COLORS[activeThemeId];

  const menuPanel = (
    <div
      className="fixed z-[100]"
      style={{
        top: menuPos.top,
        left: menuPos.left,
        width: menuWidth,
        transform: menuPos.above ? 'translateY(-100%)' : undefined,
      }}
    >
      <motion.div
        id={menuId}
        role="menu"
        aria-label={t('theme.menuLabel')}
        initial={{ opacity: 0, y: menuPos.above ? 4 : -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transitionFast}
        className={cn(
          'overflow-hidden rounded-xl border shadow-lg',
          compactMenu ? 'p-2' : 'py-1',
          darkTrigger
            ? 'border-sidebar-foreground/20 bg-sidebar text-sidebar-foreground'
            : 'border-border bg-popover text-popover-foreground'
        )}
      >
        {compactMenu ? (
          <>
            <p
              className={cn(
                'mb-1.5 px-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em]',
                darkTrigger ? 'text-sidebar-muted' : 'text-muted-foreground'
              )}
            >
              {t('theme.menuLabel')}
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {ALL_PREFERENCES.map((pref) => {
                const id = themePreferenceId(pref);
                const active = activeThemeId === id;
                const preview = THEME_PREVIEW_COLORS[id];
                return (
                  <button
                    key={id}
                    type="button"
                    role="menuitemradio"
                    aria-checked={active}
                    aria-label={`${t(PALETTE_LABEL[pref.palette])} — ${t(MODE_LABEL[pref.mode])}`}
                    className={cn(
                      'relative flex flex-col items-center gap-1 rounded-lg border p-1.5 transition-colors',
                      active
                        ? 'border-sidebar-accent bg-sidebar-foreground/15 ring-1 ring-sidebar-accent/40'
                        : darkTrigger
                          ? 'border-transparent hover:bg-sidebar-foreground/10'
                          : 'border-transparent hover:bg-accent/60'
                    )}
                    onClick={() => pick(pref)}
                  >
                    {preview && (
                      <ThemePreviewThumb colors={preview} size="sm" />
                    )}
                    <span className="max-w-full truncate text-[10px] font-medium leading-tight">
                      {t(PALETTE_LABEL[pref.palette])}
                    </span>
                    <span className="text-[9px] opacity-70">
                      {t(MODE_LABEL[pref.mode])}
                    </span>
                    {active && (
                      <Check
                        className="absolute end-1 top-1 h-3 w-3 text-sidebar-accent"
                        weight="bold"
                        aria-hidden
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          PALETTES.map((palette) => (
            <div key={palette} className="py-0.5">
              <p
                className={cn(
                  'px-3 pb-1 pt-2 text-[0.65rem] font-semibold uppercase tracking-[0.14em]',
                  darkTrigger ? 'text-sidebar-muted' : 'text-muted-foreground'
                )}
              >
                {t(PALETTE_LABEL[palette])}
              </p>
              {MODES.map((mode) => {
                const id = themePreferenceId({ palette, mode });
                const active = activeThemeId === id;
                const preview = THEME_PREVIEW_COLORS[id];
                return (
                  <button
                    key={id}
                    type="button"
                    role="menuitemradio"
                    aria-checked={active}
                    aria-label={`${t(PALETTE_LABEL[palette])} — ${t(MODE_LABEL[mode])}`}
                    className={cn(
                      'flex w-full items-center gap-2 px-3 py-2 text-start text-sm transition-colors',
                      darkTrigger
                        ? 'text-sidebar-foreground'
                        : 'text-popover-foreground',
                      active
                        ? darkTrigger
                          ? 'bg-sidebar-foreground/15 font-semibold'
                          : 'bg-accent font-semibold text-accent-foreground'
                        : darkTrigger
                          ? 'hover:bg-sidebar-foreground/10'
                          : 'hover:bg-accent/60'
                    )}
                    onClick={() => pick({ palette, mode })}
                  >
                    {preview && (
                      <ThemePreviewThumb colors={preview} size="sm" />
                    )}
                    <span className="min-w-0 flex-1">{t(MODE_LABEL[mode])}</span>
                    <Check
                      className={cn(
                        'h-3.5 w-3.5 shrink-0',
                        active ? 'opacity-100' : 'opacity-0'
                      )}
                      weight="bold"
                      aria-hidden
                    />
                  </button>
                );
              })}
            </div>
          ))
        )}
      </motion.div>
    </div>
  );

  const triggerButton = rowTrigger ? (
    <button
      type="button"
      className={cn(
        'flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-start text-sm transition-colors',
        darkTrigger
          ? 'text-sidebar-foreground hover:bg-sidebar-foreground/10'
          : 'text-foreground hover:bg-accent/60',
        className
      )}
      aria-label={t('theme.menuLabel')}
      aria-expanded={open}
      aria-haspopup="menu"
      aria-controls={menuId}
      onClick={() => setOpen((v) => !v)}
    >
      <Palette className="h-4 w-4 shrink-0 opacity-90" weight="regular" />
      <span className="min-w-0 flex-1 truncate">{t('theme.menuLabel')}</span>
      {activePreview && (
        <ThemePreviewThumb colors={activePreview} size="sm" />
      )}
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
        !darkTrigger && 'min-h-11 min-w-11 sm:min-h-8 sm:min-w-8',
        darkTrigger &&
          'text-sidebar-muted hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground',
        className
      )}
      aria-label={t('theme.menuLabel')}
      aria-expanded={open}
      aria-haspopup="menu"
      aria-controls={menuId}
      title={t(PALETTE_LABEL[preference.palette])}
      onClick={() => setOpen((v) => !v)}
    >
      <Palette className="h-[1.125rem] w-[1.125rem]" weight="regular" />
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
};

export default ThemeToggle;
