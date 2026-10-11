import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { CaseStatus, CourtCase, CourtCategory } from '../types';
import { ApiError, apiFetch } from '../utils/api';
import { useAuth } from './AuthContext';
import { useLoader } from './LoaderContext';
import {
  dashboardCacheKey,
  DashboardCategory,
  DashboardListCache,
  DashboardPageResult,
  DashboardScope,
  DashboardScopeMeta,
  DashboardTabCounts,
  mergeCasesIntoCache,
} from './casesCache';

type CaseInput = Omit<
  CourtCase,
  | 'id'
  | 'createdAt'
  | 'updatedAt'
  | 'userId'
  | 'hearings'
  | 'benchHistory'
  | 'status'
  | 'statusRemarks'
> & { status?: CaseStatus; statusRemarks?: string };

export type SearchMode = 'name' | 'caseId' | 'idCard';

type HearingInput = {
  date: string;
  proceeding: string;
  adjournmentReason?: string;
  shortOrder?: string;
  remarks?: string;
};

interface CasesContextValue {
  loading: boolean;
  error: string | null;
  version: number;
  peekCase: (id: string) => CourtCase | undefined;
  fetchDashboardPage: (
    scope: DashboardScope,
    category: DashboardCategory,
    page: number,
    options?: { includeMeta?: boolean; includeTabCounts?: boolean }
  ) => Promise<DashboardPageResult & {
    scopeMeta?: DashboardScopeMeta;
    tabCounts?: DashboardTabCounts;
    fromCache: boolean;
  }>;
  getCachedDashboardMeta: (scope: DashboardScope) => DashboardScopeMeta | undefined;
  getCachedTabCounts: () => DashboardTabCounts | undefined;
  invalidateDashboardCache: () => void;
  refresh: () => Promise<void>;
  addCase: (input: CaseInput) => Promise<CourtCase>;
  updateCase: (id: string, patch: Partial<CaseInput>) => Promise<void>;
  addHearing: (caseId: string, hearing: HearingInput) => Promise<void>;
  updateHearing: (
    caseId: string,
    hearingId: string,
    patch: Partial<HearingInput>
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
const DASHBOARD_PAGE_SIZE = 10;

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
  const { withLoader } = useLoader();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  const caseByIdRef = useRef<Record<string, CourtCase>>({});
  const dashboardListRef = useRef<Record<string, DashboardListCache>>({});
  const scopeMetaRef = useRef<
    Partial<Record<DashboardScope, DashboardScopeMeta>>
  >({});
  const tabCountsRef = useRef<DashboardTabCounts | null>(null);

  const bump = useCallback(() => setVersion((v) => v + 1), []);

  const cacheCases = useCallback((cases: CourtCase[]) => {
    caseByIdRef.current = mergeCasesIntoCache(caseByIdRef.current, cases);
  }, []);

  const cacheCase = useCallback((courtCase: CourtCase) => {
    caseByIdRef.current = mergeCasesIntoCache(caseByIdRef.current, [courtCase]);
  }, []);

  const invalidateDashboardCache = useCallback(() => {
    dashboardListRef.current = {};
    scopeMetaRef.current = {};
    tabCountsRef.current = null;
  }, []);

  const applyMutationCase = useCallback(
    (courtCase: CourtCase) => {
      cacheCase(courtCase);
      invalidateDashboardCache();
      bump();
    },
    [bump, cacheCase, invalidateDashboardCache]
  );

  const peekCase = useCallback((id: string) => caseByIdRef.current[id], []);

  const getCachedDashboardMeta = useCallback((scope: DashboardScope) => {
    return scopeMetaRef.current[scope];
  }, []);

  const getCachedTabCounts = useCallback(
    () => tabCountsRef.current ?? undefined,
    []
  );

  const fetchDashboardPage = useCallback(
    async (
      scope: DashboardScope,
      category: DashboardCategory,
      page: number,
      options?: { includeMeta?: boolean; includeTabCounts?: boolean }
    ) => {
      if (!user) {
        return {
          cases: [],
          total: 0,
          page: 1,
          limit: DASHBOARD_PAGE_SIZE,
          fromCache: true,
        };
      }

      const key = dashboardCacheKey(scope, category);
      const cached = dashboardListRef.current[key];
      const needNetwork =
        !cached?.pages[page] ||
        options?.includeMeta ||
        options?.includeTabCounts;

      if (!needNetwork && cached) {
        return {
          cases: cached.pages[page]!,
          total: cached.total,
          page,
          limit: cached.limit,
          scopeMeta: scopeMetaRef.current[scope],
          tabCounts: tabCountsRef.current ?? undefined,
          fromCache: true,
        };
      }

      setLoading(true);
      setError(null);
      try {
        const qs = new URLSearchParams({
          scope,
          category,
          page: String(page),
          limit: String(DASHBOARD_PAGE_SIZE),
        });
        if (options?.includeMeta) qs.set('includeMeta', '1');
        if (options?.includeTabCounts) qs.set('includeTabCounts', '1');

        const res = await withLoader(async () =>
          apiFetch<
            DashboardPageResult & {
              ok: true;
              scopeMeta?: DashboardScopeMeta;
              tabCounts?: DashboardTabCounts;
            }
          >(`/cases/dashboard?${qs.toString()}`)
        );

        cacheCases(res.cases);

        const prev = dashboardListRef.current[key];
        dashboardListRef.current[key] = {
          pages: { ...(prev?.pages ?? {}), [page]: res.cases },
          total: res.total,
          limit: res.limit,
        };

        if (res.scopeMeta) {
          scopeMetaRef.current[scope] = res.scopeMeta;
        }
        if (res.tabCounts) {
          tabCountsRef.current = res.tabCounts;
        }

        return {
          cases: res.cases,
          total: res.total,
          page: res.page,
          limit: res.limit,
          scopeMeta: res.scopeMeta,
          tabCounts: res.tabCounts,
          fromCache: false,
        };
      } catch (err) {
        setError(toErrorKey(err));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [cacheCases, user, withLoader]
  );

  const refresh = useCallback(async () => {
    invalidateDashboardCache();
    bump();
  }, [bump, invalidateDashboardCache]);

  const addCase = useCallback(
    async (input: CaseInput) => {
      return withLoader(async () => {
        const res = await apiFetch<{ ok: true; case: CourtCase }>('/cases', {
          method: 'POST',
          body: input,
        });
        applyMutationCase(res.case);
        return res.case;
      });
    },
    [applyMutationCase, withLoader]
  );

  const updateCase = useCallback(
    async (id: string, patch: Partial<CaseInput>) => {
      await withLoader(async () => {
        const res = await apiFetch<{ ok: true; case: CourtCase }>(
          `/cases/${id}`,
          { method: 'PATCH', body: patch }
        );
        applyMutationCase(res.case);
      });
    },
    [applyMutationCase, withLoader]
  );

  const addHearing = useCallback(
    async (caseInternalId: string, hearing: HearingInput) => {
      await withLoader(async () => {
        const res = await apiFetch<{ ok: true; case: CourtCase }>(
          `/cases/${caseInternalId}/hearings`,
          { method: 'POST', body: hearing }
        );
        applyMutationCase(res.case);
      });
    },
    [applyMutationCase, withLoader]
  );

  const updateHearing = useCallback(
    async (
      caseInternalId: string,
      hearingId: string,
      patch: Partial<HearingInput>
    ) => {
      return withLoader(async () => {
        const res = await apiFetch<{ ok: true; case: CourtCase }>(
          `/cases/${caseInternalId}/hearings/${hearingId}`,
          { method: 'PATCH', body: patch }
        );
        applyMutationCase(res.case);
        return res.case;
      });
    },
    [applyMutationCase, withLoader]
  );

  const deleteHearing = useCallback(
    async (caseInternalId: string, hearingId: string) => {
      return withLoader(async () => {
        const res = await apiFetch<{ ok: true; case: CourtCase }>(
          `/cases/${caseInternalId}/hearings/${hearingId}`,
          { method: 'DELETE' }
        );
        applyMutationCase(res.case);
        return res.case;
      });
    },
    [applyMutationCase, withLoader]
  );

  const deleteCase = useCallback(
    async (id: string) => {
      await withLoader(async () => {
        await apiFetch<{ ok: true }>(`/cases/${id}`, { method: 'DELETE' });
        delete caseByIdRef.current[id];
        invalidateDashboardCache();
        bump();
      });
    },
    [bump, invalidateDashboardCache, withLoader]
  );

  const getCase = useCallback(
    async (id: string) => {
      const cached = caseByIdRef.current[id];
      if (cached) return cached;

      return withLoader(async () => {
        const res = await apiFetch<{ ok: true; case: CourtCase }>(
          `/cases/${id}`
        );
        cacheCase(res.case);
        return res.case;
      });
    },
    [cacheCase, withLoader]
  );

  const fetchToday = useCallback(async () => {
    return withLoader(async () => {
      const res = await apiFetch<CasesResponse>('/cases/today');
      cacheCases(res.cases);
      return res.cases;
    });
  }, [cacheCases, withLoader]);

  const fetchTomorrow = useCallback(async () => {
    return withLoader(async () => {
      const res = await apiFetch<CasesResponse>('/cases/tomorrow');
      cacheCases(res.cases);
      return res.cases;
    });
  }, [cacheCases, withLoader]);

  const fetchByCategory = useCallback(
    async (category: CourtCategory) => {
      return withLoader(async () => {
        const res = await apiFetch<CasesResponse>(
          `/cases/category/${encodeURIComponent(category)}`
        );
        cacheCases(res.cases);
        return res.cases;
      });
    },
    [cacheCases, withLoader]
  );

  const fetchByDate = useCallback(
    async (isoDate: string) => {
      return withLoader(async () => {
        const res = await apiFetch<CasesResponse>(
          `/cases/by-date?date=${encodeURIComponent(isoDate)}`
        );
        cacheCases(res.cases);
        return res.cases;
      });
    },
    [cacheCases, withLoader]
  );

  const fetchHearingDates = useCallback(async () => {
    return withLoader(async () => {
      const res = await apiFetch<{ ok: true; dates: string[] }>(
        '/cases/hearing-dates'
      );
      return new Set(res.dates);
    });
  }, [withLoader]);

  const searchCases = useCallback(
    async (query: string, mode: SearchMode) => {
      const q = query.trim();
      if (!q) return [];
      return withLoader(async () => {
        const res = await apiFetch<CasesResponse>(
          `/cases/search?q=${encodeURIComponent(q)}&mode=${mode}`
        );
        cacheCases(res.cases);
        return res.cases;
      });
    },
    [cacheCases, withLoader]
  );

  const value = useMemo(
    () => ({
      loading,
      error,
      version,
      peekCase,
      fetchDashboardPage,
      getCachedDashboardMeta,
      getCachedTabCounts,
      invalidateDashboardCache,
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
      loading,
      error,
      version,
      peekCase,
      fetchDashboardPage,
      getCachedDashboardMeta,
      getCachedTabCounts,
      invalidateDashboardCache,
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

export type { DashboardScope, DashboardCategory } from './casesCache';

export function useCases(): CasesContextValue {
  const ctx = useContext(CasesContext);
  if (!ctx) throw new Error('useCases must be used within CasesProvider');
  return ctx;
}
