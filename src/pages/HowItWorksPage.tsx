import React from 'react';
import { Link } from 'react-router-dom';
import { SiteShell } from '../components/SiteShell';
import { Button } from '../components/ui/button';
import { COMPANY } from '../constants/company';
import { useLocale } from '../i18n/LocaleContext';

export function HowItWorksPage() {
  const { t } = useLocale();

  const steps = [
    { h: 'journey.s1.heading' as const, b: 'journey.s1.body' as const },
    { h: 'journey.s2.heading' as const, b: 'journey.s2.body' as const },
    { h: 'journey.s3.heading' as const, b: 'journey.s3.body' as const },
    { h: 'journey.s4.heading' as const, b: 'journey.s4.body' as const },
    { h: 'journey.s5.heading' as const, b: 'journey.s5.body' as const },
  ];

  return (
    <SiteShell>
      <article className="animate-rise-in space-y-10">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            {COMPANY.legalName}
          </p>
          <h1 className="page-title mt-2">{t('journey.title')}</h1>
          <p className="page-lede mt-2">{t('journey.lede')}</p>
        </header>

        <section className="space-y-3 rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
          <h2 className="font-display text-xl font-semibold">
            {t('journey.model.heading')}
          </h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground sm:text-base">
            {t('journey.model.body')}
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-xl font-semibold">
            {t('journey.stepsTitle')}
          </h2>
          <ol className="space-y-4">
            {steps.map((step, i) => (
              <li
                key={step.h}
                className="rounded-xl border border-border bg-card p-5 shadow-sm"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  {t('journey.step', { n: String(i + 1) })}
                </p>
                <h3 className="mt-1 font-display text-lg font-semibold">
                  {t(step.h)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {t(step.b)}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section className="space-y-3 rounded-xl border border-primary/30 bg-primary/5 p-5 sm:p-6">
          <h2 className="font-display text-xl font-semibold">
            {t('journey.gateway.heading')}
          </h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground sm:text-base">
            {t('journey.gateway.body', { gateway: COMPANY.paymentGateway })}
          </p>
          <Button asChild className="mt-2">
            <Link to="/checkout">{t('landing.nav.buyNow')}</Link>
          </Button>
        </section>
      </article>
    </SiteShell>
  );
}
