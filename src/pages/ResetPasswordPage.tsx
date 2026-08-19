import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
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
import { PasswordInput } from '../components/ui/password-input';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../i18n/LocaleContext';
import { TranslationKey } from '../i18n/translations';
import { useLoader } from '../context/LoaderContext';
import { ApiError, apiFetch } from '../utils/api';

const TOKEN_RE = /^[a-f0-9]{64}$/i;

export function ResetPasswordPage() {
  const { t } = useLocale();
  const { logout } = useAuth();
  const { withLoader } = useLoader();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = useMemo(() => (params.get('token') || '').trim(), [params]);
  const tokenOk = TOKEN_RE.test(token);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const errorText = (err: unknown) =>
    err instanceof ApiError
      ? t(err.errorKey as TranslationKey)
      : t('errors.network');

  const onReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!tokenOk) {
      setError(t('errors.resetInvalid'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t('register.passwordMismatch'));
      return;
    }
    setSubmitting(true);
    try {
      await withLoader(() =>
        apiFetch<{ ok: true }>('/auth/reset-password', {
          method: 'POST',
          body: { token, newPassword },
        })
      );
      logout();
      navigate('/login', { state: { resetDone: true } });
    } catch (err) {
      setError(errorText(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-shell">
      <Card className="w-full max-w-md animate-rise-in">
        <CardHeader>
          <div className="mb-2 flex items-center justify-between">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
          <CardTitle className="page-title">{t('forgot.resetTitle')}</CardTitle>
          <CardDescription>{t('forgot.resetLede')}</CardDescription>
        </CardHeader>
        <CardContent>
          {!tokenOk ? (
            <div className="space-y-4">
              <Alert variant="destructive">{t('forgot.missingToken')}</Alert>
              <Button asChild className="w-full">
                <Link to="/forgot-password">{t('forgot.submit')}</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={onReset} className="space-y-4">
              {error && <Alert variant="destructive">{error}</Alert>}
              <div>
                <Label>
                  {t('forgot.newPassword')}{' '}
                  <span className="text-destructive">*</span>
                </Label>
                <PasswordInput
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  dir="ltr"
                  autoComplete="new-password"
                  autoFocus
                />
              </div>
              <div>
                <Label>
                  {t('forgot.confirmPassword')}{' '}
                  <span className="text-destructive">*</span>
                </Label>
                <PasswordInput
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
