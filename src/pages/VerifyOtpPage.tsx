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

export function VerifyOtpPage() {
  const { verifyOtp, resendOtp, pendingPhone } = useAuth();
  const { t } = useLocale();
  const navigate = useNavigate();
  const location = useLocation();
  const demoOtp = (location.state as { demoOtp?: string } | null)?.demoOtp;
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState(
    demoOtp ? t('otp.demoInfo', { otp: demoOtp }) : t('otp.enterInfo')
  );

  if (!pendingPhone && !demoOtp) {
    return (
      <div className="page-shell">
        <Card className="w-full max-w-md animate-rise-in">
          <CardHeader>
            <div className="mb-2 flex items-center justify-between">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
            <CardTitle className="page-title">{t('otp.noneTitle')}</CardTitle>
            <CardDescription>{t('otp.noneLede')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/register">{t('otp.register')}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await verifyOtp(otp);
    if (!result.ok) {
      setError(t(result.error as TranslationKey));
      return;
    }
    navigate('/login', { state: { emailVerification: true } });
  };

  const onResend = async () => {
    const result = await resendOtp();
    if (!result.ok) {
      setError(t(result.error as TranslationKey));
      return;
    }
    setError('');
    setInfo(t('otp.newDemo', { otp: result.otp }));
  };

  return (
    <div className="page-shell">
      <Card className="w-full max-w-md animate-rise-in">
        <CardHeader>
          <div className="mb-2 flex items-center justify-between">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
          <CardTitle className="page-title">{t('otp.title')}</CardTitle>
          <CardDescription>
            {t('otp.lede', { phone: pendingPhone || t('otp.yourPhone') })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            {info && <Alert variant="info">{info}</Alert>}
            {error && <Alert variant="destructive">{error}</Alert>}
            <div>
              <Label>
                {t('otp.label')} <span className="text-destructive">*</span>
              </Label>
              <Input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                inputMode="numeric"
                maxLength={6}
                placeholder={t('otp.placeholder')}
                required
                dir="ltr"
                className="text-center text-lg tracking-[0.5em]"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                {t('otp.submit')}
              </Button>
              <Button type="button" variant="secondary" onClick={onResend}>
                {t('otp.resend')}
              </Button>
            </div>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {t('otp.wrongNumber')}{' '}
            <Link
              to="/register"
              className="font-semibold text-primary hover:underline"
            >
              {t('otp.goBack')}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
