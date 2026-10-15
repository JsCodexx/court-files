import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { ChevronRight, CreditCard, Receipt } from '../components/icons';
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
import { useAuth } from '../context/AuthContext';
import { useLoader } from '../context/LoaderContext';
import { useLocale } from '../i18n/LocaleContext';
import { TranslationKey } from '../i18n/translations';
import { AppPageHeader } from '../components/AppPage';
import { PwaInstallCard } from '../components/PwaInstallCard';
import { ProfileOverviewSkeleton } from '../components/skeletons';
import { cn } from '../lib/utils';
import { ApiError, apiFetch } from '../utils/api';

export function ProfilePage() {
  const { t } = useLocale();

  const tabs = [
    { to: '/profile', label: t('profile.tabProfile'), end: true },
    { to: '/profile/settings', label: t('profile.tabSettings'), end: false },
  ];

  return (
    <div className="app-page">
      <AppPageHeader title={t('profile.title')} lede={t('profile.lede')} />

      <div
        role="tablist"
        aria-label={t('profile.title')}
        className="scroll-x-tabs border-b"
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

function ProfileFieldSkeleton() {
  return (
    <span className="inline-block h-4 w-32 max-w-full animate-pulse rounded bg-muted" />
  );
}

export function ProfileOverview() {
  const { t } = useLocale();
  const { user, refreshUser } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    refreshUser().catch((err) => {
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
  }, [refreshUser, t]);

  if (!user) {
    return <ProfileOverviewSkeleton />;
  }

  if (error && !user.phone) {
    return <Alert variant="destructive">{error}</Alert>;
  }

  const rows: {
    label: string;
    value: string | undefined;
    ltr?: boolean;
  }[] = [
    { label: t('register.name'), value: user.name },
    { label: t('register.email'), value: user.email, ltr: true },
    { label: t('register.phone'), value: user.phone, ltr: true },
    { label: t('register.barAddress'), value: user.barAddress },
  ];

  const quickLinks = [
    { to: '/plans', label: t('profile.quickPlans'), icon: CreditCard },
    { to: '/payments', label: t('profile.quickPayments'), icon: Receipt },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-2">
        {quickLinks.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className="app-panel shadow-brand-hover flex min-h-[3rem] items-center justify-between gap-3 px-4 py-3 text-sm font-medium transition-shadow"
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className="icon-tile-brand h-9 w-9">
                  <Icon className="h-4 w-4" weight="duotone" />
                </span>
                <span className="truncate">{item.label}</span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground rtl:rotate-180" />
            </Link>
          );
        })}
      </div>
    <div className="app-panel overflow-hidden">
      <div className="brand-band px-4 py-3 sm:px-5">
        <p className="page-eyebrow !text-[hsl(var(--brand-fresh))]">
          {t('profile.tabProfile')}
        </p>
      </div>
      <dl className="divide-y divide-border/70">
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
              {row.value ? (
                row.value
              ) : error ? (
                t('common.dash')
              ) : (
                <ProfileFieldSkeleton />
              )}
            </dd>
          </div>
        ))}
      </dl>
    </div>
    </div>
  );
}

export function ProfileSettings() {
  const { t } = useLocale();
  const { logout } = useAuth();
  const navigate = useNavigate();
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
      logout();
      navigate('/login', {
        replace: true,
        state: { passwordChanged: true },
      });
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
    <div className="space-y-5">
      <PwaInstallCard />
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
            <PasswordInput
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
            <PasswordInput
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              dir="ltr"
              autoComplete="new-password"
            />
          </div>
          <div>
            <Label>
              {t('profile.confirmPassword')}{' '}
              <span className="text-destructive">*</span>
            </Label>
            <PasswordInput
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              dir="ltr"
              autoComplete="new-password"
            />
          </div>
          <div className="app-form-actions pt-2">
            <Button type="submit" disabled={submitting}>
              {t('profile.changePassword')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
    </div>
  );
}
