import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AuthSession, User } from '../types';
import {
  ApiError,
  apiFetch,
  getToken,
  setOnUnauthorized,
  setToken,
} from '../utils/api';
import { useLoader } from './LoaderContext';
import { clearSubscriptionAccessCache } from './SubscriptionContext';

const SESSION_KEY = 'cf_session';
const PENDING_PHONE_KEY = 'cf_pending_phone';
const PENDING_EMAIL_KEY = 'cf_pending_email';

type Result<T = {}> = ({ ok: true } & T) | { ok: false; error: string };

type MeUser = AuthSession & {
  phone: string;
  barAddress: string;
  mustChangePassword?: boolean;
};

function sessionFromMe(user: MeUser): AuthSession {
  return {
    userId: user.userId,
    email: user.email,
    name: user.name,
    phone: user.phone,
    barAddress: user.barAddress,
    mustChangePassword: Boolean(user.mustChangePassword),
  };
}

interface AuthContextValue {
  user: AuthSession | null;
  authReady: boolean;
  /** Refresh profile from `/auth/me` without the global loader (deduped). */
  refreshUser: (options?: { force?: boolean }) => Promise<void>;
  registerDraft: (
    data: Omit<User, 'id' | 'createdAt'>
  ) => Promise<Result<{ otp?: string }>>;
  verifyOtp: (otp: string) => Promise<Result>;
  resendOtp: () => Promise<Result<{ otp?: string }>>;
  login: (
    emailOrPhone: string,
    password: string
  ) => Promise<Result<{ mustChangePassword?: boolean }>>;
  logout: () => void;
  pendingPhone: string | null;
  pendingEmail: string | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  } catch {
    return null;
  }
}

function writeSession(session: AuthSession | null): void {
  try {
    if (session) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  } catch {
    /* ignore */
  }
}

function readPendingPhone(): string | null {
  try {
    return localStorage.getItem(PENDING_PHONE_KEY);
  } catch {
    return null;
  }
}

function writePendingPhone(phone: string | null): void {
  try {
    if (phone) {
      localStorage.setItem(PENDING_PHONE_KEY, phone);
    } else {
      localStorage.removeItem(PENDING_PHONE_KEY);
    }
  } catch {
    /* ignore */
  }
}

function readPendingEmail(): string | null {
  try {
    return localStorage.getItem(PENDING_EMAIL_KEY);
  } catch {
    return null;
  }
}

function writePendingEmail(email: string | null): void {
  try {
    if (email) {
      localStorage.setItem(PENDING_EMAIL_KEY, email);
    } else {
      localStorage.removeItem(PENDING_EMAIL_KEY);
    }
  } catch {
    /* ignore */
  }
}

function toError(err: unknown): { ok: false; error: string } {
  if (err instanceof ApiError) {
    return { ok: false, error: err.errorKey };
  }
  return { ok: false, error: 'errors.network' };
}

