import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  dictionaries,
  Locale,
  TranslationKey,
} from './translations';

const STORAGE_KEY = 'cf_locale';

type Vars = Record<string, string | number>;

interface LocaleContextValue {
  locale: Locale;
  dir: 'ltr' | 'rtl';
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, vars?: Vars) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

function readStoredLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'ur') return stored;
  } catch {
    /* ignore */
  }
  return 'ur';
}

function interpolate(template: string, vars?: Vars): string {
  if (!vars) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) =>
    String(vars[key] ?? '')
  );
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => readStoredLocale());

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const dir = locale === 'ur' ? 'rtl' : 'ltr';
    document.documentElement.lang = locale === 'ur' ? 'ur' : 'en';
    document.documentElement.dir = dir;
    document.documentElement.dataset.locale = locale;
  }, [locale]);

  const t = useCallback(
    (key: TranslationKey, vars?: Vars) => {
      const dict = dictionaries[locale] || dictionaries.en;
      const value = dict[key] ?? dictionaries.en[key] ?? key;
      return interpolate(value, vars);
    },
    [locale]
  );

  const value = useMemo(
    () => ({
      locale,
      dir: (locale === 'ur' ? 'rtl' : 'ltr') as 'ltr' | 'rtl',
      setLocale,
      t,
    }),
    [locale, setLocale, t]
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}
