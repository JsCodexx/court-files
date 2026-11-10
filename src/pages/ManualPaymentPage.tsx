import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  MANUAL_PAYMENT_FORM_ID,
  ManualPaymentRequestsPanel,
} from '../components/ManualPaymentRequestsPanel';
import { ManualPaymentWhatsAppCard } from '../components/ManualPaymentWhatsAppCard';
import { Alert } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { useToast } from '../context/ToastContext';
import { useManualPaymentRequests } from '../hooks/useManualPaymentRequests';
import { useSubscription } from '../hooks/useSubscription';
import { useLocale } from '../i18n/LocaleContext';
import type { TranslationKey } from '../i18n/translations';
import type {
  ManualPaidToMethod,
  ManualPaymentSubmitBody,
  ManualPlanId,
} from '../types/manualPayment';
import { isManualPaidToMethod, isManualPlanId } from '../types/manualPayment';
import { apiFetch, translateApiError } from '../utils/api';
import { validateManualPaymentSubmit } from '../utils/manualPaymentValidation';
import type { Plan } from './PlansPage';

interface ManualAccount {
  title: string;
  accountName: string;
  accountNumber: string;
  bankName?: string;
}

function AccountBlock({
  label,
  account,
}: {
  label: string;
  account: ManualAccount;
}) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 p-4 text-sm">
      <p className="font-semibold text-foreground">{label}</p>
      <dl className="mt-2 space-y-1 text-muted-foreground">
        <div>
          <dt className="text-xs uppercase tracking-wide">{account.title}</dt>
        </div>
        <div>
          <dt className="text-xs">Account name</dt>
          <dd className="font-medium text-foreground">{account.accountName}</dd>
        </div>
        {'bankName' in account && account.bankName ? (
          <div>
            <dt className="text-xs">Bank</dt>
            <dd dir="ltr">{account.bankName}</dd>
          </div>
        ) : null}
        <div>
          <dt className="text-xs">Number / IBAN</dt>
          <dd className="break-all font-mono text-foreground" dir="ltr">
            {account.accountNumber}
          </dd>
        </div>
      </dl>
    </div>
  );
}

