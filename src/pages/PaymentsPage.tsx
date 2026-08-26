import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Alert } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { useLocale } from '../i18n/LocaleContext';
import { TranslationKey } from '../i18n/translations';
import { ApiError, apiFetch } from '../utils/api';
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
  formFields: Record<string, string> | null;
  demoMode: boolean;
}

type LocState = { planId?: string; plan?: Plan } | null;

export function PaymentsPage() {
  const { t } = useLocale();
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

  const loadHistory = useCallback(async () => {
    const res = await apiFetch<{ ok: true; payments: Payment[] }>('/payments');
    setPayments(res.payments);
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        await loadHistory();
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
  }, [loadHistory, t]);

  // Return from gateway or demo redirect
  useEffect(() => {
    const paymentId = searchParams.get('paymentId');
    const status = searchParams.get('status');
    const demo = searchParams.get('demo');
    const err = searchParams.get('error');

    if (err) {
      setError(t('payments.callbackError'));
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
        if (status === 'paid' || res.payment.status === 'paid') {
          setInfo(t('payments.paidSuccess'));
        }
      } catch (e) {
        if (alive) {
          setError(
            e instanceof ApiError
              ? t(e.errorKey as TranslationKey)
              : t('errors.network')
          );
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [searchParams, t]);

  const startCheckout = async (planId: string) => {
    setBusy(true);
    setError('');
    setInfo('');
    try {
      const res = await apiFetch<InitiateResponse>('/payments/initiate', {
        method: 'POST',
        body: { planId, provider: 'easypaisa' },
      });
      setActive(res.payment);
      setDemoMode(res.demoMode);

      if (res.demoMode) {
        navigate(`/payments?paymentId=${res.payment.id}&demo=1`, { replace: true });
        setInfo(t('payments.demoReady'));
        await loadHistory();
        return;
      }

      // Live EasyPaisa: POST form to hosted checkout
      if (res.formFields && res.checkoutUrl) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = res.checkoutUrl;
        form.style.display = 'none';
        Object.entries(res.formFields).forEach(([key, value]) => {
          if (value == null || value === '') return;
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = String(value);
          form.appendChild(input);
        });
        document.body.appendChild(form);
        form.submit();
        return;
      }

      window.location.href = res.checkoutUrl;
    } catch (err) {
      setError(
        err instanceof ApiError
          ? t(err.errorKey as TranslationKey)
          : t('errors.network')
      );
    } finally {
      setBusy(false);
    }
  };

  // Coming from Plans page with a selected plan
  useEffect(() => {
    const planId = state?.planId;
    if (!planId) return;
    if (searchParams.get('paymentId')) return;
    startCheckout(planId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      setInfo(t('payments.paidSuccess'));
      await loadHistory();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? t(err.errorKey as TranslationKey)
          : t('errors.network')
      );
    } finally {
      setBusy(false);
    }
  };

  const plan = state?.plan;

  return (
    <div className="animate-rise-in mx-auto w-full max-w-2xl space-y-5">
      <div>
        <h1 className="page-title">{t('payments.title')}</h1>
        <p className="page-lede">{t('payments.lede')}</p>
      </div>

      {error && <Alert variant="destructive">{error}</Alert>}
      {info && <Alert variant="success">{info}</Alert>}

      {(active || plan) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('payments.checkoutTitle')}</CardTitle>
            <CardDescription>
              {plan
                ? t('payments.checkoutLede', {
                    plan: plan.name,
                    amount: String(plan.amountPkr),
                  })
                : active
                  ? t('payments.checkoutLede', {
                      plan: active.planId,
                      amount: String(active.amountPkr),
                    })
                  : ''}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {active && (
              <dl className="grid gap-2 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground">{t('payments.status')}</dt>
                  <dd className="font-medium capitalize" dir="ltr">
                    {active.status}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{t('payments.orderId')}</dt>
                  <dd className="font-mono text-xs" dir="ltr">
                    {active.merchantOrderId}
                  </dd>
                </div>
              </dl>
            )}

            {busy && !active && (
              <p className="text-sm text-muted-foreground">{t('payments.redirecting')}</p>
            )}

            {demoMode && active && active.status !== 'paid' && (
              <div className="space-y-2 rounded-md border border-dashed p-3">
                <p className="text-sm text-muted-foreground">{t('payments.demoHint')}</p>
                <Button type="button" onClick={confirmDemo} disabled={busy}>
                  {t('payments.demoConfirm')}
                </Button>
              </div>
            )}

            {!state?.planId && !active && (
              <Button type="button" onClick={() => navigate('/plans')}>
                {t('payments.choosePlan')}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('payments.historyTitle')}</CardTitle>
          <CardDescription>{t('payments.historyLede')}</CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('payments.empty')}</p>
          ) : (
            <ul className="divide-y">
              {payments.map((p) => (
                <li
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
                >
                  <div>
                    <p className="font-medium capitalize">{p.planId}</p>
                    <p className="text-xs text-muted-foreground" dir="ltr">
                      {new Date(p.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-end" dir="ltr">
                    <p className="font-medium">Rs {p.amountPkr}</p>
                    <p className="text-xs capitalize text-muted-foreground">
                      {p.status}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
