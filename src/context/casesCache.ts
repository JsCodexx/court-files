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
