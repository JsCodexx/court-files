import React, { useEffect, useState } from 'react';
import { CreditCard, Smartphone } from '../components/icons';
import { useNavigate } from 'react-router-dom';
import { AppPage, AppPageHeader } from '../components/AppPage';
import { PlanOfferCard } from '../components/pricing/PlanOfferCard';
import { Alert } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { useLocale } from '../i18n/LocaleContext';
import { TranslationKey } from '../i18n/translations';
import { ApiError, apiFetch } from '../utils/api';

export interface Plan {
  id: string;
  name: string;
  description: string;
  amountPkr: number;
  currency: string;
  durationDays: number;
  features: string[];
}

type Step = 'plans' | 'method';

export function PlansPage() {
  const { t } = useLocale();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [step, setStep] = useState<Step>('plans');
  const [selected, setSelected] = useState<Plan | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await apiFetch<{ ok: true; plans: Plan[] }>('/payments/plans');
        if (alive) setPlans(res.plans);
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

  const onChoosePlan = (plan: Plan) => {
    setSelected(plan);
    setStep('method');
    setError('');
  };

  const onPayRapidGateway = () => {
    if (!selected) return;
    navigate('/payments', { state: { planId: selected.id, plan: selected } });
  };

  return (
    <AppPage>
      <AppPageHeader title={t('plans.title')} lede={t('plans.lede')} />

      {error && <Alert variant="destructive">{error}</Alert>}

      {loading && (
        <p className="text-sm text-muted-foreground">{t('plans.loading')}</p>
      )}

      {!loading && step === 'plans' && (
        <div className="grid gap-5 sm:grid-cols-2">
          {plans.map((plan) => (
            <PlanOfferCard
              key={plan.id}
              plan={plan}
              periodLabel={`${plan.durationDays}d`}
              footer={
                <Button className="w-full" onClick={() => onChoosePlan(plan)}>
                  {t('plans.purchase')}
                </Button>
              }
            />
          ))}
        </div>
      )}

      {!loading && step === 'method' && selected && (
        <div className="mx-auto max-w-lg space-y-4 lg:max-w-xl">
          <Button type="button" variant="ghost" size="sm" onClick={() => setStep('plans')}>
            ← {t('plans.back')}
          </Button>

          <section className="app-panel overflow-hidden">
            <div className="border-b border-border bg-[hsl(var(--brand-forest))] px-5 py-4 text-primary-foreground dark:bg-sidebar">
              <h2 className="font-display text-lg font-semibold">{t('plans.payTitle')}</h2>
              <p className="mt-1 text-sm text-primary-foreground/85">
                {t('plans.payLede', {
                  plan: selected.name,
                  amount: String(selected.amountPkr),
                })}
              </p>
            </div>
            <div className="p-5 sm:p-6">
              <button
                type="button"
                onClick={onPayRapidGateway}
                className="flex w-full items-center gap-4 rounded-xl border border-border bg-background p-4 text-start transition-colors hover:border-[hsl(var(--brand-fresh)/0.5)] hover:bg-[hsl(var(--brand-fresh)/0.06)]"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--brand-forest))] text-primary-foreground dark:bg-[hsl(var(--brand-fresh))]">
                  <Smartphone className="h-6 w-6" weight="fill" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-foreground">
                    {t('plans.rapidgateway')}
                  </span>
                  <span className="block text-sm text-muted-foreground">
                    {t('plans.rapidgatewayHint')}
                  </span>
                </span>
                <CreditCard className="h-5 w-5 shrink-0 text-muted-foreground" />
              </button>
            </div>
          </section>
        </div>
      )}

      {!loading && step === 'plans' && (
        <p className="text-xs text-muted-foreground">{t('pricing.paymentNote')}</p>
      )}
    </AppPage>
  );
}
