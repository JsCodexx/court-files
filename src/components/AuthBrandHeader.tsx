import React from 'react';
import { Link } from 'react-router-dom';
import { BrandWordmark } from './BrandWordmark';
import { useLocale } from '../i18n/LocaleContext';

/** Sign-in / register — same wordmark treatment as landing hero. */
export function AuthBrandHeader() {
  const { t } = useLocale();

  return (
    <Link
      to="/"
      className="mb-4 flex flex-col items-center gap-2 text-center no-underline"
    >
      <BrandWordmark size="lg" plate />
      <p className="page-eyebrow">{t('landing.hero.tagline')}</p>
      <p className="text-xs font-medium text-muted-foreground">{t('brand.sub')}</p>
    </Link>
  );
}
