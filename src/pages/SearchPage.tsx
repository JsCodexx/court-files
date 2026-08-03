import React, { useEffect, useState } from 'react';
import { CaseTable } from '../components/CaseTable';
import { HearingModal } from '../components/HearingModal';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { SearchMode, useCases } from '../context/CasesContext';
import { useLocale } from '../i18n/LocaleContext';
import { CourtCase } from '../types';

export function SearchPage() {
  const { searchCases, version } = useCases();
  const { t } = useLocale();
  const [mode, setMode] = useState<SearchMode>('name');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CourtCase[]>([]);
  const [selected, setSelected] = useState<CourtCase | null>(null);

  // Debounced server-side search
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      return;
    }
    let alive = true;
    const timer = setTimeout(() => {
      searchCases(q, mode)
        .then((list) => {
          if (alive) setResults(list);
        })
        .catch(() => {
          if (alive) setResults([]);
        });
    }, 300);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [query, mode, searchCases, version]);

  const placeholder =
    mode === 'name'
      ? t('search.phName')
      : mode === 'caseId'
        ? t('search.phCaseId')
        : t('search.phIdCard');

  const modes: { key: SearchMode; label: string }[] = [
    { key: 'name', label: t('search.byName') },
    { key: 'caseId', label: t('search.byCaseId') },
    { key: 'idCard', label: t('search.byIdCard') },
  ];

  return (
    <div className="animate-rise-in space-y-6">
      <div>
        <h1 className="page-title">
          {t('search.title')}
        </h1>
        <p className="page-lede">{t('search.lede')}</p>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex flex-wrap gap-2">
            {modes.map((m) => (
              <Button
                key={m.key}
                type="button"
                size="sm"
                variant={mode === m.key ? 'default' : 'outline'}
                onClick={() => setMode(m.key)}
              >
                {m.label}
              </Button>
            ))}
          </div>
          <div>
            <Label>{t('search.label')}</Label>
            <Input
              className={mode === 'name' ? 'urdu-input' : undefined}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              autoFocus
              dir={mode === 'name' ? 'auto' : 'ltr'}
              lang={mode === 'name' ? 'ur' : undefined}
            />
          </div>
        </CardContent>
      </Card>

      {query.trim() ? (
        <div className="space-y-3">
          <h2 className="font-display text-xl font-semibold">
            {t('search.results', { count: results.length })}
          </h2>
          <CaseTable
            cases={results}
            title={t('search.titlePrefix', { query })}
            onSelect={setSelected}
          />
        </div>
      ) : (
        <Card className="p-10 text-center text-sm text-muted-foreground">
          {t('search.empty')}
        </Card>
      )}

      {selected && (
        <HearingModal courtCase={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
