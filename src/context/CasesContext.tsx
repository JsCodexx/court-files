import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { CaseStatus, CourtCase, CourtCategory, HearingRecord } from '../types';
import { ApiError, apiFetch } from '../utils/api';
import { useAuth } from './AuthContext';

type CaseInput = Omit<
  CourtCase,
  'id' | 'createdAt' | 'updatedAt' | 'userId' | 'hearings' | 'status'
> & { status?: CaseStatus };

export type SearchMode = 'name' | 'caseId' | 'idCard';

interface CasesContextValue {
  cases: CourtCase[];
  loading: boolean;
  error: string | null;
  /** Bumped after every mutation so pages can refetch server-side lists. */
  version: number;
  refresh: () => Promise<void>;
  addCase: (input: CaseInput) => Promise<CourtCase>;
  updateCase: (id: string, patch: Partial<CaseInput>) => Promise<void>;
  addHearing: (
    caseId: string,
    hearing: Omit<HearingRecord, 'id' | 'createdAt'>
  ) => Promise<void>;
  updateHearing: (
    caseId: string,
    hearingId: string,
    patch: Partial<Omit<HearingRecord, 'id' | 'createdAt'>>
  ) => Promise<CourtCase>;
  deleteHearing: (caseId: string, hearingId: string) => Promise<CourtCase>;
  deleteCase: (id: string) => Promise<void>;
  getCase: (id: string) => Promise<CourtCase>;
  fetchToday: () => Promise<CourtCase[]>;
  fetchTomorrow: () => Promise<CourtCase[]>;
  fetchByCategory: (category: CourtCategory) => Promise<CourtCase[]>;
  fetchByDate: (isoDate: string) => Promise<CourtCase[]>;
  fetchHearingDates: () => Promise<Set<string>>;
  searchCases: (query: string, mode: SearchMode) => Promise<CourtCase[]>;
}

const CasesContext = createContext<CasesContextValue | null>(null);

function toErrorKey(err: unknown): string {
  if (err instanceof ApiError) return err.errorKey;
  return 'errors.network';
}

interface CasesResponse {
  ok: true;
  cases: CourtCase[];
}

export function CasesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [cases, setCases] = useState<CourtCase[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  const bump = useCallback(() => setVersion((v) => v + 1), []);

  const refresh = useCallback(async () => {
    if (!user) {
      setCases([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<CasesResponse>('/cases');
      setCases(res.cases);
    } catch (err) {
      setError(toErrorKey(err));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addCase = useCallback(
    async (input: CaseInput) => {
      const res = await apiFetch<{ ok: true; case: CourtCase }>('/cases', {
        method: 'POST',
        body: input,
      });
      setCases((prev) => [res.case, ...prev]);
      bump();
      return res.case;
    },
    [bump]
  );

  const updateCase = useCallback(
    async (id: string, patch: Partial<CaseInput>) => {
      const res = await apiFetch<{ ok: true; case: CourtCase }>(
        `/cases/${id}`,
        {
          method: 'PATCH',
          body: patch,
        }
      );
      setCases((prev) => prev.map((c) => (c.id === id ? res.case : c)));
      bump();
    },
    [bump]
  );

  const addHearing = useCallback(
    async (
      caseInternalId: string,
      hearing: Omit<HearingRecord, 'id' | 'createdAt'>
    ) => {
      const res = await apiFetch<{ ok: true; case: CourtCase }>(
        `/cases/${caseInternalId}/hearings`,
        {
          method: 'POST',
          body: hearing,
        }
      );
      setCases((prev) =>
        prev.map((c) => (c.id === caseInternalId ? res.case : c))
      );
      bump();
    },
    [bump]
  );

  const updateHearing = useCallback(
    async (
      caseInternalId: string,
      hearingId: string,
      patch: Partial<Omit<HearingRecord, 'id' | 'createdAt'>>
    ) => {
      const res = await apiFetch<{ ok: true; case: CourtCase }>(
        `/cases/${caseInternalId}/hearings/${hearingId}`,
        {
          method: 'PATCH',
          body: patch,
        }
      );
      setCases((prev) =>
        prev.map((c) => (c.id === caseInternalId ? res.case : c))
      );
      bump();
      return res.case;
    },
    [bump]
  );

  const deleteHearing = useCallback(
    async (caseInternalId: string, hearingId: string) => {
      const res = await apiFetch<{ ok: true; case: CourtCase }>(
        `/cases/${caseInternalId}/hearings/${hearingId}`,
        {
          method: 'DELETE',
        }
      );
      setCases((prev) =>
        prev.map((c) => (c.id === caseInternalId ? res.case : c))
      );
      bump();
      return res.case;
    },
    [bump]
  );

  const deleteCase = useCallback(
    async (id: string) => {
      await apiFetch<{ ok: true }>(`/cases/${id}`, { method: 'DELETE' });
      setCases((prev) => prev.filter((c) => c.id !== id));
      bump();
    },
    [bump]
  );

  const getCase = useCallback(async (id: string) => {
    const res = await apiFetch<{ ok: true; case: CourtCase }>(`/cases/${id}`);
    return res.case;
  }, []);

  const fetchToday = useCallback(async () => {
    const res = await apiFetch<CasesResponse>('/cases/today');
    return res.cases;
  }, []);

  const fetchTomorrow = useCallback(async () => {
    const res = await apiFetch<CasesResponse>('/cases/tomorrow');
    return res.cases;
  }, []);

  const fetchByCategory = useCallback(async (category: CourtCategory) => {
    const res = await apiFetch<CasesResponse>(
      `/cases/category/${encodeURIComponent(category)}`
    );
    return res.cases;
  }, []);

  const fetchByDate = useCallback(async (isoDate: string) => {
    const res = await apiFetch<CasesResponse>(
      `/cases/by-date?date=${encodeURIComponent(isoDate)}`
    );
    return res.cases;
  }, []);

  const fetchHearingDates = useCallback(async () => {
    const res = await apiFetch<{ ok: true; dates: string[] }>(
      '/cases/hearing-dates'
    );
    return new Set(res.dates);
  }, []);

  const searchCases = useCallback(async (query: string, mode: SearchMode) => {
    const q = query.trim();
    if (!q) return [];
    const res = await apiFetch<CasesResponse>(
      `/cases/search?q=${encodeURIComponent(q)}&mode=${mode}`
    );
    return res.cases;
  }, []);

  const value = useMemo(
    () => ({
      cases,
      loading,
      error,
      version,
      refresh,
      addCase,
      updateCase,
      addHearing,
      updateHearing,
      deleteHearing,
      deleteCase,
      getCase,
      fetchToday,
      fetchTomorrow,
      fetchByCategory,
      fetchByDate,
      fetchHearingDates,
      searchCases,
    }),
    [
      cases,
      loading,
      error,
      version,
      refresh,
      addCase,
      updateCase,
      addHearing,
      updateHearing,
      deleteHearing,
      deleteCase,
      getCase,
      fetchToday,
      fetchTomorrow,
      fetchByCategory,
      fetchByDate,
      fetchHearingDates,
      searchCases,
    ]
  );

  return (
    <CasesContext.Provider value={value}>{children}</CasesContext.Provider>
  );
}

export function useCases(): CasesContextValue {
  const ctx = useContext(CasesContext);
  if (!ctx) throw new Error('useCases must be used within CasesProvider');
  return ctx;
}
