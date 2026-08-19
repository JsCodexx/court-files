import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
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
import { useLocale } from '../i18n/LocaleContext';
import { TranslationKey } from '../i18n/translations';
import { ApiError, apiFetch } from '../utils/api';

const TOKEN_RE = /^[a-f0-9]{64}$/i;

export function VerifyEmailPage() {
  const { t } = useLocale();
  const [params] = useSearchParams();
  const token = useMemo(() => (params.get('token') || '').trim(), [params]);
  const tokenOk = TOKEN_RE.test(token);

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    tokenOk ? 'loading' : 'error'
  );
  const [errorMsg, setErrorMsg] = useState(
    tokenOk ? '' : t('errors.resetInvalid')
  );

  useEffect(() => {
    if (!tokenOk) return;
    apiFetch<{ ok: true }>('/auth/verify-email', {
      method: 'POST',
      body: { token },
    })
      .then(() => setStatus('success'))
      .catch((err) => {
        setStatus('error');
        setErrorMsg(
          err instanceof ApiError
            ? t(err.errorKey as TranslationKey)
            : t('errors.network')
        );
      });
  }, [token, tokenOk, t]);

  return (
    <div className="page-shell">
      <Card className="w-full max-w-md animate-rise-in">
        <CardHeader>
          <div className="mb-2 flex items-center justify-between">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
          <CardTitle className="page-title">{t('verify.title')}</CardTitle>
          <CardDescription>{t('verify.lede')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'loading' && (
            <p className="text-sm text-muted-foreground">{t('verify.verifying')}</p>
          )}
          {status === 'success' && (
            <>
              <Alert variant="success">{t('verify.success')}</Alert>
              <Button asChild className="w-full">
                <Link to="/login">{t('forgot.backToLogin')}</Link>
              </Button>
            </>
          )}
          {status === 'error' && (
            <>
              <Alert variant="destructive">{errorMsg}</Alert>
              <Button asChild className="w-full">
                <Link to="/login">{t('forgot.backToLogin')}</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
