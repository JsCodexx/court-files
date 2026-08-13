import React, { useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
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
import { useLoader } from '../context/LoaderContext';
import { useLocale } from '../i18n/LocaleContext';
import { TranslationKey } from '../i18n/translations';
import { cn } from '../lib/utils';
import { ApiError, apiFetch } from '../utils/api';

export function ProfilePage() {
  const { t } = useLocale();

  const tabs = [
    { to: '/profile', label: t('profile.tabProfile'), end: true },
    { to: '/profile/settings', label: t('profile.tabSettings'), end: false },
  ];

  return (
    <div className="animate-rise-in mx-auto w-full max-w-2xl space-y-5">
      <div>
        <h1 className="page-title">{t('profile.title')}</h1>
        <p className="page-lede">{t('profile.lede')}</p>
      </div>

      <div
        role="tablist"
        aria-label={t('profile.title')}
        className="flex gap-0.5 border-b"
      >
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            role="tab"
            className={({ isActive }) =>
              cn(
                'relative px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )
            }
          >
            {({ isActive }) => (
              <>
                {tab.label}
                <span
                  className={cn(
                    'absolute inset-x-2 -bottom-px h-0.5 rounded-full',
                    isActive ? 'bg-primary' : 'bg-transparent'
                  )}
                />
              </>
            )}
          </NavLink>
        ))}
      </div>

      <Outlet />
    </div>
  );
}

type ProfileUser = {
  userId: string;
  name: string;
  email: string;
  phone: string;
  barAddress: string;
};

export function ProfileOverview() {
  const { t } = useLocale();
  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    apiFetch<{ ok: true; user: ProfileUser }>('/auth/me')
      .then((res) => {
        if (alive) setProfile(res.user);
      })
      .catch((err) => {
        if (!alive) return;
        setError(
          err instanceof ApiError
            ? t((err.errorKey as TranslationKey) || 'errors.network')
            : t('errors.network')
        );
      });
    return () => {
      alive = false;
    };
  }, [t]);

  if (error) {
    return <Alert variant="destructive">{error}</Alert>;
  }

  if (!profile) {
    return (
      <p className="text-sm text-muted-foreground">{t('common.dash')}</p>
    );
  }

  const rows: { label: string; value: string; ltr?: boolean }[] = [
    { label: t('register.name'), value: profile.name },
    { label: t('register.email'), value: profile.email, ltr: true },
    { label: t('register.phone'), value: profile.phone, ltr: true },
    { label: t('register.barAddress'), value: profile.barAddress },
  ];

  return (
    <div className="overflow-hidden rounded-lg border bg-card/95 shadow-sm">
      <dl className="divide-y">
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid gap-1 px-4 py-3 sm:grid-cols-[10rem_1fr] sm:items-baseline sm:gap-4 sm:px-5"
          >
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {row.label}
            </dt>
            <dd
              className={cn('text-sm font-medium', !row.ltr && 'urdu-text')}
              dir={row.ltr ? 'ltr' : undefined}
            >
              {row.value || t('common.dash')}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function ProfileSettings() {
  const { t } = useLocale();
  const { withLoader } = useLoader();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (newPassword !== confirmPassword) {
      setError(t('register.passwordMismatch'));
      return;
    }
    if (currentPassword === newPassword) {
      setError(t('errors.passwordSame'));
      return;
    }
    setSubmitting(true);
    try {
      await withLoader(() =>
        apiFetch<{ ok: true }>('/auth/change-password', {
          method: 'POST',
          body: { currentPassword, newPassword },
        })
      );
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccess(t('profile.passwordUpdated'));
    } catch (err) {
      setError(
        err instanceof ApiError
          ? t(err.errorKey as TranslationKey)
          : t('errors.network')
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('profile.settingsTitle')}</CardTitle>
        <CardDescription>{t('profile.settingsLede')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          {success && <Alert variant="success">{success}</Alert>}
          {error && <Alert variant="destructive">{error}</Alert>}
          <div>
            <Label>
              {t('profile.currentPassword')}{' '}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              dir="ltr"
              autoComplete="current-password"
            />
          </div>
          <div>
            <Label>
              {t('profile.newPassword')}{' '}
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
              {t('profile.confirmPassword')}{' '}
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
          <Button type="submit" disabled={submitting}>
            {t('profile.changePassword')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
