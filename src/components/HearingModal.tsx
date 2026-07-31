import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCases } from '../context/CasesContext';
import { useLocale } from '../i18n/LocaleContext';
import { TranslationKey } from '../i18n/translations';
import { cn } from '../lib/utils';
import { CaseStatus, CourtCase } from '../types';
import { formatDisplayDate, todayISO } from '../utils/dates';
import { Alert } from './ui/alert';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

interface Props {
  courtCase: CourtCase;
  onClose: () => void;
}

export function HearingModal({ courtCase, onClose }: Props) {
  const { addHearing, updateCase, deleteCase, getCase } = useCases();
  const { t } = useLocale();
  const [current, setCurrent] = useState<CourtCase>(courtCase);
  const [status, setStatus] = useState<CaseStatus>('pending');
  const [date, setDate] = useState(todayISO());
  const [proceeding, setProceeding] = useState('');
  const [adjournmentReason, setAdjournmentReason] = useState('');
  const [shortOrder, setShortOrder] = useState('');
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Load the latest case data (including full hearing history) from the server
  useEffect(() => {
    let alive = true;
    getCase(courtCase.id)
      .then((fresh) => {
        if (alive) setCurrent(fresh);
      })
      .catch(() => {
        /* fall back to the case passed in */
      });
    return () => {
      alive = false;
    };
  }, [courtCase.id, getCase]);

  const monthLabel = (index: number, short?: boolean) =>
    t((short ? `monthShort.${index}` : `month.${index}`) as TranslationKey);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Decided: close the case, no next date or proceeding needed
    if (status === 'decided') {
      setSaving(true);
      try {
        await updateCase(current.id, { status: 'decided' });
        onClose();
      } catch {
        setError(t('errors.saveFailed'));
        setSaving(false);
      }
      return;
    }

    if (!proceeding.trim()) {
      setError(t('hearing.proceedingRequired'));
      return;
    }
    setSaving(true);
    try {
      await addHearing(current.id, {
        date,
        proceeding: proceeding.trim(),
        adjournmentReason: adjournmentReason.trim(),
        shortOrder: shortOrder.trim(),
        remarks: remarks.trim(),
      });
      onClose();
    } catch {
      setError(t('errors.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!window.confirm(t('hearing.deleteConfirm'))) return;
    setSaving(true);
    try {
      await deleteCase(current.id);
      onClose();
    } catch {
      setError(t('errors.saveFailed'));
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('hearing.title')}</DialogTitle>
          <p className="urdu-text text-sm text-muted-foreground">
            <span dir="ltr">{current.caseId}</span>
            {' · '}
            {current.party1.name} {t('common.vs')} {current.party2.name}
          </p>
        </DialogHeader>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {t('hearing.history')}
            </h3>
            <Link
              to={`/cases/${current.id}/history`}
              className="text-sm font-semibold text-primary hover:underline"
              onClick={onClose}
            >
              {t('hearing.viewHistory')}
            </Link>
          </div>
          <ul className="max-h-52 space-y-2 overflow-y-auto">
            {current.hearings.map((h) => (
              <li
                key={h.id}
                className="rounded-md border bg-muted/40 px-3 py-2 text-sm"
              >
                <strong dir="ltr">{formatDisplayDate(h.date, monthLabel)}</strong>
                <div className="urdu-text">{h.proceeding}</div>
                {h.remarks ? (
                  <div className="urdu-text text-xs text-muted-foreground">
                    {h.remarks}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {error && <Alert variant="destructive">{error}</Alert>}

          <div>
            <Label>{t('hearing.status')}</Label>
            <div className="grid grid-cols-2 gap-2">
              {(['pending', 'decided'] as CaseStatus[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  aria-pressed={status === s}
                  className={cn(
                    'rounded-md border px-4 py-2.5 text-sm font-semibold transition-colors',
                    status === s
                      ? s === 'decided'
                        ? 'border-success bg-success text-success-foreground'
                        : 'border-primary bg-primary text-primary-foreground'
                      : 'border-input bg-card text-muted-foreground hover:border-primary/60 hover:text-foreground'
                  )}
                >
                  {t(s === 'pending' ? 'status.pending' : 'status.decided')}
                </button>
              ))}
            </div>
          </div>

          {status === 'decided' ? (
            <Alert variant="success">{t('hearing.decidedNote')}</Alert>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>
                  {t('hearing.nextDate')}{' '}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="date"
                  value={date}
                  min={todayISO()}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  dir="ltr"
                />
              </div>
              <div className="sm:col-span-2">
                <Label>
                  {t('hearing.proceeding')}{' '}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  className="urdu-input"
                  value={proceeding}
                  onChange={(e) => setProceeding(e.target.value)}
                  placeholder={t('hearing.proceedingPh')}
                  required
                  dir="auto"
                  lang="ur"
                />
              </div>
              <div className="sm:col-span-2">
                <Label>{t('hearing.adjournment')}</Label>
                <Input
                  className="urdu-input"
                  value={adjournmentReason}
                  onChange={(e) => setAdjournmentReason(e.target.value)}
                  placeholder={t('hearing.adjournmentPh')}
                  maxLength={500}
                  dir="auto"
                  lang="ur"
                />
              </div>
              <div className="sm:col-span-2">
                <Label>{t('hearing.shortOrder')}</Label>
                <Input
                  className="urdu-input"
                  value={shortOrder}
                  onChange={(e) => setShortOrder(e.target.value)}
                  placeholder={t('hearing.shortOrderPh')}
                  maxLength={500}
                  dir="auto"
                  lang="ur"
                />
              </div>
              <div className="sm:col-span-2">
                <Label>{t('hearing.remarks')}</Label>
                <Textarea
                  className="urdu-input"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder={t('hearing.remarksPh')}
                  dir="auto"
                  lang="ur"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="destructive"
              onClick={onDelete}
              disabled={saving}
              className="me-auto"
            >
              {t('hearing.delete')}
            </Button>
            <Button type="button" variant="secondary" onClick={onClose}>
              {t('hearing.cancel')}
            </Button>
            <Button type="submit" disabled={saving}>
              {t(status === 'decided' ? 'hearing.markDecided' : 'hearing.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
