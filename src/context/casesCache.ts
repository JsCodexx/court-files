import { CourtCase, CourtCategory } from '../types';

export type DashboardScope = 'today' | 'tomorrow' | 'all';
export type DashboardCategory = CourtCategory | 'all';

export type DashboardPageResult = {
  cases: CourtCase[];
  total: number;
  page: number;
  limit: number;
};

export type DashboardListCache = {
  pages: Record<number, CourtCase[]>;
  total: number;
  limit: number;
};

export type DashboardScopeMeta = {
  total: number;
  byCategory: Record<string, number>;
};

export type DashboardTabCounts = {
  today: number;
  tomorrow: number;
  all: number;
};

export function dashboardCacheKey(
  scope: DashboardScope,
  category: DashboardCategory
): string {
  return `${scope}:${category}`;
}

/** Read a dashboard page from list cache, or derive a category slice from cached "all". */
export function readDashboardListCache(
  lists: Record<string, DashboardListCache>,
  scopeMeta: Partial<Record<DashboardScope, DashboardScopeMeta>>,
  scope: DashboardScope,
  category: DashboardCategory,
  page: number
): DashboardPageResult | undefined {
  const key = dashboardCacheKey(scope, category);
  const bucket = lists[key];
  const cachedPage = bucket?.pages[page];
  if (bucket && cachedPage) {
    return {
      cases: cachedPage,
      total: bucket.total,
      page,
      limit: bucket.limit,
    };
  }

  if (category === 'all') return undefined;

  const allBucket = lists[dashboardCacheKey(scope, 'all')];
  const allOnFirstPage = allBucket?.pages[1];
  if (!allBucket || !allOnFirstPage) return undefined;
  if (allBucket.total > allOnFirstPage.length) return undefined;

  const scopeMetaRow = scopeMeta[scope];
  const expectedTotal = scopeMetaRow?.byCategory[category];
  const filtered = allOnFirstPage.filter((c) => c.category === category);
  if (
    expectedTotal !== undefined &&
    filtered.length !== expectedTotal
  ) {
    return undefined;
  }

  const limit = allBucket.limit;
  const start = (page - 1) * limit;
  const cases = filtered.slice(start, start + limit);
  if (cases.length === 0 && filtered.length > 0 && page > 1) {
    return undefined;
  }

  return {
    cases,
    total: expectedTotal ?? filtered.length,
    page,
    limit,
  };
}

export function writeDashboardListCachePage(
  lists: Record<string, DashboardListCache>,
  scope: DashboardScope,
  category: DashboardCategory,
  page: number,
  cases: CourtCase[],
  total: number,
  limit: number
): Record<string, DashboardListCache> {
  const key = dashboardCacheKey(scope, category);
  const prev = lists[key];
  return {
    ...lists,
    [key]: {
      pages: { ...(prev?.pages ?? {}), [page]: cases },
      total,
      limit,
    },
  };
}

export function mergeCasesIntoCache(
  cache: Record<string, CourtCase>,
  cases: CourtCase[]
): Record<string, CourtCase> {
  const next = { ...cache };
  for (const c of cases) {
    next[c.id] = c;
  }
  return next;
}
