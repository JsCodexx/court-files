import { useEffect } from 'react';
import { useSubscriptionContext } from '../context/SubscriptionContext';

export type SubscriptionPhase = 'none' | 'active' | 'grace' | 'lapsed';

export type SubscriptionStatus = {
  freeCaseLimit: number;
  caseCount: number;
  freeCasesRemaining: number;
  phase: SubscriptionPhase;
  subscriptionStatus: string;
  hasActiveSubscription: boolean;
  hasPremiumAccess: boolean;
  subscriptionExpiresAt: string | null;
  graceEndsAt: string | null;
  graceDaysRemaining: number;
  showDailyRenewalPromo: boolean;
  canAddCase: boolean;
  canAccessApp: boolean;
};

/** Shared subscription fetch — loads on login and session restore. */
export function useSubscription(refreshKey = 0) {
  const { status, loading, reload } = useSubscriptionContext();

  useEffect(() => {
    if (refreshKey === 0) return;
    void reload();
  }, [refreshKey, reload]);

  return { status, loading, reload };
}
