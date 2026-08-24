const API_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:5500/api';

const TOKEN_KEY = 'cf_token';

let onUnauthorized: (() => void) | null = null;

export function setOnUnauthorized(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    /* ignore */
  }
}

/** Maps server error messages to i18n translation keys. */
const ERROR_KEY_MAP: Record<string, string> = {
  'Email is already registered.': 'errors.emailRegistered',
  'Phone number is already registered.': 'errors.phoneRegistered',
  'Unable to complete registration. Check your details or sign in if you already have an account.':
    'errors.registrationFailed',
  'Password must be at least 6 characters.': 'errors.passwordShort',
  'Password must be at least 8 characters.': 'errors.passwordShort',
  'No registration in progress.': 'errors.noRegistration',
  'Invalid OTP. Please try again.': 'errors.invalidOtp',
  'OTP has expired. Please register again.': 'errors.otpExpired',
  'Too many failed attempts. Please register again.': 'errors.otpLocked',
  'Invalid credentials.': 'errors.invalidCredentials',
  'No account found for this phone number.': 'errors.phoneNotFound',
  'No password reset in progress.': 'errors.noReset',
  'OTP has expired. Please try again.': 'errors.otpExpired',
  'This reset link is invalid or has expired.': 'errors.resetInvalid',
  'Too many requests. Please wait and try again.': 'errors.tooManyRequests',
  'Password reset is temporarily unavailable.': 'errors.resetUnavailable',
  'Current password is incorrect.': 'errors.currentPassword',
  'New password must be different from the current password.':
    'errors.passwordSame',
  'This name is already in your list.': 'errors.personDuplicate',
  'Please verify your email before logging in.': 'errors.emailNotVerified',
  'Invalid or expired verification link.': 'errors.resetInvalid',
  'Verification link has expired. Please request a new one.':
    'errors.resetInvalid',
  'Session expired. Please sign in again.': 'errors.sessionExpired',
  'Internal server error': 'errors.network',
};

export class ApiError extends Error {
  /** i18n key when the server message is recognized, otherwise raw message */
  errorKey: string;
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errorKey = ERROR_KEY_MAP[message] || message;
  }
}

export async function apiFetch<T>(
  path: string,
  options: { method?: string; body?: unknown } = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: options.method || 'GET',
      headers,
      body:
        options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiError('errors.network', 0);
  }

  let data: any = null;
  try {
    data = await response.json();
  } catch {
    /* non-JSON response */
  }

  if (!response.ok || data?.ok === false) {
    const message = data?.error || `Request failed (${response.status})`;
    if (
      response.status === 401 &&
      token &&
      onUnauthorized &&
      path !== '/auth/login' &&
      path !== '/auth/register'
    ) {
      onUnauthorized();
    }
    throw new ApiError(message, response.status);
  }

  return data as T;
}
