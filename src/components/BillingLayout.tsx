import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppPage, AppPageHeader } from './AppPage';
import { BillingTabs } from './BillingTabs';
import { useLocale } from '../i18n/LocaleContext';

export function BillingLayout() {
  const { t } = useLocale();

  return (
    <AppPage>
      <AppPageHeader
        title={t('nav.billingHub')}
        lede={t('billing.hubLede')}
      />
      <BillingTabs />
      <div className="mt-4 min-w-0">
        <Outlet />
      </div>
    </AppPage>
  );
}