interface AuthResponse {
  ok: true;
  token: string;
  user: AuthSession & {
    phone: string;
    barAddress: string;
    mustChangePassword?: boolean;
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { withLoader } = useLoader();
  const [user, setUser] = useState<AuthSession | null>(() => readSession());
  const [authReady, setAuthReady] = useState(() => !getToken());
  const [pendingPhone, setPendingPhone] = useState<string | null>(() =>
    readPendingPhone()
  );
  const [pendingEmail, setPendingEmail] = useState<string | null>(() =>
    readPendingEmail()
  );
  const refreshInFlight = useRef<Promise<void> | null>(null);
  const lastUserRefreshAt = useRef(0);

  const logout = useCallback(() => {
    const uid = user?.userId ?? readSession()?.userId;
    if (uid) clearSubscriptionAccessCache(uid);
    setToken(null);
    writeSession(null);
    setUser(null);
  }, [user?.userId]);

  const applyAuth = useCallback((res: AuthResponse) => {
    const session = sessionFromMe(res.user);
    setToken(res.token);
    writeSession(session);
    setUser(session);
  }, []);

  const refreshUser = useCallback(
    async (options?: { force?: boolean }): Promise<void> => {
      if (!getToken()) return;

      const now = Date.now();
      const staleMs = 30_000;
      if (
        !options?.force &&
        now - lastUserRefreshAt.current < staleMs &&
        refreshInFlight.current
      ) {
        return refreshInFlight.current;
      }
      if (!options?.force && now - lastUserRefreshAt.current < staleMs) {
        return;
      }

      const run = (async () => {
        const res = await apiFetch<{ ok: true; user: MeUser }>('/auth/me');
        const session = sessionFromMe(res.user);
        writeSession(session);
        setUser(session);
        lastUserRefreshAt.current = Date.now();
      })();

      refreshInFlight.current = run;
      try {
        await run;
      } finally {
        if (refreshInFlight.current === run) {
          refreshInFlight.current = null;
        }
      }
    },
    []
  );

  useEffect(() => {
    setOnUnauthorized(logout);
    return () => setOnUnauthorized(null);
  }, [logout]);

  const registerDraft = useCallback(
    async (data: Omit<User, 'id' | 'createdAt'>) => {
      try {
        return await withLoader(async () => {
          const res = await apiFetch<{
            ok: true;
            otp?: string;
            phone: string;
            email: string;
          }>('/auth/register', {
            method: 'POST',
            body: {
              name: data.name,
              phone: data.phone,
              email: data.email,
              barAddress: data.barAddress,
              password: data.password,
            },
          });
          writePendingPhone(res.phone);
          setPendingPhone(res.phone);
          writePendingEmail(res.email);
          setPendingEmail(res.email);
          return { ok: true as const, otp: res.otp };
        });
      } catch (err) {
        return toError(err);
      }
    },
    [withLoader]
  );

  const verifyOtp = useCallback(
    async (otp: string) => {
      const phone = readPendingPhone();
      if (!phone) {
        return { ok: false as const, error: 'errors.noRegistration' };
      }
      try {
        return await withLoader(async () => {
          await apiFetch<{ ok: true; message: string }>('/auth/verify-otp', {
            method: 'POST',
            body: { phone, otp },
          });
          writePendingPhone(null);
          setPendingPhone(null);
          writePendingEmail(null);
          setPendingEmail(null);
          return { ok: true as const };
        });
      } catch (err) {
        return toError(err);
      }
    },
    [withLoader]
  );

  const resendOtp = useCallback(async () => {
    const phone = readPendingPhone();
    if (!phone) {
      return { ok: false as const, error: 'errors.noRegistration' };
    }
    try {
      return await withLoader(async () => {
        const res = await apiFetch<{ ok: true; otp?: string }>(
          '/auth/resend-otp',
          {
            method: 'POST',
            body: { phone },
          }
        );
        return { ok: true as const, otp: res.otp };
      });
    } catch (err) {
      return toError(err);
    }
  }, [withLoader]);

  const login = useCallback(
    async (emailOrPhone: string, password: string) => {
      try {
        return await withLoader(async () => {
          const res = await apiFetch<AuthResponse>('/auth/login', {
            method: 'POST',
            body: { emailOrPhone, password },
          });
          applyAuth(res);
          return {
            ok: true as const,
            mustChangePassword: Boolean(res.user.mustChangePassword),
          };
        });
      } catch (err) {
        return toError(err);
      }
    },
    [applyAuth, withLoader]
  );

  // Validate token on startup; show cached session immediately, refresh in background.
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setAuthReady(true);
      return;
    }

    const cached = readSession();
    if (cached) {
      setUser(cached);
      setAuthReady(true);
    } else {
      setAuthReady(false);
    }

    let alive = true;
    (async () => {
      try {
        await refreshUser();
      } catch (err) {
        if (!alive) return;
        if (
          err instanceof ApiError &&
          (err.status === 401 || err.status === 403 || err.status === 404)
        ) {
          logout();
        }
      } finally {
        if (alive) setAuthReady(true);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({
      user,
      authReady,
      refreshUser,
      registerDraft,
      verifyOtp,
      resendOtp,
      login,
      logout,
      pendingPhone,
      pendingEmail,
    }),
    [
      user,
      authReady,
      refreshUser,
      registerDraft,
      verifyOtp,
      resendOtp,
      login,
      logout,
      pendingPhone,
      pendingEmail,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
