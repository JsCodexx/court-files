import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  CalendarDays,
  FileSearch,
  History,
  Languages,
  Scale,
  Share2,
} from 'lucide-react';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { SiteFooterLinks } from '../components/SiteShell';
import ThemeToggle from '../components/ThemeToggle';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../i18n/LocaleContext';
import { TranslationKey } from '../i18n/translations';
import { cn } from '../lib/utils';

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

function CauseListPreview({ className }: { className?: string }) {
  const { t } = useLocale();
  const rows: { title: TranslationKey; meta: TranslationKey }[] = [
    {
      title: 'landing.preview.case1',
      meta: 'landing.preview.case1Meta',
    },
    {
      title: 'landing.preview.case2',
      meta: 'landing.preview.case2Meta',
    },
    {
      title: 'landing.preview.case3',
      meta: 'landing.preview.case3Meta',
    },
  ];

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-sidebar-foreground/15 bg-sidebar text-sidebar-foreground shadow-2xl shadow-primary/20 animate-soft-float',
        className
      )}
      aria-hidden
    >
      <div className="flex items-center justify-between border-b border-sidebar-foreground/10 px-5 py-4">
        <div>
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-sidebar-accent">
            {t('landing.preview.badge')}
          </p>
          <p className="mt-1 font-display text-lg font-semibold tracking-tight">
            {t('landing.preview.court')}
          </p>
        </div>
        <Scale className="h-8 w-8 text-sidebar-accent opacity-90" />
      </div>
      <ul className="divide-y divide-sidebar-foreground/10">
        {rows.map((row) => (
          <li
            key={row.title}
            className="flex items-start justify-between gap-4 px-5 py-4"
          >
            <div>
              <p className="font-display text-base font-semibold leading-snug">
                {t(row.title)}
              </p>
              <p className="mt-1 text-sm text-sidebar-muted">{t(row.meta)}</p>
            </div>
            <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-sidebar-accent" />
          </li>
        ))}
      </ul>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-sidebar to-transparent" />
    </div>
  );
}

export function LandingPage() {
  const { user, authReady } = useAuth();
  const { t, dir } = useLocale();

  if (!authReady) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
        …
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-[100dvh] bg-background" dir={dir}>
      <header className="sticky top-0 z-40 border-b border-border bg-card shadow-sm animate-fade-in">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
          <Link to="/" className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Scale className="h-5 w-5" />
            </span>
            <span className="truncate font-display text-lg font-semibold tracking-tight text-foreground sm:text-xl">
              {t('brand.name')}
            </span>
          </Link>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link to="/login">{t('landing.nav.signIn')}</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/register">{t('landing.nav.getStarted')}</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/50" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14 lg:pt-16">
          <div className="animate-rise-in">
            <p className="font-display text-4xl font-semibold tracking-tight text-primary sm:text-5xl lg:text-6xl">
              {t('brand.name')}
            </p>
            <p className="mt-2 text-sm font-semibold uppercase tracking-[0.16em] text-primary/75">
              {t('brand.sub')}
            </p>
            <h1 className="mt-6 max-w-xl font-display text-2xl font-semibold leading-snug tracking-tight text-foreground sm:text-3xl lg:text-[2.15rem] lg:leading-tight">
              {t('landing.hero.headline')}
            </h1>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t('landing.hero.lede')}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="min-w-[10.5rem]">
                <Link to="/register">{t('landing.hero.ctaPrimary')}</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/login">{t('landing.hero.ctaSecondary')}</Link>
              </Button>
            </div>
          </div>

          <div
            className="relative animate-rise-in lg:min-h-[22rem]"
            style={{ animationDelay: '120ms', animationFillMode: 'both' }}
          >
            <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/20 via-secondary/60 to-transparent blur-2xl" />
            <CauseListPreview className="mx-auto w-full max-w-md lg:ms-auto lg:max-w-none" />
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {t('landing.features.title')}
            </h2>
            <p className="mt-3 text-base text-muted-foreground sm:text-lg">
              {t('landing.features.lede')}
            </p>
          </div>
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <li
                key={title}
                className="min-w-0 rounded-xl border border-border bg-secondary/60 p-5 shadow-sm"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <h3 className="font-display text-lg font-semibold tracking-tight text-foreground">
                  {t(title)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-[0.95rem]">
                  {t(body)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-14 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-16">
          <div className="max-w-xl">
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              {t('landing.cta.title')}
            </h2>
            <p className="mt-3 text-primary-foreground/85">{t('landing.cta.lede')}</p>
          </div>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="shrink-0 border-0 bg-card text-primary hover:bg-card/90"
          >
            <Link to="/register">{t('landing.cta.button')}</Link>
          </Button>
        </div>
      </section>

      <footer className="bg-sidebar text-sidebar-foreground">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-sidebar-accent" />
                <span className="font-display text-sm font-semibold">
                  {t('brand.name')}
                </span>
              </div>
              <p className="mt-2 text-sm text-sidebar-muted">
                {t('landing.footer.rights')}
              </p>
              <p className="mt-1 text-sm text-sidebar-muted" dir="ltr">
                {t('site.company.website')}
              </p>
            </div>
            <SiteFooterLinks />
          </div>
          <p className="border-t border-sidebar-foreground/10 pt-4 text-xs text-sidebar-muted">
            {t('site.footer.updated')}
          </p>
        </div>
      </footer>
    </div>
  );
}
