const API_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:5500/api';

const TOKEN_KEY = 'cf_token';

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
  'Password must be at least 6 characters.': 'errors.passwordShort',
  'No registration in progress.': 'errors.noRegistration',
  'Invalid OTP. Please try again.': 'errors.invalidOtp',
  'OTP has expired. Please register again.': 'errors.otpExpired',
  'Invalid credentials.': 'errors.invalidCredentials',
  'No account found for this phone number.': 'errors.phoneNotFound',
  'No password reset in progress.': 'errors.noReset',
  'OTP has expired. Please try again.': 'errors.otpExpired',
  'hearing.editLocked': 'hearing.editLocked',
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
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
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
    throw new ApiError(data?.error || `Request failed (${response.status})`, response.status);
  }

  return data as T;
}
