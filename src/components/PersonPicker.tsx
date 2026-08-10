import React, { useEffect, useMemo, useState } from 'react';
import { useLocale } from '../i18n/LocaleContext';
import { CasePerson, PersonRole } from '../types';
import { apiFetch } from '../utils/api';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

const NEW_VALUE = '__new__';

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
  const [persons, setPersons] = useState<CasePerson[]>([]);
  const [mode, setMode] = useState<'pick' | 'new'>(
    personId ? 'pick' : name ? 'new' : 'pick'
  );

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

  const selectValue = useMemo(() => {
    if (mode === 'new') return NEW_VALUE;
    if (personId) return personId;
    if (name) {
      const match = persons.find(
        (p) => p.name.trim().toLowerCase() === name.trim().toLowerCase()
      );
      return match?.id ?? NEW_VALUE;
    }
    return '';
  }, [mode, personId, name, persons]);

  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </Label>
      <Select
        value={selectValue || undefined}
        onValueChange={(v) => {
          if (v === NEW_VALUE) {
            setMode('new');
            onChange({ personId: null, name: '' });
            return;
          }
          const person = persons.find((p) => p.id === v);
          setMode('pick');
          onChange({
            personId: person?.id ?? null,
            name: person?.name ?? '',
          });
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder={t('persons.pick')} />
        </SelectTrigger>
        <SelectContent>
          {persons.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              <span className="urdu-text">{p.name}</span>
            </SelectItem>
          ))}
          <SelectItem value={NEW_VALUE}>{t('persons.addNew')}</SelectItem>
        </SelectContent>
      </Select>
      {mode === 'new' || selectValue === NEW_VALUE ? (
        <Input
          className="urdu-input"
          invalid={invalid}
          value={name}
          onChange={(e) =>
            onChange({ personId: null, name: e.target.value })
          }
          maxLength={100}
          dir="auto"
          lang="ur"
          placeholder={t('persons.newName')}
          aria-invalid={invalid}
        />
      ) : null}
    </div>
  );
}
