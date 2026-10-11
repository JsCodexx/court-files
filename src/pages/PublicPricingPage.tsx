import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BrandWordmark } from '../components/BrandWordmark';
import { SiteShell } from '../components/SiteShell';
import { Alert } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { PlanOfferCard } from '../components/pricing/PlanOfferCard';
import { useLocale } from '../i18n/LocaleContext';
import { TranslationKey } from '../i18n/translations';
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
        if (alive && res.plans?.length) {
          setPlans(
            res.plans.map((p) => ({
              ...p,
              features: Array.isArray(p.features) ? p.features : [],
            }))
          );
        }
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
    <SiteShell>
      <div className="min-w-0 space-y-8">
        <header>
          <BrandWordmark size="md" plate className="mb-3" />
          <h1 className="page-title">{t('pricing.title')}</h1>
          <p className="page-lede mt-2">{t('pricing.lede')}</p>
        </header>

        {error && !loading ? (
          <Alert variant="info">{t('pricing.fallbackNote')}</Alert>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          {plans.map((plan) => (
            <PlanOfferCard
              key={plan.id}
              plan={plan}
              periodLabel={`${plan.durationDays}d`}
              footer={
                <Button asChild className="w-full">
                  <Link to={`/checkout?plan=${plan.id}`}>{t('pricing.cta')}</Link>
                </Button>
              }
            />
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
