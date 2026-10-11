import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  CalendarDays,
  Check,
  FileSearch,
  History,
  Languages,
  Laptop,
  Scale,
  Share2,
  Shield,
  UserRound,
} from '../components/icons';
import {
  CalendarShowcase,
  ProductShowcase,
  TraditionContrast,
} from '../components/landing/ProductShowcase';
import { CompanyFooter } from '../components/CompanyFooter';
import { PublicHeader } from '../components/PublicHeader';
import { PwaInstallPrompt } from '../components/PwaInstallPrompt';
import { BrandWordmark } from '../components/BrandWordmark';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';
import { BRAND_ASSETS, brandAssetUrl } from '../constants/brandAssets';
import { COMPANY } from '../constants/company';
import { useLocale } from '../i18n/LocaleContext';
import { TranslationKey } from '../i18n/translations';
import { cn } from '../lib/utils';
import { apiFetch } from '../utils/api';
import { Plan } from './PlansPage';

const HERO_POINTS: TranslationKey[] = [
  'landing.hero.point1',
  'landing.hero.point2',
  'landing.hero.point3',
  'landing.hero.point4',
];

const FEATURES: {
  icon: typeof Scale;
  title: TranslationKey;
  body: TranslationKey;
}[] = [
  {
    icon: Scale,
    title: 'landing.feature.cases.title',
    body: 'landing.feature.cases.body',
  },
  {
    icon: CalendarDays,
    title: 'landing.feature.hearings.title',
    body: 'landing.feature.hearings.body',
  },
  {
    icon: FileSearch,
    title: 'landing.feature.search.title',
    body: 'landing.feature.search.body',
  },
  {
    icon: History,
    title: 'landing.feature.history.title',
    body: 'landing.feature.history.body',
  },
  {
    icon: Share2,
    title: 'landing.feature.share.title',
    body: 'landing.feature.share.body',
  },
  {
    icon: Languages,
    title: 'landing.feature.bilingual.title',
    body: 'landing.feature.bilingual.body',
  },
];

const PROS_STRIP: { icon: typeof Scale; label: TranslationKey }[] = [
  { icon: Scale, label: 'landing.pros.cases' },
  { icon: CalendarDays, label: 'landing.pros.calendar' },
  { icon: FileSearch, label: 'landing.pros.search' },
  { icon: History, label: 'landing.pros.history' },
  { icon: Shield, label: 'landing.pros.secure' },
];

const VALUES: { icon: typeof Shield; title: TranslationKey; body: TranslationKey }[] = [
  { icon: Shield, title: 'landing.values.trust.title', body: 'landing.values.trust.body' },
  { icon: History, title: 'landing.values.org.title', body: 'landing.values.org.body' },
  { icon: Laptop, title: 'landing.values.tech.title', body: 'landing.values.tech.body' },
  { icon: UserRound, title: 'landing.values.simple.title', body: 'landing.values.simple.body' },
];

const JOURNEY_STEPS: { heading: TranslationKey; body: TranslationKey }[] = [
  { heading: 'journey.s1.heading', body: 'journey.s1.body' },
  { heading: 'journey.s2.heading', body: 'journey.s2.body' },
  { heading: 'journey.s3.heading', body: 'journey.s3.body' },
  { heading: 'journey.s4.heading', body: 'journey.s4.body' },
  { heading: 'journey.s5.heading', body: 'journey.s5.body' },
];

const FALLBACK_PLANS: Plan[] = [
  {
    id: 'monthly',
    name: 'Monthly',
    description: 'Full access for 30 days',
    amountPkr: 150,
    currency: 'PKR',
    durationDays: 30,
    features: [
      'Unlimited cases (after 10 free)',
      'Calendar & search',
      'Email support',
    ],
  },
  {
    id: 'yearly',
    name: 'Yearly',
    description: 'Full access for 365 days — best value',
    amountPkr: 1400,
    currency: 'PKR',
    durationDays: 365,
    features: [
      'Unlimited cases (after 10 free)',
      'Calendar & search',
      'Priority support',
      'Save vs monthly',
    ],
  },
];

