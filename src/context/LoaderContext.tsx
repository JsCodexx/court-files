import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { BrandLoader } from '../components/BrandLoader';
import { useLocale } from '../i18n/LocaleContext';

interface LoaderContextValue {
  loading: boolean;
  showLoader: () => void;
  hideLoader: () => void;
  /** Run an async task while the global loader is visible. */
  withLoader: <T>(task: () => Promise<T>) => Promise<T>;
}

const LoaderContext = createContext<LoaderContextValue | null>(null);

function LoaderOverlay() {
  const { t } = useLocale();
  return (
    <div className="loader-overlay">
      <div className="loader-panel">
        <BrandLoader size="md" label={t('common.loading')} />
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
