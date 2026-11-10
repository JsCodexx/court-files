import React, { useEffect, useMemo, useState } from 'react';
import { CreditCard, Smartphone } from '../components/icons';
import { Link, useNavigate } from 'react-router-dom';
import { PlanOfferCard } from '../components/pricing/PlanOfferCard';
import { PlansStatusActions } from '../components/pricing/PlansStatusActions';
import { Alert } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { useLocale } from '../i18n/LocaleContext';
import { TranslationKey } from '../i18n/translations';
import { DEFAULT_PLANS, type Plan } from '../constants/plansCatalog';
import { useManualPaymentRequests } from '../hooks/useManualPaymentRequests';
import { useSubscription } from '../hooks/useSubscription';
import {
  DEFAULT_CHECKOUT,
  type CheckoutAvailability,
} from '../types/checkout';
import { ApiError, apiFetch } from '../utils/api';

export type { Plan };

type Step = 'plans' | 'method';

export function PlansPage() {
  const { t } = useLocale();
  const navigate = useNavigate();
  const { status: subscription } = useSubscription();
  const { pending: manualPending, requests: manualRequests } =
    useManualPaymentRequests();

  const hasActiveSubscription = Boolean(subscription?.hasActiveSubscription);
  const canPurchase = !hasActiveSubscription && !manualPending;

  const [plans, setPlans] = useState<Plan[]>(DEFAULT_PLANS);
  const [checkout, setCheckout] =
    useState<CheckoutAvailability>(DEFAULT_CHECKOUT);
  const [step, setStep] = useState<Step>('plans');
  const [selected, setSelected] = useState<Plan | null>(null);
  const [error, setError] = useState('');

  const manualOnly =
    !checkout.rapidGateway && checkout.manual !== false;

  const activeUntilLabel = useMemo(() => {
    if (!subscription?.subscriptionExpiresAt) return null;
    return new Date(subscription.subscriptionExpiresAt).toLocaleDateString();
  }, [subscription?.subscriptionExpiresAt]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await apiFetch<{
          ok: true;
          plans: Plan[];
          checkout?: CheckoutAvailability;
        }>('/payments/plans');
        if (!alive) return;
        if (res.plans?.length) setPlans(res.plans);
        if (res.checkout) setCheckout(res.checkout);
      } catch (err) {
        if (alive) {
          setError(
            err instanceof ApiError
              ? t(err.errorKey as TranslationKey)
              : t('errors.network')
          );
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [t]);

  const onChoosePlan = (plan: Plan) => {
    if (manualPending) {
      setError(t('manualPayment.pendingReview'));
      return;
    }
    if (hasActiveSubscription) {
      setError(t('payments.alreadyActive'));
      return;
    }
    setError('');
    if (manualOnly) {
      navigate(`/payments/manual?plan=${plan.id}`);
      return;
    }
    if (checkout.rapidGateway) {
      setSelected(plan);
      setStep('method');
      return;
    }
    if (checkout.manual) {
      navigate(`/payments/manual?plan=${plan.id}`);
    }
  };

  const onPayRapidGateway = () => {
    if (!selected || !canPurchase || !checkout.rapidGateway) return;
    navigate('/payments', { state: { planId: selected.id, plan: selected } });
  };

  return (
    <div className="space-y-4">
      {error && <Alert variant="destructive">{error}</Alert>}

      <PlansStatusActions
        activeUntil={hasActiveSubscription ? activeUntilLabel : null}
        manualPending={manualPending}
        hasManualRequests={manualRequests.length > 0}
      />

      {step === 'plans' && (
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {plans.map((plan) => (
            <PlanOfferCard
              key={plan.id}
              plan={plan}
              periodLabel={`${plan.durationDays}d`}
              footer={
                <Button
                  className="w-full"
                  onClick={() => onChoosePlan(plan)}
                  disabled={!canPurchase}
                >
                  {manualOnly ? t('plans.purchaseManual') : t('plans.purchase')}
                </Button>
              }
            />
          ))}
        </div>
      )}

      {step === 'method' && selected && checkout.rapidGateway && (
        <div className="mx-auto max-w-lg space-y-4 lg:max-w-xl">
          <Button type="button" variant="ghost" size="sm" onClick={() => setStep('plans')}>
            ← {t('plans.back')}
          </Button>

          <section className="app-panel overflow-hidden">
            <div className="brand-band px-5 py-4">
              <h2 className="font-display text-lg font-semibold text-[hsl(var(--brand-forest))] dark:text-foreground">
                {t('plans.payTitle')}
              </h2>
            </div>
            <div className="flex flex-col gap-3 p-5 sm:p-6">
              <Button
                type="button"
                onClick={onPayRapidGateway}
                disabled={!canPurchase}
                className="h-auto w-full justify-start gap-4 py-4"
              >
                <span className="icon-tile-brand flex h-12 w-12 shrink-0 items-center justify-center">
                  <Smartphone className="h-6 w-6" weight="duotone" />
                </span>
                <span className="min-w-0 flex-1 text-start font-semibold">
                  {t('plans.rapidgateway')}
                </span>
                <CreditCard className="h-5 w-5 shrink-0 opacity-80" />
              </Button>

              {checkout.manual && canPurchase && (
                <Button asChild variant="outline" className="w-full">
                  <Link to={`/payments/manual?plan=${selected.id}`}>
                    {t('plans.manualPayShort')}
                  </Link>
                </Button>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
