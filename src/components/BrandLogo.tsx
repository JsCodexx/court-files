import React from 'react';
import { BRAND_ASSETS, brandAssetUrl } from '../constants/brandAssets';
import { BRAND_WORDMARK as BRAND_WORDMARK_TEXT } from '../constants/brand';
import { cn } from '../lib/utils';

export type BrandLogoVariant =
  | 'publicHeader'
  | 'auth'
  | 'appSidebar'
  | 'appMobileBar'
  | 'footer';

type BrandLogoProps = {
  variant: BrandLogoVariant;
  className?: string;
};

const alt = `${BRAND_WORDMARK_TEXT.court}${BRAND_WORDMARK_TEXT.diary} logo`;

/** Square app chrome — colored book + scales emblem. */
const EMBLEM = BRAND_ASSETS.symbolSvg;

/** Horizontal lockup — emblem + CourtDiary wordmark (landing / marketing). */
const HORIZONTAL = BRAND_ASSETS.primaryHorizontalSvg;

export function BrandLogo({ variant, className }: BrandLogoProps) {
  const isEmblem =
    variant === 'appSidebar' ||
    variant === 'appMobileBar';

  const src = isEmblem ? EMBLEM : HORIZONTAL;

  return (
    <img
      src={brandAssetUrl(src)}
      alt={alt}
      className={cn(
        'object-contain object-left',
        isEmblem ? 'aspect-square' : 'h-full w-auto',
        className
      )}
      decoding="async"
      fetchPriority={
        variant === 'publicHeader' || variant === 'auth' ? 'high' : 'auto'
      }
    />
  );
}
