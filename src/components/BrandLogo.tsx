import React from 'react';
import { BRAND_ASSETS, brandAssetUrl } from '../constants/brandAssets';
import { BRAND_WORDMARK as BRAND_WORDMARK_TEXT } from '../constants/brand';
import { useTheme } from '../theme/ThemeContext';
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

export function BrandLogo({ variant, className }: BrandLogoProps) {
  const { theme } = useTheme();
  const alt = `${BRAND_WORDMARK_ALT} logo`;

  let src: string;
  switch (variant) {
    case 'publicHeader':
    case 'auth':
      src =
        theme === 'dark'
          ? BRAND_ASSETS.primaryHorizontalSvg
          : BRAND_ASSETS.webLogoHeader;
      break;
    case 'appSidebar':
      src = BRAND_ASSETS.symbolWhiteSvg;
      break;
    case 'appMobileBar':
      src = BRAND_ASSETS.symbolWhiteSvg;
      break;
    case 'footer':
      src = BRAND_ASSETS.primaryHorizontalSvg;
      break;
    default:
      src = BRAND_ASSETS.symbolSvg;
  }

  return (
    <img
      src={brandAssetUrl(src)}
      alt={alt}
      className={cn('object-contain object-left', className)}
      decoding="async"
      fetchPriority={
        variant === 'publicHeader' || variant === 'auth' ? 'high' : 'auto'
      }
    />
  );
}

const BRAND_WORDMARK_ALT = `${BRAND_WORDMARK_TEXT.court}${BRAND_WORDMARK_TEXT.diary}`;
