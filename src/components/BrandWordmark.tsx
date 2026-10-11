import React from 'react';
import { BRAND_WORDMARK } from '../constants/brand';
import { cn } from '../lib/utils';

type BrandWordmarkProps = {
  /** sm = app bar · md = sidebar · lg = auth · xl = hero */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Dark forest chrome (sidebar / footer) */
  onDark?: boolean;
  /** Green CTA band — white + fresh accent */
  onPrimary?: boolean;
  /** White card behind text (hero, public headers) */
  plate?: boolean;
  className?: string;
};

const SIZE: Record<NonNullable<BrandWordmarkProps['size']>, string> = {
  sm: 'text-base tracking-tight',
  md: 'text-lg tracking-tight',
  lg: 'text-2xl tracking-tight sm:text-3xl',
  xl: 'text-3xl tracking-tight sm:text-5xl lg:text-6xl',
};

export function BrandWordmark({
  size = 'md',
  onDark = false,
  onPrimary = false,
  plate = false,
  className,
}: BrandWordmarkProps) {
  const courtClass = onPrimary
    ? 'text-primary-foreground'
    : onDark
      ? 'text-sidebar-foreground'
      : 'text-[hsl(var(--brand-forest))]';

  const diaryClass = onPrimary
    ? 'text-[hsl(135_55%_78%)]'
    : onDark
      ? 'text-[hsl(var(--brand-fresh))]'
      : 'text-[hsl(var(--brand-fresh))]';

  const inner = (
    <span
      className={cn('font-display font-semibold leading-none', SIZE[size])}
      aria-label={`${BRAND_WORDMARK.court}${BRAND_WORDMARK.diary}`}
    >
      <span className={courtClass}>{BRAND_WORDMARK.court}</span>
      <span className={diaryClass}>{BRAND_WORDMARK.diary}</span>
    </span>
  );

  if (!plate || onPrimary || onDark) {
    return <span className={className}>{inner}</span>;
  }

  return (
    <span
      className={cn(
        'brand-plate',
        size === 'xl' && 'brand-plate--hero',
        className
      )}
    >
      {inner}
    </span>
  );
}
