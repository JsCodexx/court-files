import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
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
import { ADVOCATE_FOR_OPTIONS, COURT_CATEGORIES } from '../constants';
import { useCases } from '../context/CasesContext';
import { useLocale } from '../i18n/LocaleContext';
import { TranslationKey } from '../i18n/translations';
import { AdvocateFor, CourtCategory } from '../types';
import { todayISO } from '../utils/dates';
import {
  formatCnic,
  isValidCaseId,
  isValidCnic,
  isValidPakPhone,
  maskCnic,
  maskPhone,
  normalizePhone,
} from '../utils/validation';

interface CaseFormState {
  caseId: string;
  category: CourtCategory;
  party1Name: string;
  party1IdCard: string;
  party1Phone: string;
  party2Name: string;
  party2IdCard: string;
  party2Phone: string;
  courtNumber: string;
  judgeName: string;
  advocateFor: AdvocateFor;
  opponentCounsel: string;
  nextDate: string;
  proceeding: string;
  remarks: string;
  clientName: string;
  clientAddress: string;
  clientPhone: string;
}

type FieldErrors = Partial<Record<keyof CaseFormState, string>>;

const empty: CaseFormState = {
  caseId: '',
  category: 'Civil Courts',
  party1Name: '',
  party1IdCard: '',
  party1Phone: '',
  party2Name: '',
  party2IdCard: '',
  party2Phone: '',
  courtNumber: '',
  judgeName: '',
  advocateFor: 'Party 1',
  opponentCounsel: '',
  nextDate: todayISO(),
  proceeding: '',
  remarks: '',
  clientName: '',
  clientAddress: '',
  clientPhone: '',
};

