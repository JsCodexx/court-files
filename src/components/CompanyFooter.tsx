import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from './icons';
import { BrandLogo } from './BrandLogo';
import { BrandWordmark } from './BrandWordmark';
import { COMPANY } from '../constants/company';
import { LayoutContainer } from './public/PublicLayout';
import { useLocale } from '../i18n/LocaleContext';

const FOOTER_LINKS = [
  { to: '/about', labelKey: 'site.nav.about' as const },
  { to: '/how-it-works', labelKey: 'site.nav.howItWorks' as const },
  { to: '/pricing', labelKey: 'site.nav.pricing' as const },
  { to: '/checkout', labelKey: 'site.nav.checkout' as const },
  { to: '/contact', labelKey: 'site.nav.contact' as const },
  { to: '/terms', labelKey: 'site.nav.terms' as const },
  { to: '/privacy', labelKey: 'site.nav.privacy' as const },
  { to: '/refund-policy', labelKey: 'site.nav.refund' as const },
  { to: '/merchant-info.html', labelKey: 'site.nav.merchant' as const },
];

export function CompanyFooter() {
  const { t } = useLocale();

  return (
    <footer className="mt-auto border-t border-border bg-sidebar text-sidebar-foreground">
      <LayoutContainer className="py-8 pb-[max(2rem,env(safe-area-inset-bottom))]">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2.5">
                <BrandLogo variant="appSidebar" className="h-9 w-9 shrink-0" />
                <BrandWordmark onDark size="sm" />
              </div>
              <span className="font-display text-sm font-semibold text-sidebar-foreground">
                {COMPANY.legalName}
              </span>
            </div>
            <p className="mt-2 text-sm text-sidebar-muted">
              {t('brand.presents', { product: COMPANY.productName })}
            </p>
            <p className="mt-1 text-sm text-sidebar-muted" dir="ltr">
              {COMPANY.website}
            </p>
          </div>

          <div className="space-y-3 text-sm">
            <p className="font-semibold text-sidebar-foreground">
              {t('site.footer.contactHeading')}
            </p>
            <a
              href={`mailto:${COMPANY.email}`}
              className="flex items-start gap-2 text-sidebar-muted hover:text-sidebar-foreground"
              dir="ltr"
            >
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-sidebar-accent" />
              <span>{COMPANY.email}</span>
            </a>
            <a
              href={`tel:${COMPANY.phone}`}
              className="flex items-start gap-2 text-sidebar-muted hover:text-sidebar-foreground"
              dir="ltr"
            >
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-sidebar-accent" />
              <span>{COMPANY.phoneDisplay}</span>
            </a>
            <p className="flex items-start gap-2 text-sidebar-muted">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sidebar-accent" />
              <span dir="ltr">{COMPANY.address}</span>
            </p>
          </div>

          <nav
            className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm content-start"
            aria-label={t('site.nav.legal')}
          >
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                reloadDocument={link.to.endsWith('.html')}
                className="text-sidebar-muted transition-colors hover:text-sidebar-foreground"
              >
                {t(link.labelKey)}
              </Link>
            ))}
          </nav>
        </div>
        <p className="mt-6 border-t border-sidebar-foreground/10 pt-4 text-xs text-sidebar-muted">
          {t('site.footer.updated')} · {t('site.footer.gatewayNote')}
        </p>
      </LayoutContainer>
    </footer>
  );
}

export function SiteFooterLinks() {
  const { t } = useLocale();
  return (
    <nav
      className="flex flex-wrap gap-x-4 gap-y-2 text-sm"
      aria-label={t('site.nav.legal')}
    >
      {FOOTER_LINKS.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          reloadDocument={link.to.endsWith('.html')}
          className="text-sidebar-muted transition-colors hover:text-sidebar-foreground"
        >
          {t(link.labelKey)}
        </Link>
      ))}
    </nav>
  );
}
