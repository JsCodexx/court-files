import React from 'react';
import { CompanyFooter } from '../CompanyFooter';
import { PublicHeader } from '../PublicHeader';
import { PwaInstallPrompt } from '../PwaInstallPrompt';
import { useLocale } from '../../i18n/LocaleContext';
import { cn } from '../../lib/utils';

/** Shared max width + horizontal padding (landing, public pages, app main column). */
export function LayoutContainer({
  children,
  className,
  as: Component = 'div',
}: {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'main' | 'section' | 'header' | 'footer';
}) {
  return <Component className={cn('layout-container', className)}>{children}</Component>;
}

type SectionSpacing = 'default' | 'tight' | 'hero';

const SECTION_SPACING: Record<SectionSpacing, string> = {
  default: 'public-section-y',
  tight: 'public-section-y-tight',
  hero: 'public-section-y-hero',
};

/** Full-bleed section background with aligned inner content width. */
export function PublicSection({
  id,
  className,
  containerClassName,
  spacing = 'default',
  children,
}: {
  id?: string;
  className?: string;
  containerClassName?: string;
  spacing?: SectionSpacing;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={className}>
      <LayoutContainer
        className={cn(SECTION_SPACING[spacing], containerClassName)}
      >
        {children}
      </LayoutContainer>
    </section>
  );
}

/** Public marketing chrome: header, scrollable main, footer. */
export function PublicSiteFrame({
  children,
  headerClassName,
}: {
  children: React.ReactNode;
  headerClassName?: string;
}) {
  const { dir } = useLocale();

  return (
    <div
      className="flex min-h-[100dvh] flex-col bg-background pb-[env(safe-area-inset-bottom)]"
      dir={dir}
    >
      <PublicHeader className={headerClassName} />
      <main className="site-main-surface min-w-0 flex-1">{children}</main>
      <PwaInstallPrompt guest />
      <CompanyFooter />
    </div>
  );
}

/** Standard vertical rhythm for SiteShell / doc pages (single column in layout container). */
export function PublicPageBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <LayoutContainer className={cn('public-page-y', className)}>
      <div className="public-page-stack min-w-0">{children}</div>
    </LayoutContainer>
  );
}