export function ManualPaymentPage() {
  const { t } = useLocale();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const { status: subscription, reload: reloadSubscription } = useSubscription();
  const {
    requests,
    loading: requestsLoading,
    error: requestsError,
    reload: reloadRequests,
    pending,
  } = useManualPaymentRequests();

  const [enabled, setEnabled] = useState(true);
  const [notice, setNotice] = useState('');
  const [bank, setBank] = useState<ManualAccount | null>(null);
  const [easypaisa, setEasypaisa] = useState<ManualAccount | null>(null);
  const [jazzcash, setJazzcash] = useState<ManualAccount | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const initialPlan = searchParams.get('plan') || 'monthly';
  const [planId, setPlanId] = useState<ManualPlanId>(
    isManualPlanId(initialPlan) ? initialPlan : 'monthly'
  );
  const [paidToMethod, setPaidToMethod] = useState<ManualPaidToMethod>('easypaisa');
  const [transactionId, setTransactionId] = useState('');
  const [senderAccountName, setSenderAccountName] = useState('');
  const [senderAccountTitle, setSenderAccountTitle] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [notes, setNotes] = useState('');

  const selectedPlan = useMemo(
    () => plans.find((p) => p.id === planId) ?? plans[0],
    [plans, planId]
  );

  const purchaseBlocked = Boolean(subscription?.hasActiveSubscription);
  const canSubmitNew = enabled && !purchaseBlocked && !pending;
  const pageLoading = loading || requestsLoading;

  const showToastError = useCallback(
    (message: string) => {
      setError(message);
      toast.error(message);
    },
    [toast]
  );

  useEffect(() => {
    if (requestsError) {
      showToastError(requestsError);
    }
  }, [requestsError, showToastError]);

  const loadInstructions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const instr = await apiFetch<{
        ok: true;
        enabled: boolean;
        notice: string;
        bank: ManualAccount;
        easypaisa: ManualAccount;
        jazzcash: ManualAccount;
        plans: Plan[];
        whatsappNumber?: string;
        whatsappUrl?: string;
      }>('/payments/manual-instructions');
      setEnabled(instr.enabled);
      setNotice(instr.notice);
      setBank(instr.bank);
      setEasypaisa(instr.easypaisa);
      setJazzcash(instr.jazzcash);
      setPlans(instr.plans);
      setWhatsappNumber(instr.whatsappNumber ?? '');
      setWhatsappUrl(instr.whatsappUrl ?? '');
    } catch (e) {
      showToastError(translateApiError(e, t));
    } finally {
      setLoading(false);
    }
  }, [t, showToastError]);

  useEffect(() => {
    void loadInstructions();
  }, [loadInstructions]);

  const buildSubmitBody = (): ManualPaymentSubmitBody => ({
    planId,
    paidToMethod,
    transactionId: transactionId.trim(),
    senderAccountName: senderAccountName.trim(),
    senderAccountTitle: senderAccountTitle.trim(),
    senderPhone: senderPhone.trim() || undefined,
    notes: notes.trim() || undefined,
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const body = buildSubmitBody();
    const clientErrorKey = validateManualPaymentSubmit(body);
    if (clientErrorKey) {
      showToastError(t(clientErrorKey));
      return;
    }

    if (!isManualPlanId(body.planId) || !isManualPaidToMethod(body.paidToMethod)) {
      showToastError(t('manualPayment.validationDetails'));
      return;
    }

    setBusy(true);
    try {
      await apiFetch<{ ok: true; request: unknown }>('/payments/manual-requests', {
        method: 'POST',
        body,
      });
      const msg = t('manualPayment.submitted');
      setSuccess(msg);
      toast.success(msg);
      setTransactionId('');
      setNotes('');
      await reloadRequests();
      await reloadSubscription();
    } catch (err) {
      const message = translateApiError(err, t);
      showToastError(message);
    } finally {
      setBusy(false);
    }
  };

  const formTitleKey: TranslationKey = pending
    ? 'manualPayment.formTitle'
    : requests.some((r) => r.status === 'rejected')
      ? 'manualPayment.resubmitTitle'
      : 'manualPayment.formTitle';

  return (
    <div className="space-y-4">
      {error && <Alert variant="destructive">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      {purchaseBlocked && <Alert>{t('payments.alreadyActive')}</Alert>}

      {!pageLoading && requests.length > 0 && (
        <div className="mb-6">
          <ManualPaymentRequestsPanel
            requests={requests}
            showResubmitAction={canSubmitNew}
          />
        </div>
      )}

      {!loading && !enabled && <Alert>{t('manualPayment.disabled')}</Alert>}

      {!loading && enabled && notice && (
        <p className="text-sm text-muted-foreground">{notice}</p>
      )}

      {!loading && enabled && bank && easypaisa && jazzcash && (
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <AccountBlock label={t('manualPayment.bank')} account={bank} />
          <AccountBlock label={t('manualPayment.easypaisa')} account={easypaisa} />
          <AccountBlock label={t('manualPayment.jazzcash')} account={jazzcash} />
        </div>
      )}

      {!loading && enabled && whatsappNumber && whatsappUrl && (
        <ManualPaymentWhatsAppCard
          whatsappNumber={whatsappNumber}
          whatsappUrl={whatsappUrl}
        />
      )}

      {pending && (
        <Alert className="mt-4">{t('manualPayment.pendingReview')}</Alert>
      )}

      {!pageLoading && canSubmitNew && (
        <Card id={MANUAL_PAYMENT_FORM_ID} className="app-panel mt-6 scroll-mt-24">
          <CardHeader>
            <CardTitle className="text-lg">{t(formTitleKey)}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4" noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>{t('manualPayment.plan')}</Label>
                  <Select
                    value={planId}
                    onValueChange={(v) => {
                      if (isManualPlanId(v)) setPlanId(v);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {plans.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} — Rs {p.amountPkr}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedPlan && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t('manualPayment.amountHint', {
                        amount: String(selectedPlan.amountPkr),
                      })}
                    </p>
                  )}
                </div>
                <div>
                  <Label>{t('manualPayment.paidTo')}</Label>
                  <Select
                    value={paidToMethod}
                    onValueChange={(v) => {
                      if (isManualPaidToMethod(v)) setPaidToMethod(v);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank">{t('manualPayment.bank')}</SelectItem>
                      <SelectItem value="easypaisa">
                        {t('manualPayment.easypaisa')}
                      </SelectItem>
                      <SelectItem value="jazzcash">
                        {t('manualPayment.jazzcash')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>{t('manualPayment.transactionId')}</Label>
                <Input
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  required
                  minLength={3}
                  maxLength={80}
                  dir="ltr"
                  placeholder={t('manualPayment.transactionIdPh')}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>{t('manualPayment.senderName')}</Label>
                  <Input
                    value={senderAccountName}
                    onChange={(e) => setSenderAccountName(e.target.value)}
                    required
                    minLength={2}
                    maxLength={120}
                  />
                </div>
                <div>
                  <Label>{t('manualPayment.senderTitle')}</Label>
                  <Input
                    value={senderAccountTitle}
                    onChange={(e) => setSenderAccountTitle(e.target.value)}
                    maxLength={120}
                    placeholder={t('manualPayment.senderTitlePh')}
                  />
                </div>
              </div>

              <div>
                <Label>{t('manualPayment.senderPhone')}</Label>
                <Input
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  dir="ltr"
                  placeholder="03XXXXXXXXX"
                  maxLength={20}
                />
              </div>

              <div>
                <Label>{t('manualPayment.notes')}</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  maxLength={500}
                />
              </div>

              <Button type="submit" disabled={busy}>
                {busy ? t('common.loading') : t('manualPayment.submit')}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
