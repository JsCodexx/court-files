import React, { useEffect, useState } from 'react';
import { CreditCard, Smartphone, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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

  const onPayEasyPaisa = () => {
    if (!selected) return;
    navigate('/payments', { state: { planId: selected.id, plan: selected } });
  };

  return (
    <div className="animate-rise-in mx-auto w-full max-w-3xl space-y-5">
      <div>
        <h1 className="page-title">{t('plans.title')}</h1>
        <p className="page-lede">{t('plans.lede')}</p>
      </div>

      {error && <Alert variant="destructive">{error}</Alert>}

      {loading && (
        <p className="text-sm text-muted-foreground">{t('plans.loading')}</p>
      )}

      {!loading && step === 'plans' && (
        <div className="grid gap-4 sm:grid-cols-2">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={cn(
                'flex flex-col transition-shadow hover:shadow-md',
                plan.id === 'yearly' && 'border-primary/40'
              )}
            >
              <CardHeader>
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-3">
                <p className="font-display text-3xl font-semibold tracking-tight" dir="ltr">
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
                <Button className="w-full" onClick={() => onChoosePlan(plan)}>
                  {t('plans.purchase')}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {!loading && step === 'method' && selected && (
        <div className="space-y-4">
          <Button type="button" variant="ghost" size="sm" onClick={() => setStep('plans')}>
            {t('plans.back')}
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('plans.payTitle')}</CardTitle>
              <CardDescription>
                {t('plans.payLede', {
                  plan: selected.name,
                  amount: String(selected.amountPkr),
                })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <button
                type="button"
                onClick={onPayEasyPaisa}
                className="flex w-full items-center gap-4 rounded-lg border border-border bg-card p-4 text-start transition-colors hover:border-primary hover:bg-accent/40"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-md bg-emerald-600/15 text-emerald-700 dark:text-emerald-400">
                  <Smartphone className="h-6 w-6" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{t('plans.easypaisa')}</span>
                  <span className="block text-sm text-muted-foreground">
                    {t('plans.easypaisaHint')}
                  </span>
                </span>
                <CreditCard className="h-5 w-5 text-muted-foreground" />
              </button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
