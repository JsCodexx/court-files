import { useCallback, useEffect, useState } from 'react';
import type { ManualPaymentRequestItem } from '../components/ManualPaymentRequestsPanel';
import type { ManualPaymentRequestDto } from '../types/manualPayment';
import { hasPendingManualRequest } from '../components/ManualPaymentRequestsPanel';
import { useLocale } from '../i18n/LocaleContext';
import { apiFetch, translateApiError } from '../utils/api';

const POLL_MS = 25_000;

export function useManualPaymentRequests(options?: { pollWhenPending?: boolean }) {
  const pollWhenPending = options?.pollWhenPending ?? true;
  const { t } = useLocale();
  const [requests, setRequests] = useState<ManualPaymentRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const reload = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await apiFetch<{ ok: true; requests: ManualPaymentRequestDto[] }>(
        '/payments/manual-requests'
      );
      setRequests(res.requests as ManualPaymentRequestItem[]);
      setError('');
      return res.requests;
    } catch (e) {
      if (!silent) setError(translateApiError(e, t));
      return null;
    } finally {
      if (!silent) setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const pending = hasPendingManualRequest(requests);

  useEffect(() => {
    if (!pollWhenPending || !pending) return;

    const id = window.setInterval(() => void reload(true), POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === 'visible') void reload(true);
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [pollWhenPending, pending, reload]);

  return {
    requests,
    loading,
    error,
    reload,
    pending,
  };
}
