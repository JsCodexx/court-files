import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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

export function LoginPage() {
  const { login } = useAuth();
  const { t } = useLocale();
  const navigate = useNavigate();
  const location = useLocation();
  const resetDone = Boolean(
    (location.state as { resetDone?: boolean } | null)?.resetDone
  );
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const result = await login(emailOrPhone.trim(), password);
    setSubmitting(false);
    if (!result.ok) {
      setError(t(result.error as TranslationKey));
      return;
    }
    navigate('/dashboard');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-md animate-rise-in">
        <CardHeader>
          <div className="mb-2 flex items-center justify-between">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
          <CardTitle className="text-3xl">{t('login.title')}</CardTitle>
          <CardDescription>{t('login.lede')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            {resetDone && !error && (
              <Alert variant="success">{t('forgot.success')}</Alert>
            )}
            {error && <Alert variant="destructive">{error}</Alert>}
            <div>
              <Label>{t('login.emailOrPhone')}</Label>
              <Input
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                required
                autoComplete="username"
                dir="ltr"
              />
            </div>
            <div>
              <div className="flex items-baseline justify-between">
                <Label>{t('login.password')}</Label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  {t('login.forgot')}
                </Link>
              </div>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                dir="ltr"
              />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {t('login.submit')}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {t('login.newAdvocate')}{' '}
            <Link
              to="/register"
              className="font-semibold text-primary hover:underline"
            >
              {t('login.createAccount')}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
