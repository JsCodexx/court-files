import React from 'react';
import { useLocale } from '../i18n/LocaleContext';
import { TranslationKey } from '../i18n/translations';
import { CaseStatus } from '../types';
import { Badge } from './ui/badge';

function labelKey(status: CaseStatus): TranslationKey {
  if (status === 'decided') return 'status.decided';
  if (status === 'party_left') return 'status.partyLeft';
  return 'status.pending';
}

function variantFor(status: CaseStatus) {
  if (status === 'decided') return 'success' as const;
  if (status === 'party_left') return 'destructive' as const;
  return 'secondary' as const;
}

export function CaseStatusBadge({
  status,
  alwaysShow = false,
}: {
  status: CaseStatus;
  /** When false, pending badges are hidden (table rows). */
  alwaysShow?: boolean;
}) {
  const { t } = useLocale();
  if (!alwaysShow && status === 'pending') return null;
  return <Badge variant={variantFor(status)}>{t(labelKey(status))}</Badge>;
}
