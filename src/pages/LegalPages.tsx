import React from 'react';
import { Link } from 'react-router-dom';
import { PublicDocPage } from './PublicDocPage';
import { Button } from '../components/ui/button';
import { SiteShell } from '../components/SiteShell';
import { useLocale } from '../i18n/LocaleContext';

export function AboutPage() {
  return (
    <PublicDocPage
      titleKey="about.title"
      ledeKey="about.lede"
      sections={[
        { heading: 'about.what.heading', body: 'about.what.body' },
        { heading: 'about.who.heading', body: 'about.who.body' },
        { heading: 'about.company.heading', body: 'about.company.body' },
      ]}
    />
  );
}

export function ContactPage() {
  const { t } = useLocale();

  return (
    <SiteShell>
      <article className="animate-rise-in space-y-8">
        <header>
          <h1 className="page-title">{t('contact.title')}</h1>
          <p className="page-lede mt-2">{t('contact.lede')}</p>
        </header>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
          <dl className="space-y-4 text-sm sm:text-base">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('contact.business')}
              </dt>
              <dd className="mt-1 font-medium">{t('site.company.name')}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('contact.website')}
              </dt>
              <dd className="mt-1" dir="ltr">
                <a
                  className="font-medium text-primary hover:underline"
                  href="https://clerkdiary.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  https://clerkdiary.com
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('contact.email')}
              </dt>
              <dd className="mt-1" dir="ltr">
                <a
                  className="font-medium text-primary hover:underline"
                  href={`mailto:${t('site.company.email')}`}
                >
                  {t('site.company.email')}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('contact.hours')}
              </dt>
              <dd className="mt-1 text-muted-foreground">{t('contact.hoursValue')}</dd>
            </div>
          </dl>
        </div>

        <p className="text-sm text-muted-foreground">{t('contact.note')}</p>
        <Button asChild>
          <Link to="/register">{t('landing.nav.getStarted')}</Link>
        </Button>
      </article>
    </SiteShell>
  );
}

export function TermsPage() {
  return (
    <PublicDocPage
      titleKey="terms.title"
      ledeKey="terms.lede"
      sections={[
        { heading: 'terms.s1.heading', body: 'terms.s1.body' },
        { heading: 'terms.s2.heading', body: 'terms.s2.body' },
        { heading: 'terms.s3.heading', body: 'terms.s3.body' },
        { heading: 'terms.s4.heading', body: 'terms.s4.body' },
        { heading: 'terms.s5.heading', body: 'terms.s5.body' },
        { heading: 'terms.s6.heading', body: 'terms.s6.body' },
        { heading: 'terms.s7.heading', body: 'terms.s7.body' },
      ]}
    />
  );
}

export function PrivacyPage() {
  return (
    <PublicDocPage
      titleKey="privacy.title"
      ledeKey="privacy.lede"
      sections={[
        { heading: 'privacy.s1.heading', body: 'privacy.s1.body' },
        { heading: 'privacy.s2.heading', body: 'privacy.s2.body' },
        { heading: 'privacy.s3.heading', body: 'privacy.s3.body' },
        { heading: 'privacy.s4.heading', body: 'privacy.s4.body' },
        { heading: 'privacy.s5.heading', body: 'privacy.s5.body' },
        { heading: 'privacy.s6.heading', body: 'privacy.s6.body' },
      ]}
    />
  );
}

export function RefundPolicyPage() {
  return (
    <PublicDocPage
      titleKey="refund.title"
      ledeKey="refund.lede"
      sections={[
        { heading: 'refund.s1.heading', body: 'refund.s1.body' },
        { heading: 'refund.s2.heading', body: 'refund.s2.body' },
        { heading: 'refund.s3.heading', body: 'refund.s3.body' },
        { heading: 'refund.s4.heading', body: 'refund.s4.body' },
      ]}
    />
  );
}
