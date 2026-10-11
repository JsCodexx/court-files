import { TranslationKey, en } from '../i18n/translations';

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
  'Email delivery is not configured. Cannot send verification OTP.':
    'errors.mailNotConfigured',
  'Could not send verification email. Please try again later.':
    'errors.mailSendFailed',
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
  'Unable to start RapidGateway checkout. Please try again.':
    'checkout.gatewayUnavailable',
  'Name, email and phone are required for checkout.': 'checkout.detailsRequired',
  'Phone must be a valid Pakistani mobile (03XXXXXXXXX or +923XXXXXXXXX).':
    'validation.phone',
  'This phone is already registered with another email. Sign in or use a different phone.':
    'checkout.phoneInUse',
  'Email and mobile number are required for RapidGateway checkout.':
    'checkout.detailsRequired',
  'Case limit reached. Purchase a plan to add more cases.':
    'errors.caseLimitReached',
  'Your subscription has expired. Renew your plan to continue using Court Files.':
    'errors.subscriptionExpired',
};

export function isTranslationKey(key: string): key is TranslationKey {
  return Object.prototype.hasOwnProperty.call(en, key);
}

/** User-facing copy for API failures (never leave Rapid/raw 500 text untranslated). */
export function translateApiError(
  err: unknown,
  t: (key: TranslationKey) => string
): string {
  if (!(err instanceof ApiError)) return t('errors.network');
  if (isTranslationKey(err.errorKey)) return t(err.errorKey);

  const blob = `${err.message} ${err.errorKey}`.toLowerCase();
  if (
    err.status === 502 ||
    blob.includes('rapid') ||
    blob.includes('oauth') ||
    blob.includes('fetch failed')
  ) {
    return t('checkout.gatewayUnavailable');
  }
  if (err.status === 402 || blob.includes('case limit')) {
    return t('errors.caseLimitReached');
  }
  if (blob.includes('subscription has expired')) {
    return t('errors.subscriptionExpired');
  }
  if (err.status >= 500 || blob.includes('internal server')) {
    return t('checkout.startFailed');
  }
  return err.message || t('errors.network');
}

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
