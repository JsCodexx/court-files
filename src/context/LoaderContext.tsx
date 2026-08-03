import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useLocale } from '../i18n/LocaleContext';

interface LoaderContextValue {
  loading: boolean;
  showLoader: () => void;
  hideLoader: () => void;
  /** Run an async task while the global loader is visible. */
  withLoader: <T>(task: () => Promise<T>) => Promise<T>;
}

const LoaderContext = createContext<LoaderContextValue | null>(null);

function PakistanEmblem() {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      {/* Crescent */}
      <path d="M36.2 10.4c-10.8 1.4-19 10.7-19 21.9 0 12.2 9.9 22.1 22.1 22.1 4.4 0 8.5-1.3 12-3.5-4.1 2.3-8.9 3.6-14 3.6C23.4 54.5 12 43.1 12 29.2 12 17.2 20.6 7.1 32 4.4c1.4-.3 2.9-.5 4.4-.5-.1 2.1-.1 4.3-.2 6.5z" />
      {/* Five-point star */}
      <path d="M44.8 18.2l2.6 5.4 5.9.7-4.4 4.1 1.2 5.8-5.3-2.9-5.3 2.9 1.2-5.8-4.4-4.1 5.9-.7z" />
    </svg>
  );
}

function LoaderOverlay() {
  const { t } = useLocale();
  return (
    <div className="loader-overlay" role="status" aria-live="polite" aria-busy="true">
      <div className="loader-panel">
        <div className="loader-orbit">
          <div className="loader-emblem">
            <PakistanEmblem />
          </div>
        </div>
        <p className="loader-label">{t('common.loading')}</p>
      </div>
    </div>
  );
}

export function LoaderProvider({ children }: { children: React.ReactNode }) {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);

  const showLoader = useCallback(() => {
    countRef.current += 1;
    setCount(countRef.current);
  }, []);

  const hideLoader = useCallback(() => {
    countRef.current = Math.max(0, countRef.current - 1);
    setCount(countRef.current);
  }, []);

  const withLoader = useCallback(
    async <T,>(task: () => Promise<T>): Promise<T> => {
      showLoader();
      try {
        return await task();
      } finally {
        hideLoader();
      }
    },
    [showLoader, hideLoader]
  );

  const value = useMemo(
    () => ({
      loading: count > 0,
      showLoader,
      hideLoader,
      withLoader,
    }),
    [count, showLoader, hideLoader, withLoader]
  );

  return (
    <LoaderContext.Provider value={value}>
      {children}
      {count > 0 && <LoaderOverlay />}
    </LoaderContext.Provider>
  );
}

export function useLoader(): LoaderContextValue {
  const ctx = useContext(LoaderContext);
  if (!ctx) throw new Error('useLoader must be used within LoaderProvider');
  return ctx;
}
