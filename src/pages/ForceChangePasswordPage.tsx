import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Label } from '../components/ui/label';
import { PasswordInput } from '../components/ui/password-input';
import { AuthBrandHeader } from '../components/AuthBrandHeader';
import ThemeToggle from '../components/ThemeToggle';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../i18n/LocaleContext';
import { TranslationKey } from '../i18n/translations';
import { ApiError, apiFetch } from '../utils/api';

export function ForceChangePasswordPage() {
  const { user, logout } = useAuth();
  const { t } = useLocale();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 8) {
      setError(t('errors.passwordShort'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t('register.passwordMismatch'));
      return;
    }
    if (currentPassword === newPassword) {
      setError(t('forcePw.samePassword'));
      return;
    }
    setBusy(true);
    try {
      await apiFetch('/auth/change-password', {
        method: 'POST',
        body: { currentPassword, newPassword },
      });
      logout();
      navigate('/login', { replace: true, state: { passwordChanged: true } });
    } catch (err) {
      setError(
        err instanceof ApiError
          ? t(err.errorKey as TranslationKey)
          : t('errors.network')
      );
    } finally {
      setBusy(false);
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
          <CardTitle className="sr-only">{t('forcePw.title')}</CardTitle>
          <CardDescription className="text-center">
            {t('forcePw.lede', { email: user?.email || '' })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            {error && <Alert variant="destructive">{error}</Alert>}
            <Alert variant="info">{t('forcePw.hint')}</Alert>
            <div>
              <Label>{t('profile.currentPassword')}</Label>
              <PasswordInput
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <div>
              <Label>{t('profile.newPassword')}</Label>
              <PasswordInput
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
            <div>
              <Label>{t('profile.confirmPassword')}</Label>
              <PasswordInput
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? t('common.loading') : t('forcePw.submit')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
