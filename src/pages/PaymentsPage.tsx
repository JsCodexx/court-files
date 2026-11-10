import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CreditCard, Receipt, Smartphone } from '../components/icons';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Alert } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { useToast } from '../context/ToastContext';
import { ManualPaymentRequestsPanel } from '../components/ManualPaymentRequestsPanel';
import { useManualPaymentRequests } from '../hooks/useManualPaymentRequests';
import { useSubscription } from '../hooks/useSubscription';
import { useLocale } from '../i18n/LocaleContext';
import { apiFetch, translateApiError } from '../utils/api';
import {
  InlinePanelSkeleton,
  PaymentsPageSkeleton,
} from '../components/skeletons';
import {
  DEFAULT_CHECKOUT,
  type CheckoutAvailability,
} from '../types/checkout';
import type { Plan } from './PlansPage';

interface Payment {
  id: string;
  planId: string;
  amountPkr: number;
  currency: string;
  provider: string;
  status: string;
  merchantOrderId: string;
  providerTxnId: string | null;
  createdAt: string;
}

interface InitiateResponse {
  ok: true;
  payment: Payment;
  checkoutUrl: string;
  demoMode: boolean;
}

type LocState = { planId?: string; plan?: Plan } | null;

function formatPkr(amount: number) {
  return `Rs ${amount.toLocaleString('en-PK')}`;
}

function planLabel(planId: string) {
  if (planId === 'monthly') return 'Monthly';
  if (planId === 'yearly') return 'Yearly';
  return planId.charAt(0).toUpperCase() + planId.slice(1);
}

function planDurationDays(planId: string, plan?: Plan | null) {
  if (plan?.durationDays) return plan.durationDays;
  return planId === 'yearly' ? 365 : 30;
}

function paidSuccessText(
  payment: Payment,
  plan: Plan | null | undefined,
  t: (key: 'payments.paidSuccess', vars: Record<string, string>) => string
) {
  return t('payments.paidSuccess', {
    plan: plan?.name ?? planLabel(payment.planId),
    amount: String(payment.amountPkr),
    days: String(planDurationDays(payment.planId, plan)),
  });
}

function PaymentStatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const variant =
    normalized === 'paid' || normalized === 'success'
      ? 'success'
      : normalized === 'pending' || normalized === 'initiated'
        ? 'secondary'
        : 'destructive';

  return (
    <Badge variant={variant} className="capitalize">
      {status}
    </Badge>
  );
}

