import React from 'react';
import { BRAND_ASSETS, brandAssetUrl } from '../constants/brandAssets';
import { COMPANY } from '../constants/company';
import { useTheme } from '../theme/ThemeContext';
import { cn } from '../lib/utils';

export type BrandLogoVariant =
  | 'publicHeader'
  | 'appSidebar'
  | 'appMobileBar'
  | 'footer';

type BrandLogoProps = {
  variant: BrandLogoVariant;
  className?: string;
};

export function BrandLogo({ variant, className }: BrandLogoProps) {
  const { theme } = useTheme();
  const alt = `${COMPANY.productName} logo`;

  let src: string;
  switch (variant) {
    case 'publicHeader':
      src =
        theme === 'dark'
          ? BRAND_ASSETS.webLogoWhite
          : BRAND_ASSETS.webLogoHeader;
      break;
    case 'appSidebar':
      src = BRAND_ASSETS.symbolWhiteSvg;
      break;
    case 'appMobileBar':
      src = BRAND_ASSETS.symbolWhiteSvg;
      break;
    case 'footer':
      src = BRAND_ASSETS.webLogoWhite;
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
      fetchPriority={variant === 'publicHeader' ? 'high' : 'auto'}
    />
  );
}
