import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import ThemeToggle from '../components/ThemeToggle';
import { Alert } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useLocale } from '../i18n/LocaleContext';
import { TranslationKey } from '../i18n/translations';
import { ApiError, apiFetch } from '../utils/api';
import { isValidPakPhone, maskPhone } from '../utils/validation';

type Step = 'phone' | 'reset';

export function ForgotPasswordPage() {
  const { t } = useLocale();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [info, setInfo] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const errorText = (err: unknown) =>
    err instanceof ApiError ? t(err.errorKey as TranslationKey) : t('errors.network');

  const onRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!isValidPakPhone(phone)) {
      setError(t('validation.phone'));
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiFetch<{ ok: true; otp: string }>(
        '/auth/forgot-password',
        { method: 'POST', body: { phone } }
      );
      setInfo(t('forgot.demoInfo', { otp: res.otp }));
      setStep('reset');
    } catch (err) {
      setError(errorText(err));
    } finally {
      setSubmitting(false);
    }
  };

  const onReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError(t('register.passwordMismatch'));
      return;
    }
    setSubmitting(true);
    try {
      await apiFetch<{ ok: true }>('/auth/reset-password', {
        method: 'POST',
        body: { phone, otp: otp.trim(), newPassword },
      });
      navigate('/login', { state: { resetDone: true } });
    } catch (err) {
      setError(errorText(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-md animate-rise-in">
        <CardHeader>
          <div className="mb-2 flex items-center justify-between">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
          <CardTitle className="text-3xl">{t('forgot.title')}</CardTitle>
          <CardDescription>{t('forgot.lede')}</CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'phone' ? (
            <form onSubmit={onRequest} className="space-y-4">
              {error && <Alert variant="destructive">{error}</Alert>}
              <div>
                <Label>
                  {t('forgot.phone')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(maskPhone(e.target.value))}
                  required
                  inputMode="tel"
                  dir="ltr"
                  placeholder="03001234567"
                  maxLength={11}
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {t('forgot.submit')}
              </Button>
            </form>
          ) : (
            <form onSubmit={onReset} className="space-y-4">
              {info && <Alert variant="info">{info}</Alert>}
              {error && <Alert variant="destructive">{error}</Alert>}
              <div>
                <Label>
                  {t('forgot.otp')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  inputMode="numeric"
                  maxLength={6}
                  required
                  dir="ltr"
                  className="text-center text-lg tracking-[0.5em]"
                  autoFocus
                />
              </div>
              <div>
                <Label>
                  {t('forgot.newPassword')}{' '}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  dir="ltr"
                  autoComplete="new-password"
                />
              </div>
              <div>
                <Label>
                  {t('forgot.confirmPassword')}{' '}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  dir="ltr"
                  autoComplete="new-password"
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {t('forgot.reset')}
              </Button>
            </form>
          )}
          <p className="mt-4 text-center text-sm text-muted-foreground">
            <Link
              to="/login"
              className="font-semibold text-primary hover:underline"
            >
              {t('forgot.backToLogin')}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
