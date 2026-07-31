import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AuthSession, User } from '../types';
import { ApiError, apiFetch, getToken, setToken } from '../utils/api';

const SESSION_KEY = 'cf_session';
const PENDING_PHONE_KEY = 'cf_pending_phone';

type Result<T = {}> = ({ ok: true } & T) | { ok: false; error: string };

interface AuthContextValue {
  user: AuthSession | null;
  registerDraft: (
    data: Omit<User, 'id' | 'createdAt'>
  ) => Promise<Result<{ otp: string }>>;
  verifyOtp: (otp: string) => Promise<Result>;
  resendOtp: () => Promise<Result<{ otp: string }>>;
  login: (emailOrPhone: string, password: string) => Promise<Result>;
  logout: () => void;
  pendingPhone: string | null;
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

function toError(err: unknown): { ok: false; error: string } {
  if (err instanceof ApiError) {
    return { ok: false, error: err.errorKey };
  }
  return { ok: false, error: 'errors.network' };
}

interface AuthResponse {
  ok: true;
  token: string;
  user: AuthSession & { phone: string; barAddress: string };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthSession | null>(() => readSession());
  const [pendingPhone, setPendingPhone] = useState<string | null>(() =>
    readPendingPhone()
  );

  const applyAuth = useCallback((res: AuthResponse) => {
    const session: AuthSession = {
      userId: res.user.userId,
      email: res.user.email,
      name: res.user.name,
    };
    setToken(res.token);
    writeSession(session);
    setUser(session);
  }, []);

  const registerDraft = useCallback(
    async (data: Omit<User, 'id' | 'createdAt'>) => {
      try {
        const res = await apiFetch<{ ok: true; otp: string; phone: string }>(
          '/auth/register',
          {
            method: 'POST',
            body: {
              name: data.name,
              phone: data.phone,
              email: data.email,
              barAddress: data.barAddress,
              password: data.password,
            },
          }
        );
        writePendingPhone(res.phone);
        setPendingPhone(res.phone);
        return { ok: true as const, otp: res.otp };
      } catch (err) {
        return toError(err);
      }
    },
    []
  );

  const verifyOtp = useCallback(
    async (otp: string) => {
      const phone = readPendingPhone();
      if (!phone) {
        return { ok: false as const, error: 'errors.noRegistration' };
      }
      try {
        const res = await apiFetch<AuthResponse>('/auth/verify-otp', {
          method: 'POST',
          body: { phone, otp },
        });
        applyAuth(res);
        writePendingPhone(null);
        setPendingPhone(null);
        return { ok: true as const };
      } catch (err) {
        return toError(err);
      }
    },
    [applyAuth]
  );

  const resendOtp = useCallback(async () => {
    const phone = readPendingPhone();
    if (!phone) {
      return { ok: false as const, error: 'errors.noRegistration' };
    }
    try {
      const res = await apiFetch<{ ok: true; otp: string }>('/auth/resend-otp', {
        method: 'POST',
        body: { phone },
      });
      return { ok: true as const, otp: res.otp };
    } catch (err) {
      return toError(err);
    }
  }, []);

  const login = useCallback(
    async (emailOrPhone: string, password: string) => {
      try {
        const res = await apiFetch<AuthResponse>('/auth/login', {
          method: 'POST',
          body: { emailOrPhone, password },
        });
        applyAuth(res);
        return { ok: true as const };
      } catch (err) {
        return toError(err);
      }
    },
    [applyAuth]
  );

  const logout = useCallback(() => {
    setToken(null);
    writeSession(null);
    setUser(null);
  }, []);

  // Validate the stored token against the server on startup; refresh the
  // session details or sign out if the token is no longer valid.
  useEffect(() => {
    if (!getToken()) return;
    let alive = true;
    apiFetch<{ ok: true; user: AuthSession & { phone: string; barAddress: string } }>(
      '/auth/me'
    )
      .then((res) => {
        if (!alive) return;
        const session: AuthSession = {
          userId: res.user.userId,
          email: res.user.email,
          name: res.user.name,
        };
        writeSession(session);
        setUser(session);
      })
      .catch((err) => {
        if (!alive) return;
        if (err instanceof ApiError && (err.status === 401 || err.status === 404)) {
          logout();
        }
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({
      user,
      registerDraft,
      verifyOtp,
      resendOtp,
      login,
      logout,
      pendingPhone,
    }),
    [user, registerDraft, verifyOtp, resendOtp, login, logout, pendingPhone]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
