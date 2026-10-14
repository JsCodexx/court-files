import React from 'react';
import { cn } from '../../lib/utils';
import { ThemePreviewColors } from '../../theme/themes';

type Props = {
  colors: ThemePreviewColors;
  className?: string;
  size?: 'sm' | 'md';
};

/** Tiny app-shell mock for theme picker (sidebar + card + accent). */
export function ThemePreviewThumb({
  colors,
  className,
  size = 'md',
}: Props) {
  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden rounded shadow-sm ring-1 ring-black/10 dark:ring-white/15',
        size === 'sm' ? 'h-7 w-11' : 'h-11 w-[4.5rem]',
        className
      )}
      style={{ backgroundColor: colors.canvas }}
      aria-hidden
    >
      <div className="flex h-full">
        <div
          className="h-full w-[30%] shrink-0"
          style={{ backgroundColor: colors.sidebar }}
        />
        <div className="flex min-w-0 flex-1 flex-col gap-[3px] p-[4px]">
          <div
            className="h-[5px] w-full shrink-0 rounded-[2px]"
            style={{ backgroundColor: colors.header }}
          />
          <div
            className="min-h-0 flex-1 rounded-[2px]"
            style={{
              backgroundColor: colors.card,
              boxShadow: `inset 0 0 0 1px ${colors.border}`,
            }}
          />
          <div
            className="h-[6px] w-[58%] shrink-0 rounded-[2px]"
            style={{ backgroundColor: colors.accent }}
          />
        </div>
      </div>
    </div>
  );
}
