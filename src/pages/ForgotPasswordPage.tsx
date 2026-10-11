import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
import { AuthBrandHeader } from '../components/AuthBrandHeader';
import { useLocale } from '../i18n/LocaleContext';
import { TranslationKey } from '../i18n/translations';
import { useLoader } from '../context/LoaderContext';
import { ApiError, apiFetch } from '../utils/api';

export function ForgotPasswordPage() {
  const { t } = useLocale();
  const { withLoader } = useLoader();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const errorText = (err: unknown) =>
    err instanceof ApiError
      ? t(err.errorKey as TranslationKey)
      : t('errors.network');

  const onRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await withLoader(() =>
        apiFetch<{ ok: true }>('/auth/forgot-password', {
          method: 'POST',
          body: { email: email.trim().toLowerCase() },
        })
      );
      setSent(true);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-shell">
      <Card className="auth-card max-w-md animate-rise-in">
        <CardHeader>
          <div className="mb-2 flex items-center justify-between">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
          <AuthBrandHeader />
          <CardTitle className="sr-only">{t('forgot.title')}</CardTitle>
          <CardDescription className="text-center">{t('forgot.lede')}</CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="space-y-4">
              <Alert variant="success">{t('forgot.checkEmail')}</Alert>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSent(false);
                  setError('');
                }}
              >
                {t('forgot.sendAgain')}
              </Button>
            </div>
          ) : (
            <form onSubmit={onRequest} className="space-y-4">
              {error && <Alert variant="destructive">{error}</Alert>}
              <div>
                <Label>
                  {t('forgot.email')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  dir="ltr"
                  autoFocus
                  placeholder="name@example.com"
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {t('forgot.submit')}
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