function formatPkr(amount: number) {
  return `Rs ${amount.toLocaleString('en-PK')}`;
}

function SectionHeading({
  title,
  lede,
  className,
  centered,
}: {
  title: string;
  lede?: string;
  className?: string;
  centered?: boolean;
}) {
  return (
    <div className={cn('max-w-2xl', centered && 'mx-auto text-center', className)}>
      <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        {title}
      </h2>
      {lede ? (
        <p className="mt-3 text-base leading-relaxed text-muted-foreground sm:text-lg">{lede}</p>
      ) : null}
    </div>
  );
}

function SplitSection({
  title,
  body,
  children,
  reverse,
  id,
}: {
  title: string;
  body: string;
  children: React.ReactNode;
  reverse?: boolean;
  id?: string;
}) {
  return (
    <section id={id} className="border-b border-border bg-background">
      <div
        className={cn(
          'mx-auto grid max-w-6xl items-center gap-10 px-3 py-14 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-16',
          reverse && 'lg:[&>div:first-child]:order-2'
        )}
      >
        <div className="min-w-0">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-[hsl(var(--brand-forest))] dark:text-[hsl(var(--brand-fresh))] sm:text-3xl">
            {title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">{body}</p>
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}

function ShareShowcase() {
  const { t } = useLocale();
  return (
    <div
      className="rounded-2xl border border-border bg-gradient-to-br from-card to-muted/50 p-6 shadow-lg"
      aria-hidden
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {t('landing.preview.badge')}
      </p>
      <ul className="mt-4 space-y-3">
        {['landing.preview.case1', 'landing.preview.case2'].map((key) => (
          <li
            key={key}
            className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-medium"
          >
            {t(key as TranslationKey)}
            <Share2 className="h-4 w-4 text-[hsl(var(--brand-fresh))]" weight="bold" />
          </li>
        ))}
      </ul>
      <div className="mt-5 flex flex-wrap gap-2">
        {['WhatsApp', 'Email', 'Copy'].map((label) => (
          <span
            key={label}
            className="rounded-full border border-[hsl(var(--brand-forest)/0.2)] bg-[hsl(var(--brand-forest)/0.06)] px-3 py-1 text-xs font-semibold text-[hsl(var(--brand-forest))] dark:text-[hsl(var(--brand-fresh))]"
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function LandingPage() {
  const { user, authReady } = useAuth();
  const { t, dir } = useLocale();
  const [plans, setPlans] = useState<Plan[]>(FALLBACK_PLANS);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await apiFetch<{ ok: true; plans: Plan[] }>('/payments/plans');
        if (alive && res.plans?.length) {
          setPlans(
            res.plans.map((p) => ({
              ...p,
              features: Array.isArray(p.features) ? p.features : [],
            }))
          );
        }
      } catch {
        /* keep fallback catalog */
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (!authReady) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">…</div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-[100dvh] bg-background pb-[env(safe-area-inset-bottom)]" dir={dir}>
      <PublicHeader className="animate-fade-in" />

      {/* Hero — showcase layout */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_70%_20%,hsl(var(--brand-fresh)/0.08),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_70%_20%,hsl(var(--brand-fresh)/0.06),transparent)]"
          aria-hidden
        />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-3 pb-16 pt-10 sm:px-6 sm:pb-24 sm:pt-14 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-12 lg:pt-16">
          <div className="animate-rise-in min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[hsl(var(--brand-fresh))]">
              {t('landing.hero.tagline')}
            </p>
            <p className="mt-4">
              <BrandWordmark size="lg" plate />
            </p>
            <p className="mt-2 text-xs font-medium text-muted-foreground">
              {t('brand.presents', { product: COMPANY.productName })}
            </p>
            <h1 className="mt-6 max-w-xl font-display text-2xl font-semibold leading-tight tracking-tight text-[hsl(var(--brand-forest))] dark:text-foreground sm:text-4xl lg:text-[2.35rem]">
              {t('landing.hero.headline')}
            </h1>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground">
              {t('landing.hero.lede')}
            </p>
            <ul className="mt-6 space-y-2.5">
              {HERO_POINTS.map((key) => (
                <li key={key} className="flex gap-2.5 text-sm text-foreground sm:text-base">
                  <Check
                    className="mt-0.5 h-5 w-5 shrink-0 text-[hsl(var(--brand-fresh))]"
                    weight="bold"
                  />
                  <span>{t(key)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
              <Button asChild size="lg" className="w-full sm:w-auto sm:min-w-[11rem]">
                <Link to="/register">{t('landing.hero.ctaFree')} →</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <Link to="/how-it-works">{t('landing.hero.ctaLearn')}</Link>
              </Button>
            </div>
          </div>

          <div
            className="relative animate-rise-in pb-8 ps-4 sm:pb-10 sm:ps-8 lg:pb-12"
            style={{ animationDelay: '100ms', animationFillMode: 'both' }}
          >
            <ProductShowcase />
          </div>
        </div>
      </section>

      {/* Brand board–style forest band */}
      <section className="bg-sidebar text-sidebar-foreground">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-3 py-8 sm:flex-row sm:items-center sm:px-6 sm:py-10">
          <BrandWordmark onDark size="md" />
          <p className="max-w-xl font-display text-lg font-semibold leading-snug text-sidebar-foreground sm:text-xl">
            {t('landing.banner.slogan')}
          </p>
        </div>
      </section>

      {/* Icon strip */}
      <section className="border-b border-border bg-muted/35">
        <div className="mx-auto max-w-6xl px-3 py-12 sm:px-6 sm:py-14">
          <SectionHeading
            title={t('landing.pros.title')}
            lede={t('landing.pros.lede')}
            centered
            className="max-w-3xl"
          />
          <ul className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
            {PROS_STRIP.map(({ icon: Icon, label }) => (
              <li key={label} className="flex flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-card shadow-sm">
                  <Icon
                    className="h-7 w-7 text-[hsl(var(--brand-forest))] dark:text-[hsl(var(--brand-fresh))]"
                    weight="duotone"
                  />
                </div>
                <p className="mt-3 text-sm font-semibold text-foreground">{t(label)}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Feature grid */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-3 py-14 sm:px-6 sm:py-20">
          <SectionHeading title={t('landing.features.title')} lede={t('landing.features.lede')} />
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <li
                key={title}
                className="min-w-0 rounded-xl border border-border bg-background p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[hsl(var(--brand-forest))] text-primary-foreground dark:bg-[hsl(var(--brand-fresh))] dark:text-primary-foreground">
                  <Icon className="h-5 w-5" weight="fill" />
                </div>
                <h3 className="font-display text-lg font-semibold tracking-tight text-foreground">
                  {t(title)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(body)}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <SplitSection title={t('landing.split.tradition.title')} body={t('landing.split.tradition.body')}>
        <TraditionContrast />
      </SplitSection>

      <SplitSection
        title={t('landing.split.calendar.title')}
        body={t('landing.split.calendar.body')}
        reverse
      >
        <CalendarShowcase />
      </SplitSection>

      <SplitSection title={t('landing.split.share.title')} body={t('landing.split.share.body')}>
        <ShareShowcase />
      </SplitSection>

      {/* Values */}
      <section className="border-y border-border bg-muted/30">
        <div className="mx-auto max-w-6xl px-3 py-14 sm:px-6 sm:py-20">
          <SectionHeading title={t('landing.values.title')} centered className="mx-auto" />
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map(({ icon: Icon, title, body }) => (
              <li
                key={title}
                className="rounded-xl border border-border bg-card p-5 text-center sm:text-start"
              >
                <Icon
                  className="mx-auto h-8 w-8 text-[hsl(var(--brand-forest))] dark:text-[hsl(var(--brand-fresh))] sm:mx-0"
                  weight="duotone"
                />
                <h3 className="mt-3 font-display text-base font-semibold text-foreground">
                  {t(title)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(body)}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How it works — compact */}
      <section id="how-it-works" className="border-b border-border bg-background">
        <div className="mx-auto max-w-6xl px-3 py-14 sm:px-6 sm:py-20">
          <SectionHeading title={t('landing.how.title')} lede={t('landing.how.lede')} />
          <ol className="mt-10 grid gap-4 lg:grid-cols-2">
            {JOURNEY_STEPS.map((step, index) => (
              <li
                key={step.heading}
                className="flex gap-4 rounded-xl border border-border bg-card p-5"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--brand-forest))] text-sm font-bold text-primary-foreground dark:bg-[hsl(var(--brand-fresh))]">
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-semibold text-foreground">{t(step.heading)}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {t(step.body)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-8">
            <Link
              to="/how-it-works"
              className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
            >
              {t('landing.how.more')} →
            </Link>
          </p>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-3 py-14 sm:px-6 sm:py-20">
          <SectionHeading title={t('pricing.title')} lede={t('pricing.lede')} />
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {plans.map((plan) => (
              <article
                key={plan.id}
                className={cn(
                  'flex flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-sm',
                  plan.id === 'yearly' && 'ring-2 ring-[hsl(var(--brand-fresh)/0.35)]'
                )}
              >
                <div className="bg-[hsl(var(--brand-forest))] px-6 py-4 dark:bg-sidebar">
                  <p className="text-sm font-semibold uppercase tracking-wide text-primary-foreground/90">
                    {plan.name}
                  </p>
                  <p className="mt-1 font-display text-3xl font-semibold text-primary-foreground">
                    {formatPkr(plan.amountPkr)}
                  </p>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                  <ul className="mt-4 flex-1 space-y-2 text-sm text-muted-foreground">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--brand-fresh))]" weight="bold" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button asChild className="mt-6 w-full">
                    <Link to={`/checkout?plan=${plan.id}`}>{t('pricing.cta')}</Link>
                  </Button>
                </div>
              </article>
            ))}
          </div>
          <p className="mt-6 text-sm text-muted-foreground">{t('pricing.paymentNote')}</p>
        </div>
      </section>

      {/* Closing + free tier */}
      <section className="bg-background">
        <div className="mx-auto grid max-w-6xl gap-10 px-3 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h2 className="font-display text-2xl font-semibold text-[hsl(var(--brand-forest))] dark:text-foreground sm:text-3xl">
              {t('landing.closing.title')}
            </h2>
            <p className="mt-4 max-w-lg text-muted-foreground">{t('landing.closing.body')}</p>
            <p className="mt-3 text-sm font-semibold text-foreground">{t('subscription.freeTier')}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/register">{t('landing.hero.ctaFree')}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/pricing">{t('site.nav.pricing')}</Link>
              </Button>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <img
              src={brandAssetUrl(BRAND_ASSETS.symbolSvg)}
              alt=""
              className="h-28 w-28 opacity-90 sm:h-36 sm:w-36"
              aria-hidden
            />
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-muted/25">
        <div className="mx-auto max-w-6xl px-3 py-12 sm:px-6">
          <SectionHeading title={t('landing.trust.title')} lede={t('landing.trust.body')} />
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild variant="outline" size="sm">
              <Link to="/terms">{t('site.nav.terms')}</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/privacy">{t('site.nav.privacy')}</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/refund-policy">{t('site.nav.refund')}</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/about">{t('site.nav.about')}</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-t border-sidebar-foreground/10 bg-sidebar text-sidebar-foreground">
        <div className="mx-auto flex max-w-6xl flex-col items-stretch gap-6 px-3 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-14">
          <div className="max-w-xl min-w-0">
            <BrandWordmark size="md" onDark className="mb-3" />
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              {t('landing.cta.title')}
            </h2>
            <p className="mt-3 text-sidebar-muted">{t('landing.cta.lede')}</p>
          </div>
          <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:min-w-[12rem]">
            <Button asChild size="lg" className="w-full">
              <Link to="/checkout">{t('landing.cta.button')}</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full border-sidebar-foreground/25 bg-transparent text-sidebar-foreground hover:bg-sidebar-foreground/10"
            >
              <Link to="/login">{t('landing.cta.signIn')}</Link>
            </Button>
          </div>
        </div>
      </section>

      <PwaInstallPrompt guest />
      <CompanyFooter />
    </div>
  );
}
