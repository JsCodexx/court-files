import React, { useEffect, useState } from 'react';
import { Scale } from 'lucide-react';
import { useCases } from '../context/CasesContext';
import { useLocale } from '../i18n/LocaleContext';
import { TranslationKey } from '../i18n/translations';
import { CourtCase } from '../types';
import { ApiError } from '../utils/api';
import { PersonPicker } from './PersonPicker';
import { Alert } from './ui/alert';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

interface Props {
  courtCase: CourtCase;
  open: boolean;
  onClose: () => void;
  onSaved?: (fresh: CourtCase) => void;
}

export function ChangeJudgeDialog({
  courtCase,
  open,
  onClose,
  onSaved,
}: Props) {
  const { updateCase, getCase } = useCases();
  const { t } = useLocale();
  const [judgePersonId, setJudgePersonId] = useState<string | null>(
    courtCase.judgePersonId ?? null
  );
  const [judgeName, setJudgeName] = useState(courtCase.judgeName);
  const [party1AdvocateId, setParty1AdvocateId] = useState<string | null>(
    courtCase.party1AdvocateId ?? null
  );
  const [party1Advocate, setParty1Advocate] = useState(
    courtCase.party1Advocate || ''
  );
  const [party2AdvocateId, setParty2AdvocateId] = useState<string | null>(
    courtCase.party2AdvocateId ?? null
  );
  const [party2Advocate, setParty2Advocate] = useState(
    courtCase.party2Advocate || ''
  );
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setJudgePersonId(courtCase.judgePersonId ?? null);
    setJudgeName(courtCase.judgeName);
    setParty1AdvocateId(courtCase.party1AdvocateId ?? null);
    setParty1Advocate(courtCase.party1Advocate || '');
    setParty2AdvocateId(courtCase.party2AdvocateId ?? null);
    setParty2Advocate(courtCase.party2Advocate || '');
    setError('');
  }, [open, courtCase]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!judgeName.trim()) {
      setError(t('validation.required'));
      return;
    }

    setSaving(true);
    setError('');
    try {
      await updateCase(courtCase.id, {
        judgePersonId,
        judgeName: judgeName.trim(),
        party1AdvocateId,
        party1Advocate: party1Advocate.trim(),
        party2AdvocateId,
        party2Advocate: party2Advocate.trim(),
      });
      const fresh = await getCase(courtCase.id);
      onSaved?.(fresh);
      onClose();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? t(err.errorKey as TranslationKey)
          : t('errors.saveFailed')
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="w-[min(480px,calc(100vw-1.25rem))]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            {t('judge.changeTitle')}
          </DialogTitle>
          <p className="urdu-text text-sm text-muted-foreground">
            <span dir="ltr">{courtCase.caseId}</span>
            {' · '}
            {courtCase.party1.name} {t('common.vs')} {courtCase.party2.name}
          </p>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          {error ? <Alert variant="destructive">{error}</Alert> : null}
          <p className="text-sm text-muted-foreground">{t('judge.changeLede')}</p>

          <PersonPicker
            role="judge"
            label={t('judge.new')}
            required
            personId={judgePersonId}
            name={judgeName}
            onChange={({ personId, name }) => {
              setJudgePersonId(personId);
              setJudgeName(name);
            }}
          />

          <PersonPicker
            role="advocate"
            label={t('addCase.party1Advocate')}
            personId={party1AdvocateId}
            name={party1Advocate}
            onChange={({ personId, name }) => {
              setParty1AdvocateId(personId);
              setParty1Advocate(name);
            }}
          />

          <PersonPicker
            role="advocate"
            label={t('addCase.party2Advocate')}
            personId={party2AdvocateId}
            name={party2Advocate}
            onChange={({ personId, name }) => {
              setParty2AdvocateId(personId);
              setParty2Advocate(name);
            }}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={saving}
            >
              {t('hearing.cancel')}
            </Button>
            <Button type="submit" disabled={saving}>
              {t('judge.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
