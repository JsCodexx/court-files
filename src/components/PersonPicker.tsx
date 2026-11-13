import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from './icons';
import { PickerAddOption } from './pickers/PickerAddOption';
import { PickerOptionButton } from './pickers/PickerOptionButton';
import {
  bindPickerOutsideClose,
  PICKER_MENU_CLASS,
} from './pickers/pickerShared';
import { useLocale } from '../i18n/LocaleContext';
import { CasePerson, PersonRole } from '../types';
import { apiFetch } from '../utils/api';
import {
  findByNormalizedName,
  formatPersonName,
  nameMatchesQuery,
} from '../utils/personName';
import { computePopoverPlacement } from '../lib/popoverPlacement';
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
  const [pos, setPos] = useState({
    top: 0,
    left: 0,
    width: 0,
    maxHeight: 224,
    openAbove: false,
  });

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
      const placement = computePopoverPlacement(r, {
        width: Math.max(r.width, 160),
      });
      setPos({
        top: placement.top,
        left: placement.left,
        width: placement.width,
        maxHeight: placement.maxHeight,
        openAbove: placement.openAbove,
      });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open]);

  useEffect(
    () => bindPickerOutsideClose(open, listId, wrapRef, () => setOpen(false)),
    [open, listId]
  );

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
    setOpen(true);
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
          disabled={saving}
          value={query}
          onChange={(e) => onInput(e.target.value)}
          onFocus={() => setOpen(true)}
          aria-busy={saving}
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
            className={PICKER_MENU_CLASS}
            style={{
              top: pos.top,
              left: pos.left,
              width: pos.width,
              maxHeight: pos.maxHeight,
              transform: pos.openAbove ? 'translateY(-100%)' : undefined,
            }}
          >
            {filtered.map((p) => (
              <li key={p.id} role="option" aria-selected={p.id === personId}>
                <PickerOptionButton
                  selected={p.id === personId}
                  disabled={saving}
                  onPick={() => pick(p)}
                >
                  <span className="urdu-text">{p.name}</span>
                </PickerOptionButton>
              </li>
            ))}
            {filtered.length === 0 && !showAdd ? (
              <li className="px-2 py-1.5 text-sm text-muted-foreground">
                {t('persons.empty')}
              </li>
            ) : null}
            {showAdd ? (
              <PickerAddOption
                saving={saving}
                saveLabel={t('persons.saveNew', { name: query.trim() })}
                onSave={() => void saveNew()}
              />
            ) : null}
          </ul>,
          document.body
        )}
    </div>
  );
}
