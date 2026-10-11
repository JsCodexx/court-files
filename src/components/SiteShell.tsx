import React from 'react';
import { PublicPageBody, PublicSiteFrame } from './public/PublicLayout';

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <PublicSiteFrame>
      <PublicPageBody>{children}</PublicPageBody>
    </PublicSiteFrame>
  );
}

export { SiteFooterLinks } from './CompanyFooter';
