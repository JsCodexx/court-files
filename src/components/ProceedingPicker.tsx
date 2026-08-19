import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Plus } from 'lucide-react';
import { useLocale } from '../i18n/LocaleContext';
import { apiFetch } from '../utils/api';
import { cn } from '../lib/utils';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface ProceedingItem {
  id: string;
  label: string;
}

interface Props {
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  placeholder?: string;
}

export function ProceedingPicker({
  label: fieldLabel,
  required,
  value,
  onChange,
  invalid,
  placeholder,
}: Props) {
  const { t } = useLocale();
  const listId = React.useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<ProceedingItem[]>([]);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const [saving, setSaving] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    let alive = true;
    apiFetch<{ ok: true; proceedings: ProceedingItem[] }>('/proceedings')
      .then((res) => {
        if (alive) setItems(res.proceedings);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  useEffect(() => { setQuery(value); }, [value]);

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

  const q = query.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!q) return items;
    return items.filter((i) => i.label.toLowerCase().includes(q));
  }, [items, q]);

  const exact = useMemo(
    () => items.find((i) => i.label.toLowerCase() === q) ?? null,
    [items, q]
  );

  const pick = (item: ProceedingItem) => {
    onChange(item.label);
    setQuery(item.label);
    setOpen(false);
  };

  const saveNew = async () => {
    const n = query.trim();
    if (!n || saving) return;
    if (exact) { pick(exact); return; }
    setSaving(true);
    try {
      const res = await apiFetch<{ ok: true; proceeding: ProceedingItem }>(
        '/proceedings',
        { method: 'POST', body: { label: n } }
      );
      setItems((prev) => {
        if (prev.some((i) => i.id === res.proceeding.id)) return prev;
        return [...prev, res.proceeding].sort((a, b) =>
          a.label.localeCompare(b.label, undefined, { sensitivity: 'base' })
        );
      });
      pick(res.proceeding);
    } catch {
      onChange(n);
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const onInput = (v: string) => {
    setQuery(v);
    setOpen(true);
    onChange(v);
  };

  const showAdd = Boolean(query.trim()) && !exact;

  return (
    <div className="space-y-1" ref={wrapRef}>
      <Label>
        {fieldLabel}
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
            if (e.key === 'Escape') { setOpen(false); return; }
            if (e.key === 'Enter') {
              e.preventDefault();
              if (exact) pick(exact);
              else if (showAdd) void saveNew();
            }
          }}
          maxLength={200}
          dir="auto"
          lang="ur"
          placeholder={placeholder}
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
          onClick={() => { setOpen((v) => !v); inputRef.current?.focus(); }}
          aria-label={t('proceeding.pickLabel')}
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      {open &&
        createPortal(
          <ul
            id={listId}
            role="listbox"
            className="fixed z-[80] max-h-56 overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
            style={{ top: pos.top, left: pos.left, width: Math.max(pos.width, 160) }}
          >
            {filtered.map((item) => (
              <li key={item.id} role="option" aria-selected={item.label === value}>
                <button
                  type="button"
                  className={cn(
                    'flex w-full rounded-sm px-2 py-1.5 text-start text-sm hover:bg-accent hover:text-accent-foreground',
                    item.label === value && 'bg-accent'
                  )}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(item)}
                >
                  <span className="urdu-text">{item.label}</span>
                </button>
              </li>
            ))}
            {filtered.length === 0 && !showAdd ? (
              <li className="px-2 py-1.5 text-sm text-muted-foreground">
                {t('proceeding.empty')}
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
                  {t('proceeding.saveNew', { name: query.trim() })}
                </button>
              </li>
            ) : null}
          </ul>,
          document.body
        )}
    </div>
  );
}
