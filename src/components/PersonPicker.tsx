import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Plus } from 'lucide-react';
import { useLocale } from '../i18n/LocaleContext';
import { CasePerson, PersonRole } from '../types';
import { apiFetch } from '../utils/api';
import {
  findByNormalizedName,
  formatPersonName,
  nameMatchesQuery,
} from '../utils/personName';
import { cn } from '../lib/utils';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface Props {
  role: PersonRole;
  label: string;
  required?: boolean;
  personId: string | null;
  name: string;
  onChange: (next: { personId: string | null; name: string }) => void;
  invalid?: boolean;
}

export function PersonPicker({
  role,
  label,
  required,
  personId,
  name,
  onChange,
  invalid,
}: Props) {
  const { t } = useLocale();
  const listId = React.useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [persons, setPersons] = useState<CasePerson[]>([]);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(name);
  const [saving, setSaving] = useState(false);
  const [dupHint, setDupHint] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    let alive = true;
    apiFetch<{ ok: true; persons: CasePerson[] }>(
      `/persons?role=${encodeURIComponent(role)}`
    )
      .then((res) => {
        if (alive) setPersons(res.persons);
      })
      .catch(() => {
        /* keep empty */
      });
    return () => {
      alive = false;
    };
  }, [role]);

  useEffect(() => {
    setQuery(name);
  }, [name]);

  useEffect(() => {
    if (!open) return;
    const place = () => {
      const el = wrapRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setPos({ top: r.bottom + 4, left: r.left, width: r.width });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node;
      if (wrapRef.current?.contains(target)) return;
      const pop = document.getElementById(listId);
      if (pop?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open, listId]);

  const filtered = useMemo(() => {
    if (!query.trim()) return persons;
    return persons.filter((p) => nameMatchesQuery(p.name, query));
  }, [persons, query]);

  const exact = useMemo(
    () => findByNormalizedName(persons, query) ?? null,
    [persons, query]
  );

  const pick = (person: CasePerson) => {
    onChange({ personId: person.id, name: person.name });
    setQuery(person.name);
    setDupHint(false);
    setOpen(false);
  };

  const saveNew = async () => {
    const n = formatPersonName(query);
    if (!n || saving) return;
    const existing = findByNormalizedName(persons, n);
    if (existing) {
      pick(existing);
      setDupHint(true);
      return;
    }
    setSaving(true);
    try {
      const res = await apiFetch<{ ok: true; person: CasePerson }>('/persons', {
        method: 'POST',
        body: { name: n, role },
      });
      setPersons((prev) => {
        if (prev.some((p) => p.id === res.person.id)) return prev;
        return [...prev, res.person].sort((a, b) =>
          a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
        );
      });
      setDupHint(false);
      pick(res.person);
    } catch {
      onChange({ personId: null, name: n });
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const onInput = (value: string) => {
    setQuery(value);
    setOpen(true);
    const match = findByNormalizedName(persons, value);
    setDupHint(Boolean(formatPersonName(value) && match));
    onChange({
      personId: match?.id ?? null,
      name: value,
    });
  };

  const showAdd = Boolean(query.trim()) && !exact;

  return (
    <div className="space-y-1.5" ref={wrapRef}>
      <Label>
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </Label>
      <div className="relative">
        <Input
          ref={inputRef}
          className="urdu-input pe-9"
          invalid={invalid}
          value={query}
          onChange={(e) => onInput(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setOpen(false);
              return;
            }
            if (e.key === 'Enter') {
              e.preventDefault();
              if (exact) pick(exact);
              else if (showAdd) void saveNew();
            }
          }}
          maxLength={100}
          dir="auto"
          lang="ur"
          placeholder={t('persons.search')}
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-invalid={invalid}
        />
        <button
          type="button"
          tabIndex={-1}
          className="absolute end-2 top-1/2 -translate-y-1/2 text-muted-foreground"
          onClick={() => {
            setOpen((v) => !v);
            inputRef.current?.focus();
          }}
          aria-label={t('persons.pick')}
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>
      <p className="text-[11px] text-muted-foreground">
        {dupHint ? t('persons.alreadySaved') : t('persons.privateHint')}
      </p>

      {open &&
        createPortal(
          <ul
            id={listId}
            role="listbox"
            className="fixed z-[80] max-h-56 overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
            style={{
              top: pos.top,
              left: pos.left,
              width: Math.max(pos.width, 160),
            }}
          >
            {filtered.map((p) => (
              <li key={p.id} role="option" aria-selected={p.id === personId}>
                <button
                  type="button"
                  className={cn(
                    'flex w-full rounded-sm px-2 py-1.5 text-start text-sm hover:bg-accent hover:text-accent-foreground',
                    p.id === personId && 'bg-accent'
                  )}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(p)}
                >
                  <span className="urdu-text">{p.name}</span>
                </button>
              </li>
            ))}
            {filtered.length === 0 && !showAdd ? (
              <li className="px-2 py-1.5 text-sm text-muted-foreground">
                {t('persons.empty')}
              </li>
            ) : null}
            {showAdd ? (
              <li role="option" aria-selected={false}>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-start text-sm text-primary hover:bg-accent"
                  disabled={saving}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => void saveNew()}
                >
                  <Plus className="h-3.5 w-3.5 shrink-0" />
                  {t('persons.saveNew', { name: query.trim() })}
                </button>
              </li>
            ) : null}
          </ul>,
          document.body
        )}
    </div>
  );
}
