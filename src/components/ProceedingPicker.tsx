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
import { DEFAULT_PROCEEDING_LABELS } from '../constants/defaultProceedings';
import { apiFetch } from '../utils/api';
import { computePopoverPlacement } from '../lib/popoverPlacement';
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
  const [pos, setPos] = useState({
    top: 0,
    left: 0,
    width: 0,
    maxHeight: 224,
    openAbove: false,
  });

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

  const mergedItems = useMemo(() => {
    const byKey = new Map<string, ProceedingItem>();
    for (const label of DEFAULT_PROCEEDING_LABELS) {
      byKey.set(label.toLowerCase(), { id: `default:${label}`, label });
    }
    for (const item of items) {
      byKey.set(item.label.trim().toLowerCase(), item);
    }
    return [...byKey.values()].sort((a, b) =>
      a.label.localeCompare(b.label, undefined, { sensitivity: 'base' })
    );
  }, [items]);

  const q = query.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!q) return mergedItems;
    return mergedItems.filter((i) => i.label.toLowerCase().includes(q));
  }, [mergedItems, q]);

  const exact = useMemo(
    () => mergedItems.find((i) => i.label.toLowerCase() === q) ?? null,
    [mergedItems, q]
  );

  const pick = (item: ProceedingItem) => {
    onChange(item.label);
    setQuery(item.label);
    setOpen(false);
  };

  const saveNew = async () => {
    const n = query.trim();
    if (!n || saving) return;
    if (exact) {
      pick(exact);
      return;
    }
    setSaving(true);
    setOpen(true);
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
          disabled={saving}
          value={query}
          onChange={(e) => onInput(e.target.value)}
          onFocus={() => setOpen(true)}
          aria-busy={saving}
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
            className={PICKER_MENU_CLASS}
            style={{
              top: pos.top,
              left: pos.left,
              width: pos.width,
              maxHeight: pos.maxHeight,
              transform: pos.openAbove ? 'translateY(-100%)' : undefined,
            }}
          >
            {filtered.map((item) => (
              <li key={item.id} role="option" aria-selected={item.label === value}>
                <PickerOptionButton
                  selected={item.label === value}
                  disabled={saving}
                  onPick={() => pick(item)}
                >
                  <span className="urdu-text">{item.label}</span>
                </PickerOptionButton>
              </li>
            ))}
            {filtered.length === 0 && !showAdd ? (
              <li className="px-2 py-1.5 text-sm text-muted-foreground">
                {t('proceeding.empty')}
              </li>
            ) : null}
            {showAdd ? (
              <PickerAddOption
                saving={saving}
                saveLabel={t('proceeding.saveNew', { name: query.trim() })}
                onSave={() => void saveNew()}
              />
            ) : null}
          </ul>,
          document.body
        )}
    </div>
  );
}
