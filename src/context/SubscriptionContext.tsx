import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useAuth } from './AuthContext';
import type { SubscriptionStatus } from '../hooks/useSubscription';
import { apiFetch } from '../utils/api';

/** Poll often enough that grace → lapsed feels immediate without hammering the API. */
const POLL_MS = 30_000;

const STATUS_CACHE_PREFIX = 'cf_sub_access_';

export function readSubscriptionAccessCache(
  userId: string | undefined
): boolean | null {
  if (!userId) return null;
  try {
    const raw = sessionStorage.getItem(`${STATUS_CACHE_PREFIX}${userId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { canAccessApp?: boolean };
    return typeof parsed.canAccessApp === 'boolean' ? parsed.canAccessApp : null;
  } catch {
    return null;
  }
}

export function clearSubscriptionAccessCache(userId: string): void {
  try {
    sessionStorage.removeItem(`${STATUS_CACHE_PREFIX}${userId}`);
  } catch {
    /* ignore */
  }
}

function writeSubscriptionAccessCache(
  userId: string,
  canAccessApp: boolean
): void {
  try {
    sessionStorage.setItem(
      `${STATUS_CACHE_PREFIX}${userId}`,
      JSON.stringify({ canAccessApp })
    );
  } catch {
    /* ignore */
  }
}

type ReloadOptions = { silent?: boolean };

type SubscriptionContextValue = {
  status: SubscriptionStatus | null;
  loading: boolean;
  reload: (options?: ReloadOptions) => Promise<SubscriptionStatus | null>;
};

const SubscriptionContext = createContext<SubscriptionContextValue | null>(
  null
);

export function SubscriptionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, authReady } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const userRef = useRef(user);
  userRef.current = user;

  const reload = useCallback(async (options?: ReloadOptions) => {
    const silent = options?.silent ?? false;
    if (!userRef.current) {
      setStatus(null);
      return null;
    }
    if (!silent) setLoading(true);
    try {
      const res = await apiFetch<{
        ok: true;
        subscription: SubscriptionStatus;
      }>('/subscription/status');
      setStatus(res.subscription);
      if (userRef.current?.userId) {
        writeSubscriptionAccessCache(
          userRef.current.userId,
          res.subscription.canAccessApp
        );
      }
      return res.subscription;
    } catch {
      setStatus(null);
      return null;
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authReady) return;
    if (!user) {
      setStatus(null);
      return;
    }
    void reload();
  }, [authReady, user, reload]);

  useEffect(() => {
    if (!authReady || !user) return;

    const tick = () => void reload({ silent: true });
    const id = window.setInterval(tick, POLL_MS);

    const onFocus = () => tick();
    const onVisible = () => {
      if (document.visibilityState === 'visible') tick();
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      window.clearInterval(id);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [authReady, user, reload]);

  const value = useMemo(
    () => ({ status, loading, reload }),
    [status, loading, reload]
  );

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscriptionContext(): SubscriptionContextValue {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) {
    throw new Error(
      'useSubscription must be used within SubscriptionProvider'
    );
  }
  return ctx;
}
