import React from 'react';
import { BRAND_ASSETS, brandAssetUrl } from '../constants/brandAssets';
import { cn } from '../lib/utils';

/** CourtDiary book + scales mark (same asset as landing closing section). */
export function BrandEmblem({
  className,
  size = 'md',
  decorative = false,
}: {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Hide from assistive tech when paired with visible wordmark. */
  decorative?: boolean;
}) {
  const sizeClass = {
    sm: 'h-7 w-7',
    md: 'h-9 w-9',
    lg: 'h-12 w-12',
    xl: 'h-28 w-28 sm:h-36 sm:w-36',
  }[size];

  return (
    <img
      src={brandAssetUrl(BRAND_ASSETS.symbolSvg)}
      alt={decorative ? '' : 'CourtDiary'}
      className={cn('shrink-0 object-contain', sizeClass, className)}
      decoding="async"
      aria-hidden={decorative ? true : undefined}
    />
  );
}
