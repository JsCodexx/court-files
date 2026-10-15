import React, { useState } from 'react';
import { CreditCard, Scale, Search, UserRound } from '../components/icons';
import { CaseTable } from '../components/CaseTable';
import { HearingModal } from '../components/HearingModal';
import { SearchMode, useCases } from '../context/CasesContext';
import { useLocale } from '../i18n/LocaleContext';
import { CaseListSkeleton } from '../components/skeletons';
import { AppPageHeader } from '../components/AppPage';
import { useAppShell } from '../hooks/useAppShell';
import { cn } from '../lib/utils';
import { CourtCase } from '../types';
import { normalizeCnic } from '../utils/validation';

function prepareQuery(raw: string, mode: SearchMode): string {
  if (mode === 'idCard') return normalizeCnic(raw);
  return raw.trim();
}

function resolveSearchMode(raw: string, selected: SearchMode): SearchMode {
  if (selected !== 'name') return selected;
  const digits = normalizeCnic(raw);
  if (digits.length >= 5 && digits.length <= 13) return 'idCard';
  return selected;
}

const MODE_ICONS: Record<SearchMode, React.ComponentType<{ className?: string }>> =
  {
    name: UserRound,
    caseId: Scale,
    idCard: CreditCard,
  };

export function SearchPage() {
  const { searchCases } = useCases();
  const { t } = useLocale();
  const { showBottomNav } = useAppShell();
  const [mode, setMode] = useState<SearchMode>('name');
  const [input, setInput] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [results, setResults] = useState<CourtCase[]>([]);
  const [selected, setSelected] = useState<CourtCase | null>(null);
  const [searching, setSearching] = useState(false);

  const placeholder =
    mode === 'name'
      ? t('search.phName')
      : mode === 'caseId'
        ? t('search.phCaseId')
        : t('search.phIdCard');

  const modeHint =
    mode === 'name'
      ? t('search.nameHint')
      : mode === 'caseId'
        ? t('search.caseIdHint')
        : t('search.idCardHint');

  const modes: { key: SearchMode; label: string }[] = [
    { key: 'name', label: t('search.byName') },
    { key: 'caseId', label: t('search.byCaseId') },
    { key: 'idCard', label: t('search.byIdCard') },
  ];

  async function runSearch() {
    const effectiveMode = resolveSearchMode(input, mode);
    if (effectiveMode !== mode) setMode(effectiveMode);
    const q = prepareQuery(input, effectiveMode);
    if (!q) {
      setResults([]);
      setActiveQuery('');
      return;
    }
    setSearching(true);
    setActiveQuery(q);
    try {
      const list = await searchCases(q, effectiveMode);
      setResults(list);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }

  function onModeChange(next: SearchMode) {
    setMode(next);
    setResults([]);
    setActiveQuery('');
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    void runSearch();
  }

  const canSubmit = Boolean(prepareQuery(input, mode)) && !searching;
  const showResults = Boolean(activeQuery);
  const hasHits = results.length > 0;

  return (
    <div className="app-page search-page">
      <AppPageHeader
        title={t('search.title')}
        lede={t('search.lede')}
        className="[&_.page-lede]:hidden sm:[&_.page-lede]:block"
      />

      <section className="search-spotlight app-panel">
        <div className="search-spotlight__glow" aria-hidden />
        <form onSubmit={onSubmit} className="search-spotlight__inner">
          <label htmlFor="case-search-input" className="sr-only">
            {t('search.label')}
          </label>

          <div className="search-pill">
            <input
              id="case-search-input"
              type="text"
              className={cn(
                'search-pill__input',
                mode === 'name' && 'urdu-input'
              )}
              value={input}
              onChange={(e) => {
                const v = e.target.value;
                setInput(mode === 'idCard' ? normalizeCnic(v) : v);
              }}
              placeholder={placeholder}
              autoFocus={!showBottomNav}
              dir={mode === 'name' ? 'auto' : 'ltr'}
              lang={mode === 'name' ? 'ur' : undefined}
              inputMode={mode === 'idCard' ? 'numeric' : 'search'}
              enterKeyHint="search"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={mode === 'name'}
              maxLength={mode === 'idCard' ? 13 : undefined}
              aria-describedby="search-mode-hint"
            />
            <button
              type="submit"
              className="search-pill__submit"
              disabled={!canSubmit}
            >
              {searching ? t('common.loading') : t('search.button')}
            </button>
          </div>

          <div
            role="tablist"
            aria-label={t('search.modeAria')}
            className="search-filters"
          >
            {modes.map((m) => {
              const active = mode === m.key;
              const Icon = MODE_ICONS[m.key];
              return (
                <button
                  key={m.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => onModeChange(m.key)}
                  className={cn(
                    'search-filter-chip',
                    active && 'search-filter-chip--active'
                  )}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>

          <p id="search-mode-hint" className="search-caption">
            {modeHint}
          </p>
        </form>
      </section>

      {showResults ? (
        <section className="search-results" aria-live="polite">
          <div className="search-results__bar app-panel">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {searching ? t('common.loading') : t('search.results', { count: results.length })}
              </p>
              <p className="mt-1 truncate font-display text-base font-semibold text-foreground sm:text-lg">
                {t('search.resultsFor', { query: activeQuery })}
              </p>
            </div>
            {!searching && (
              <span
                className={cn(
                  'search-results__count',
                  hasHits ? 'search-results__count--hit' : 'search-results__count--empty'
                )}
              >
                {results.length}
              </span>
            )}
          </div>

          {searching ? (
            <CaseListSkeleton rows={4} />
          ) : hasHits ? (
            <CaseTable
              cases={results}
              title={t('search.titlePrefix', { query: activeQuery })}
              onSelect={setSelected}
              mobileStack={showBottomNav}
            />
          ) : (
            <div className="search-empty-state app-panel">
              <div className="search-empty-state__icon" aria-hidden>
                <Search weight="duotone" className="h-7 w-7" />
              </div>
              <p className="font-display text-base font-semibold text-foreground">
                {t('search.noResults')}
              </p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">{modeHint}</p>
            </div>
          )}
        </section>
      ) : null}

      {selected && (
        <HearingModal courtCase={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
