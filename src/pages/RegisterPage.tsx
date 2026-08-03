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
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../i18n/LocaleContext';
import { TranslationKey } from '../i18n/translations';
import { isValidPakPhone, maskPhone } from '../utils/validation';

export function RegisterPage() {
  const { registerDraft } = useAuth();
  const { t } = useLocale();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    barAddress: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const set =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setPhoneError('');
    if (!isValidPakPhone(form.phone)) {
      setPhoneError(t('validation.phone'));
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError(t('register.passwordMismatch'));
      return;
    }
    setSubmitting(true);
    const result = await registerDraft({
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      barAddress: form.barAddress.trim(),
      password: form.password,
    });
    setSubmitting(false);
    if (!result.ok) {
      setError(t(result.error as TranslationKey));
      return;
    }
    navigate('/verify-otp', { state: { demoOtp: result.otp } });
  };

  return (
    <div className="page-shell">
      <Card className="w-full max-w-2xl animate-rise-in">
        <CardHeader>
          <div className="mb-2 flex items-center justify-between">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
          <CardTitle className="page-title">{t('register.title')}</CardTitle>
          <CardDescription>{t('register.lede')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            {error && <Alert variant="destructive">{error}</Alert>}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>
                  {t('register.name')}{' '}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  className="urdu-input"
                  value={form.name}
                  onChange={set('name')}
                  required
                  dir="auto"
                  lang="ur"
                />
              </div>
              <div>
                <Label>
                  {t('register.phone')}{' '}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={form.phone}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      phone: maskPhone(e.target.value),
                    }))
                  }
                  required
                  inputMode="tel"
                  dir="ltr"
                  placeholder="03001234567"
                  maxLength={11}
                  invalid={!!phoneError}
                />
                {phoneError && (
                  <p className="mt-1 text-xs text-destructive">{phoneError}</p>
                )}
              </div>
              <div>
                <Label>
                  {t('register.email')}{' '}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  required
                  dir="ltr"
                />
              </div>
              <div>
                <Label>
                  {t('register.barAddress')}{' '}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  className="urdu-input"
                  value={form.barAddress}
                  onChange={set('barAddress')}
                  required
                  dir="auto"
                  lang="ur"
                />
              </div>
              <div>
                <Label>
                  {t('register.password')}{' '}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={set('password')}
                  required
                  minLength={6}
                  dir="ltr"
                />
              </div>
              <div>
                <Label>
                  {t('register.confirmPassword')}{' '}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="password"
                  value={form.confirmPassword}
                  onChange={set('confirmPassword')}
                  required
                  minLength={6}
                  dir="ltr"
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {t('register.submit')}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {t('register.already')}{' '}
            <Link
              to="/login"
              className="font-semibold text-primary hover:underline"
            >
              {t('register.signIn')}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