export function AddCasePage() {
  const { addCase } = useCases();
  const { t } = useLocale();
  const navigate = useNavigate();
  const [form, setForm] = useState<CaseFormState>(empty);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const setValue = (key: keyof CaseFormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    // Clear the field's error as the user corrects it
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const set =
    (key: keyof CaseFormState) =>
    (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) =>
      setValue(key, e.target.value);

  /** CNIC fields: digits only, dashes inserted automatically (31209-8736287-1) */
  const setCnic =
    (key: keyof CaseFormState) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setValue(key, maskCnic(e.target.value));

  /** Phone fields: digits only, capped at 11 */
  const setPhone =
    (key: keyof CaseFormState) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setValue(key, maskPhone(e.target.value));

  const validate = (f: CaseFormState): FieldErrors => {
    const errs: FieldErrors = {};
    const required = t('validation.required');

    if (!f.caseId.trim()) errs.caseId = required;
    else if (!isValidCaseId(f.caseId)) errs.caseId = t('validation.caseId');

    if (!f.judgeName.trim()) errs.judgeName = required;
    if (!f.proceeding.trim()) errs.proceeding = required;
    if (!f.party1Name.trim()) errs.party1Name = required;
    if (!f.party2Name.trim()) errs.party2Name = required;

    if (!f.nextDate) errs.nextDate = required;
    else if (f.nextDate < todayISO()) errs.nextDate = t('validation.datePast');

    // Optional fields validate only when filled
    if (f.party1IdCard.trim() && !isValidCnic(f.party1IdCard)) {
      errs.party1IdCard = t('validation.cnic');
    }
    if (f.party2IdCard.trim() && !isValidCnic(f.party2IdCard)) {
      errs.party2IdCard = t('validation.cnic');
    }
    if (f.party1Phone.trim() && !isValidPakPhone(f.party1Phone)) {
      errs.party1Phone = t('validation.phone');
    }
    if (f.party2Phone.trim() && !isValidPakPhone(f.party2Phone)) {
      errs.party2Phone = t('validation.phone');
    }
    if (f.clientPhone.trim() && !isValidPakPhone(f.clientPhone)) {
      errs.clientPhone = t('validation.phone');
    }

    return errs;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const errs = validate(form);
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) {
      setError(t('validation.fixErrors'));
      return;
    }

    setSubmitting(true);
    try {
      await addCase({
        caseId: form.caseId.trim(),
        category: form.category,
        party1: {
          name: form.party1Name.trim(),
          idCard: form.party1IdCard.trim() ? formatCnic(form.party1IdCard) : '',
          phone: form.party1Phone.trim()
            ? normalizePhone(form.party1Phone)
            : '',
        },
        party2: {
          name: form.party2Name.trim(),
          idCard: form.party2IdCard.trim() ? formatCnic(form.party2IdCard) : '',
          phone: form.party2Phone.trim()
            ? normalizePhone(form.party2Phone)
            : '',
        },
        courtNumber: form.courtNumber.trim() || undefined,
        judgeName: form.judgeName.trim(),
        advocateFor: form.advocateFor,
        opponentCounsel: form.opponentCounsel.trim(),
        nextDate: form.nextDate,
        proceeding: form.proceeding.trim(),
        remarks: form.remarks.trim(),
        client: {
          name: form.clientName.trim(),
          address: form.clientAddress.trim(),
          phone: form.clientPhone.trim()
            ? normalizePhone(form.clientPhone)
            : '',
        },
      });

      setSuccess(t('addCase.saved'));
      setForm({ ...empty, nextDate: todayISO() });
      setFieldErrors({});
      setTimeout(() => navigate('/dashboard'), 700);
    } catch {
      setError(t('errors.saveFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const fieldError = (key: keyof CaseFormState) =>
    fieldErrors[key] ? (
      <p className="mt-1 text-xs text-destructive">{fieldErrors[key]}</p>
    ) : null;

  const req = <span className="text-destructive">*</span>;

  const sectionTitle = (text: string) => (
    <h2 className="border-b pb-2 font-display text-xl font-semibold">{text}</h2>
  );

  return (
    <div className="animate-rise-in space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">
          {t('addCase.title')}
        </h1>
        <p className="text-sm text-muted-foreground">{t('addCase.lede')}</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={onSubmit} noValidate className="space-y-6">
            {error && <Alert variant="destructive">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            {sectionTitle(t('addCase.caseDetails'))}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>
                  {t('addCase.caseId')} {req}
                </Label>
                <Input
                  invalid={!!fieldErrors.caseId}
                  value={form.caseId}
                  onChange={set('caseId')}
                  maxLength={50}
                  dir="ltr"
                  aria-invalid={!!fieldErrors.caseId}
                />
                {fieldError('caseId')}
              </div>
              <div>
                <Label>
                  {t('addCase.category')} {req}
                </Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setValue('category', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COURT_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {t(`category.${c}` as TranslationKey)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t('addCase.courtNumber')}</Label>
                <Input
                  value={form.courtNumber}
                  onChange={set('courtNumber')}
                  maxLength={20}
                  dir="ltr"
                />
              </div>
              <div>
                <Label>
                  {t('addCase.judgeName')} {req}
                </Label>
                <Input
                  className="urdu-input"
                  invalid={!!fieldErrors.judgeName}
                  value={form.judgeName}
                  onChange={set('judgeName')}
                  maxLength={100}
                  dir="auto"
                  lang="ur"
                  aria-invalid={!!fieldErrors.judgeName}
                />
                {fieldError('judgeName')}
              </div>
              <div>
                <Label>
                  {t('addCase.advocateFor')} {req}
                </Label>
                <Select
                  value={form.advocateFor}
                  onValueChange={(v) => setValue('advocateFor', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ADVOCATE_FOR_OPTIONS.map((o) => (
                      <SelectItem key={o} value={o}>
                        {t(`advocateFor.${o}` as TranslationKey)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t('addCase.opponentCounsel')}</Label>
                <Input
                  className="urdu-input"
                  value={form.opponentCounsel}
                  onChange={set('opponentCounsel')}
                  maxLength={100}
                  dir="auto"
                  lang="ur"
                />
              </div>
              <div>
                <Label>
                  {t('addCase.nextDate')} {req}
                </Label>
                <Input
                  type="date"
                  invalid={!!fieldErrors.nextDate}
                  value={form.nextDate}
                  min={todayISO()}
                  onChange={set('nextDate')}
                  dir="ltr"
                  aria-invalid={!!fieldErrors.nextDate}
                />
                {fieldError('nextDate')}
              </div>
              <div>
                <Label>
                  {t('addCase.proceeding')} {req}
                </Label>
                <Input
                  className="urdu-input"
                  invalid={!!fieldErrors.proceeding}
                  value={form.proceeding}
                  onChange={set('proceeding')}
                  maxLength={200}
                  placeholder={t('addCase.proceedingPh')}
                  dir="auto"
                  lang="ur"
                  aria-invalid={!!fieldErrors.proceeding}
                />
                {fieldError('proceeding')}
              </div>
              <div className="md:col-span-2">
                <Label>{t('addCase.remarks')}</Label>
                <Textarea
                  className="urdu-input"
                  value={form.remarks}
                  onChange={set('remarks')}
                  maxLength={1000}
                  dir="auto"
                  lang="ur"
                />
              </div>
            </div>

            {sectionTitle(t('addCase.party1'))}
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label>
                  {t('addCase.name')} {req}
                </Label>
                <Input
                  className="urdu-input"
                  invalid={!!fieldErrors.party1Name}
                  value={form.party1Name}
                  onChange={set('party1Name')}
                  maxLength={100}
                  dir="auto"
                  lang="ur"
                  aria-invalid={!!fieldErrors.party1Name}
                />
                {fieldError('party1Name')}
              </div>
              <div>
                <Label>{t('addCase.idCard')}</Label>
                <Input
                  invalid={!!fieldErrors.party1IdCard}
                  value={form.party1IdCard}
                  onChange={setCnic('party1IdCard')}
                  inputMode="numeric"
                  maxLength={15}
                  placeholder="31209-8736287-1"
                  dir="ltr"
                  aria-invalid={!!fieldErrors.party1IdCard}
                />
                {fieldError('party1IdCard')}
              </div>
              <div>
                <Label>{t('addCase.phone')}</Label>
                <Input
                  invalid={!!fieldErrors.party1Phone}
                  value={form.party1Phone}
                  onChange={setPhone('party1Phone')}
                  inputMode="tel"
                  maxLength={11}
                  placeholder="03001234567"
                  dir="ltr"
                  aria-invalid={!!fieldErrors.party1Phone}
                />
                {fieldError('party1Phone')}
              </div>
            </div>

            {sectionTitle(t('addCase.party2'))}
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label>
                  {t('addCase.name')} {req}
                </Label>
                <Input
                  className="urdu-input"
                  invalid={!!fieldErrors.party2Name}
                  value={form.party2Name}
                  onChange={set('party2Name')}
                  maxLength={100}
                  dir="auto"
                  lang="ur"
                  aria-invalid={!!fieldErrors.party2Name}
                />
                {fieldError('party2Name')}
              </div>
              <div>
                <Label>{t('addCase.idCard')}</Label>
                <Input
                  invalid={!!fieldErrors.party2IdCard}
                  value={form.party2IdCard}
                  onChange={setCnic('party2IdCard')}
                  inputMode="numeric"
                  maxLength={15}
                  placeholder="31209-8736287-1"
                  dir="ltr"
                  aria-invalid={!!fieldErrors.party2IdCard}
                />
                {fieldError('party2IdCard')}
              </div>
              <div>
                <Label>{t('addCase.phone')}</Label>
                <Input
                  invalid={!!fieldErrors.party2Phone}
                  value={form.party2Phone}
                  onChange={setPhone('party2Phone')}
                  inputMode="tel"
                  maxLength={11}
                  placeholder="03001234567"
                  dir="ltr"
                  aria-invalid={!!fieldErrors.party2Phone}
                />
                {fieldError('party2Phone')}
              </div>
            </div>

            {sectionTitle(t('addCase.clientInfo'))}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>{t('addCase.name')}</Label>
                <Input
                  className="urdu-input"
                  value={form.clientName}
                  onChange={set('clientName')}
                  maxLength={100}
                  dir="auto"
                  lang="ur"
                />
              </div>
              <div>
                <Label>{t('addCase.phone')}</Label>
                <Input
                  invalid={!!fieldErrors.clientPhone}
                  value={form.clientPhone}
                  onChange={setPhone('clientPhone')}
                  inputMode="tel"
                  maxLength={11}
                  placeholder="03001234567"
                  dir="ltr"
                  aria-invalid={!!fieldErrors.clientPhone}
                />
                {fieldError('clientPhone')}
              </div>
              <div className="md:col-span-2">
                <Label>{t('addCase.address')}</Label>
                <Textarea
                  className="urdu-input"
                  value={form.clientAddress}
                  onChange={set('clientAddress')}
                  maxLength={500}
                  dir="auto"
                  lang="ur"
                />
              </div>
            </div>

            <div className="flex gap-2 border-t pt-4">
              <Button type="submit" disabled={submitting}>
                {t('addCase.save')}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/dashboard')}
              >
                {t('addCase.cancel')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