export function PaymentsPage() {
  const { t } = useLocale();
  const toast = useToast();
  const {
    status: subscription,
    loading: subLoading,
    reload: reloadSubscription,
  } = useSubscription();
  const checkoutAutoStarted = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const state = location.state as LocState;

  const [payments, setPayments] = useState<Payment[]>([]);
  const [active, setActive] = useState<Payment | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);
  const [historyReady, setHistoryReady] = useState(false);
  const {
    requests: manualRequests,
    loading: manualLoading,
    error: manualError,
  } = useManualPaymentRequests();
  const [checkout, setCheckout] =
    useState<CheckoutAvailability>(DEFAULT_CHECKOUT);
  const [checkoutReady, setCheckoutReady] = useState(false);

  const manualOnly =
    !checkout.rapidGateway && checkout.manual !== false;

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await apiFetch<{
          ok: true;
          checkout?: CheckoutAvailability;
        }>('/payments/plans');
        if (alive && res.checkout) setCheckout(res.checkout);
      } catch {
        /* keep defaults — gateway off */
      } finally {
        if (alive) setCheckoutReady(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const loadHistory = useCallback(async () => {
    const res = await apiFetch<{ ok: true; payments: Payment[] }>('/payments');
    setPayments(res.payments);
  }, []);

  useEffect(() => {
    let alive = true;
    setHistoryReady(false);
    (async () => {
      try {
        await loadHistory();
      } catch (err) {
        if (alive) {
          const text = translateApiError(err, t);
          setError(text);
          toast.error(text);
        }
      } finally {
        if (alive) setHistoryReady(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, [loadHistory, t, toast]);

  useEffect(() => {
    const paymentId = searchParams.get('paymentId');
    const demo = searchParams.get('demo');
    const err = searchParams.get('error');

    if (err) {
      const text = t('payments.callbackError');
      setError(text);
      toast.error(text);
      return;
    }
    if (!paymentId) return;

    let alive = true;
    (async () => {
      try {
        const res = await apiFetch<{ ok: true; payment: Payment }>(
          `/payments/${paymentId}`
        );
        if (!alive) return;
        setActive(res.payment);
        setDemoMode(demo === '1' && res.payment.status !== 'paid');
        if (res.payment.status === 'paid') {
          const locPlan = (location.state as LocState)?.plan;
          setInfo(paidSuccessText(res.payment, locPlan, t));
          const sub = await reloadSubscription();
          if (sub?.canAccessApp) {
            navigate('/dashboard', { replace: true });
          }
        } else if (searchParams.get('failed') === '1') {
          const text = t('payments.callbackError');
          setError(text);
          toast.error(text);
        }
      } catch (e) {
        if (alive) {
          const text = translateApiError(e, t);
          setError(text);
          toast.error(text);
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [searchParams, t, reloadSubscription, navigate, toast, location.state]);

  const startCheckout = async (planId: string) => {
    setBusy(true);
    setError('');
    setInfo('');
    try {
      const res = await apiFetch<InitiateResponse>('/payments/initiate', {
        method: 'POST',
        body: { planId, provider: 'rapidgateway' },
      });
      setActive(res.payment);
      setDemoMode(res.demoMode);

      if (res.demoMode) {
        navigate(`/payments?paymentId=${res.payment.id}&demo=1`, { replace: true });
        setInfo(t('payments.demoReady'));
        await loadHistory();
        return;
      }

      window.location.href = res.checkoutUrl;
    } catch (err) {
      const text = translateApiError(err, t);
      setError(text);
      toast.error(text);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    const planId = state?.planId;
    if (!planId || searchParams.get('paymentId')) return;
    if (subLoading || !checkoutReady) return;
    if (checkoutAutoStarted.current) return;
    checkoutAutoStarted.current = true;
    if (subscription?.hasActiveSubscription) {
      setError(t('payments.alreadyActive'));
      return;
    }
    if (!checkout.rapidGateway) {
      if (checkout.manual) {
        navigate(`/payments/manual?plan=${planId}`, { replace: true });
      } else {
        setError(t('errors.gatewayCheckoutPaused'));
      }
      return;
    }
    startCheckout(planId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    subLoading,
    checkoutReady,
    checkout.rapidGateway,
    checkout.manual,
    subscription?.hasActiveSubscription,
    state?.planId,
    searchParams,
    navigate,
    t,
  ]);

  const confirmDemo = async () => {
    if (!active) return;
    setBusy(true);
    setError('');
    try {
      const res = await apiFetch<{ ok: true; payment: Payment }>(
        '/payments/demo-confirm',
        { method: 'POST', body: { paymentId: active.id } }
      );
      setActive(res.payment);
      setDemoMode(false);
      setInfo(paidSuccessText(res.payment, plan, t));
      await loadHistory();
      const sub = await reloadSubscription();
      if (sub?.canAccessApp) {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      const text = translateApiError(err, t);
      setError(text);
      toast.error(text);
    } finally {
      setBusy(false);
    }
  };

  const plan = state?.plan;
  const checkoutPlanId = active?.planId ?? plan?.id;
  const checkoutAmount = active?.amountPkr ?? plan?.amountPkr;
  const showCheckout =
    checkout.rapidGateway && Boolean(active || plan || busy);

  const subscriptionSummary = useMemo(() => {
    if (!subscription) return null;
    if (subscription.phase === 'grace') {
      return t('subscription.graceBanner', {
        days: subscription.graceDaysRemaining,
      });
    }
    if (
      subscription.hasActiveSubscription &&
      subscription.subscriptionExpiresAt
    ) {
      return t('subscription.activeUntil', {
        date: new Date(subscription.subscriptionExpiresAt).toLocaleDateString(),
      });
    }
    return t('subscription.casesUsed', {
      count: subscription.caseCount,
      limit: subscription.freeCaseLimit,
    });
  }, [subscription, t]);

  return (
    <div className="space-y-4">
      {manualOnly && (
        <Alert>
          {t('errors.gatewayCheckoutPaused')}{' '}
          <Link to="/payments/manual" className="font-medium underline">
            {t('plans.manualPay')}
          </Link>
        </Alert>
      )}

      {subscriptionSummary && (
        <div className="app-panel flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <p className="text-sm text-foreground">{subscriptionSummary}</p>
          {!subscription?.hasActiveSubscription ? (
            <Button asChild variant="outline" size="sm" className="shrink-0">
              <Link to="/plans">{t('payments.choosePlan')}</Link>
            </Button>
          ) : null}
        </div>
      )}

      {subscription?.hasActiveSubscription && !searchParams.get('paymentId') && (
        <Alert>{t('payments.alreadyActive')}</Alert>
      )}

      {error && <Alert variant="destructive">{error}</Alert>}
      {manualError && <Alert variant="destructive">{manualError}</Alert>}
      {info && <Alert variant="success">{info}</Alert>}

      {!manualLoading && manualRequests.length > 0 && (
        <ManualPaymentRequestsPanel requests={manualRequests} />
      )}

      {!historyReady ? (
        <PaymentsPageSkeleton />
      ) : (
      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <section className="app-panel overflow-hidden">
          <div className="brand-band flex items-start gap-3 px-5 py-4">
            <CreditCard
              className="mt-0.5 h-6 w-6 shrink-0 text-[hsl(var(--brand-fresh))]"
              weight="duotone"
            />
            <div className="min-w-0">
              <h2 className="font-display text-lg font-semibold text-[hsl(var(--brand-forest))] dark:text-foreground">
                {t('payments.checkoutTitle')}
              </h2>
              {checkoutPlanId && checkoutAmount != null ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  {planLabel(checkoutPlanId)} · {formatPkr(checkoutAmount)}
                </p>
              ) : (
                <p className="mt-1 text-sm text-muted-foreground">
                  {t('payments.historyLede')}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4 p-5 sm:p-6">
            {!showCheckout && (
              <div className="space-y-4 text-center sm:text-start">
                <p className="text-sm text-muted-foreground">
                  {manualOnly ? t('plans.ledeManualOnly') : t('plans.lede')}
                </p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button asChild variant={manualOnly ? 'default' : 'default'}>
                    <Link to={manualOnly ? '/payments/manual' : '/plans'}>
                      {manualOnly
                        ? t('plans.manualPay')
                        : t('payments.choosePlan')}
                    </Link>
                  </Button>
                  {!manualOnly && (
                    <Button asChild variant="outline">
                      <Link to="/payments/manual">{t('plans.manualPay')}</Link>
                    </Button>
                  )}
                  {manualOnly && (
                    <Button asChild variant="outline">
                      <Link to="/plans">{t('payments.choosePlan')}</Link>
                    </Button>
                  )}
                </div>
              </div>
            )}

            {busy && !active && (
              <InlinePanelSkeleton labelKey="payments.redirecting" />
            )}

            {active && (
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-lg border border-border bg-muted/20 p-3">
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {t('payments.status')}
                  </dt>
                  <dd className="mt-2">
                    <PaymentStatusBadge status={active.status} />
                  </dd>
                </div>
                <div className="rounded-lg border border-border bg-muted/20 p-3 sm:col-span-2">
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {t('payments.orderId')}
                  </dt>
                  <dd className="mt-1 break-all font-mono text-xs" dir="ltr">
                    {active.merchantOrderId}
                  </dd>
                </div>
              </dl>
            )}

            {plan && !active && (
              <p className="text-sm text-muted-foreground">
                {t('payments.checkoutLede', {
                  plan: plan.name,
                  amount: String(plan.amountPkr),
                })}
              </p>
            )}

            {demoMode && active && active.status !== 'paid' && (
              <div className="space-y-3 rounded-xl border border-dashed border-[hsl(var(--brand-fresh)/0.4)] bg-[hsl(var(--brand-fresh)/0.06)] p-4">
                <p className="text-sm text-muted-foreground">{t('payments.demoHint')}</p>
                <Button type="button" onClick={confirmDemo} disabled={busy}>
                  {t('payments.demoConfirm')}
                </Button>
              </div>
            )}

            {!state?.planId && !active && !busy && showCheckout && (
              <Button type="button" onClick={() => navigate('/plans')}>
                {t('payments.choosePlan')}
              </Button>
            )}
          </div>
        </section>

        <section className="app-panel overflow-hidden">
          <div className="flex items-center gap-3 border-b border-border px-5 py-4">
            <Receipt className="h-6 w-6 text-[hsl(var(--brand-forest))] dark:text-[hsl(var(--brand-fresh))]" weight="duotone" />
            <div>
              <h2 className="font-display text-lg font-semibold text-foreground">
                {t('payments.historyTitle')}
              </h2>
              <p className="text-sm text-muted-foreground">{t('payments.historyLede')}</p>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            {payments.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('payments.empty')}</p>
            ) : (
              <ul className="divide-y divide-border">
                {payments.map((p) => (
                  <li
                    key={p.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">{planLabel(p.planId)}</p>
                      <p className="text-xs text-muted-foreground" dir="ltr">
                        {new Date(p.createdAt).toLocaleString()}
                      </p>
                      <p className="mt-0.5 truncate font-mono text-[10px] text-muted-foreground" dir="ltr">
                        {p.merchantOrderId}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1" dir="ltr">
                      <p className="font-semibold tabular-nums">{formatPkr(p.amountPkr)}</p>
                      <PaymentStatusBadge status={p.status} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
      )}

      <p className="text-xs text-muted-foreground">{t('pricing.paymentNote')}</p>
    </div>
  );
}
