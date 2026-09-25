import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SiteShell } from '../components/SiteShell';
import { Alert } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { useLocale } from '../i18n/LocaleContext';
import { TranslationKey } from '../i18n/translations';
import { cn } from '../lib/utils';
import { ApiError, apiFetch } from '../utils/api';
import { Plan } from './PlansPage';

/** Fallback if API is unreachable — keep in sync with server plansCatalog. */
const FALLBACK_PLANS: Plan[] = [
  {
    id: 'monthly',
    name: 'Monthly',
    description: 'Full access for 30 days',
    amountPkr: 150,
    currency: 'PKR',
    durationDays: 30,
    features: ['Unlimited cases', 'Calendar & search', 'Email support'],
  },
  {
    id: 'yearly',
    name: 'Yearly',
    description: 'Full access for 365 days — best value',
    amountPkr: 1400,
    currency: 'PKR',
    durationDays: 365,
    features: [
      'Unlimited cases',
      'Calendar & search',
      'Priority support',
      'Save vs monthly',
    ],
  },
];

export function PublicPricingPage() {
  const { t } = useLocale();
  const [plans, setPlans] = useState<Plan[]>(FALLBACK_PLANS);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await apiFetch<{ ok: true; plans: Plan[] }>('/payments/plans');
        if (alive && res.plans?.length) setPlans(res.plans);
      } catch (err) {
        if (alive) {
          setError(
            err instanceof ApiError
              ? t(err.errorKey as TranslationKey)
              : t('errors.network')
          );
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [t]);

  return (
    <SiteShell wide>
      <div className="animate-rise-in space-y-8">
        <header className="max-w-2xl">
          <h1 className="page-title">{t('pricing.title')}</h1>
          <p className="page-lede mt-2">{t('pricing.lede')}</p>
        </header>

        {error && !loading ? (
          <Alert variant="info">{t('pricing.fallbackNote')}</Alert>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={cn(
                'flex flex-col',
                plan.id === 'yearly' && 'border-primary/40'
              )}
            >
              <CardHeader>
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-3">
                <p
                  className="font-display text-3xl font-semibold tracking-tight"
                  dir="ltr"
                >
                  Rs {plan.amountPkr.toLocaleString()}
                  <span className="ms-1 text-sm font-normal text-muted-foreground">
                    / {plan.durationDays}d
                  </span>
                </p>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link to="/register">{t('pricing.cta')}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="space-y-3 rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground shadow-sm sm:p-6">
          <p>{t('pricing.paymentNote')}</p>
          <p>
            {t('pricing.refundLink')}{' '}
            <Link to="/refund-policy" className="font-semibold text-primary hover:underline">
              {t('site.nav.refund')}
            </Link>
            .
          </p>
        </div>
      </div>
    </SiteShell>
  );
}
