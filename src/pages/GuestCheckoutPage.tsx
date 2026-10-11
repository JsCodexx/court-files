import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Check, Wallet } from '../components/icons';
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
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { BrandWordmark } from '../components/BrandWordmark';
import { COMPANY } from '../constants/company';
import { useToast } from '../context/ToastContext';
import { useLocale } from '../i18n/LocaleContext';
import { cn } from '../lib/utils';
import { apiFetch, translateApiError } from '../utils/api';
import { isValidPakPhone } from '../utils/validation';
import type { Plan } from './PlansPage';

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

interface Payment {
  id: string;
  planId: string;
  amountPkr: number;
  status: string;
  merchantOrderId: string;
  provider: string;
}

export function GuestCheckoutPage() {
  const { t } = useLocale();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [plans, setPlans] = useState<Plan[]>(FALLBACK_PLANS);
  const [planId, setPlanId] = useState(
    () => searchParams.get('plan') || 'monthly'
  );
  const [name, setName] = useState('');
  const [email, setEmail] = useState(
    () => searchParams.get('email') || ''
  );
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);
  const [active, setActive] = useState<Payment | null>(null);
  const [demoMode, setDemoMode] = useState(false);

  const selected = useMemo(
    () => plans.find((p) => p.id === planId) || plans[0],
    [plans, planId]
  );

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await apiFetch<{ ok: true; plans: Plan[] }>('/payments/plans');
        if (alive && res.plans?.length) setPlans(res.plans);
      } catch {
        /* fallback plans */
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Resume after demo redirect
  useEffect(() => {
    const paymentId = searchParams.get('paymentId');
    const demo = searchParams.get('demo');
    const em = searchParams.get('email');
    if (!paymentId || !em) return;

    let alive = true;
    (async () => {
      try {
        const res = await apiFetch<{ ok: true; payment: Payment }>(
          `/payments/guest/${paymentId}?email=${encodeURIComponent(em)}`
        );
        if (!alive) return;
        setActive(res.payment);
        setEmail(em);
        setDemoMode(demo === '1' && res.payment.status !== 'paid');
        if (res.payment.status === 'paid') {
          setInfo(t('checkout.paidSuccess'));
        } else if (searchParams.get('failed') === '1') {
          const text = t('checkout.paymentFailed');
          setError(text);
          toast.error(text);
        }
      } catch (err) {
        if (alive) {
          const text = translateApiError(err, t);
          setError(text);
          toast.error(text);
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [searchParams, t, toast]);

  const onPay = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    if (!isValidPakPhone(phone.trim()) && !/^\+923\d{9}$/.test(phone.trim())) {
      const text = t('validation.phone');
      setError(text);
      toast.error(text);
      return;
    }
    setBusy(true);
    try {
      const res = await apiFetch<{
        ok: true;
        payment: Payment;
        checkoutUrl: string;
        demoMode: boolean;
      }>('/payments/guest-checkout', {
        method: 'POST',
        body: {
          planId: selected.id,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
        },
      });

      setActive(res.payment);
      setDemoMode(res.demoMode);

      if (res.demoMode) {
        setSearchParams({
          paymentId: res.payment.id,
          demo: '1',
          email: email.trim(),
        });
        setInfo(t('checkout.demoReady'));
        return;
      }

      // Live RapidGateway: redirect to hosted checkout
      window.location.href = res.checkoutUrl;
    } catch (err) {
      const text = translateApiError(err, t);
      setError(text);
      toast.error(text);
    } finally {
      setBusy(false);
    }
  };

  const onDemoConfirm = async () => {
    if (!active) return;
    setBusy(true);
    setError('');
    try {
      const res = await apiFetch<{ ok: true; payment: Payment }>(
        '/payments/guest-demo-confirm',
        {
          method: 'POST',
          body: { paymentId: active.id, email: email.trim() },
        }
      );
      setActive(res.payment);
      setDemoMode(false);
      setInfo(t('checkout.paidSuccess'));
    } catch (err) {
      const text = translateApiError(err, t);
      setError(text);
      toast.error(text);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SiteShell wide>
      <div className="min-w-0 space-y-6 sm:space-y-8">
        <header className="max-w-2xl">
          <BrandWordmark size="md" plate className="mb-2" />
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {t('brand.presents', { product: COMPANY.productName })}
          </p>
          <h1 className="page-title mt-2">{t('checkout.title')}</h1>
          <p className="page-lede mt-2">{t('checkout.lede')}</p>
        </header>

        {error && <Alert variant="destructive">{error}</Alert>}
        {info && <Alert variant="success">{info}</Alert>}

        <div className="grid min-w-0 gap-6 lg:grid-cols-[1fr_1.1fr]">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('checkout.choosePlan')}</CardTitle>
              <CardDescription>{t('checkout.choosePlanLede')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {plans.map((plan) => {
                const activePlan = selected?.id === plan.id;
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setPlanId(plan.id)}
                    className={cn(
                      'w-full rounded-lg border p-4 text-start transition-colors',
                      activePlan
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/40'
                    )}
                  >
                    <div className="flex flex-col gap-2 min-[400px]:flex-row min-[400px]:items-center min-[400px]:justify-between min-[400px]:gap-3">
                      <div className="min-w-0">
                        <p className="font-display font-semibold">{plan.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {plan.description}
                        </p>
                      </div>
                      <p
                        className="shrink-0 font-display text-xl font-semibold min-[400px]:text-end"
                        dir="ltr"
                      >
                        Rs {plan.amountPkr.toLocaleString()}
                      </p>
                    </div>
                    <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2">
                          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('checkout.detailsTitle')}</CardTitle>
              <CardDescription>{t('checkout.detailsLede')}</CardDescription>
            </CardHeader>
            <CardContent>
              {active?.status === 'paid' ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {t('checkout.afterPay')}
                  </p>
                  <Button asChild className="w-full">
                    <Link to="/login">{t('checkout.createAccount')}</Link>
                  </Button>
                </div>
              ) : demoMode && active ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {t('checkout.demoHint', { gateway: COMPANY.paymentGateway })}
                  </p>
                  <dl className="grid gap-2 text-sm">
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">{t('payments.orderId')}</dt>
                      <dd className="font-mono text-xs" dir="ltr">
                        {active.merchantOrderId}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">{t('checkout.amount')}</dt>
                      <dd dir="ltr">Rs {active.amountPkr.toLocaleString()}</dd>
                    </div>
                  </dl>
                  <Button
                    className="w-full"
                    disabled={busy}
                    onClick={onDemoConfirm}
                  >
                    {t('checkout.demoConfirm', { gateway: COMPANY.paymentGateway })}
                  </Button>
                </div>
              ) : (
                <form onSubmit={onPay} className="space-y-4">
                  <div>
                    <Label>{t('register.name')}</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label>{t('register.email')}</Label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <Label>{t('register.phone')}</Label>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="03XXXXXXXXX"
                      required
                      dir="ltr"
                    />
                  </div>

                  <div className="rounded-lg border border-border bg-secondary/50 p-4">
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/15 text-primary">
                        <Wallet className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="font-semibold">
                          {t('checkout.payWith', {
                            gateway: COMPANY.paymentGateway,
                          })}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {t('checkout.gatewayHint')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={busy || !selected}>
                    {busy
                      ? t('common.loading')
                      : t('checkout.payCta', {
                          amount: String(selected?.amountPkr ?? ''),
                          gateway: COMPANY.paymentGateway,
                        })}
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    {t('checkout.noAccountRequired')}
                  </p>
                </form>
              )}
            </CardContent>
            <CardFooter className="flex-col items-stretch gap-2 border-t pt-4 text-xs text-muted-foreground">
              <p>{t('checkout.gatewayUseCase')}</p>
              <Link to="/how-it-works" className="font-semibold text-primary hover:underline">
                {t('site.nav.howItWorks')}
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </SiteShell>
  );
}
