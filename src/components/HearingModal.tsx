import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCases } from '../context/CasesContext';
import { useLocale } from '../i18n/LocaleContext';
import { TranslationKey } from '../i18n/translations';
import { cn } from '../lib/utils';
import { CaseStatus, CourtCase } from '../types';
import {
  formatDisplayDate,
  isSunday,
  nextWorkingDayISO,
  todayISO,
} from '../utils/dates';
import { getLatestHearing, isHearingEditable } from '../utils/hearings';
import { ApiError } from '../utils/api';
import { Alert } from './ui/alert';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { ProceedingPicker } from './ProceedingPicker';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

interface Props {
  courtCase: CourtCase;
  onClose: () => void;
}

const STATUSES: CaseStatus[] = ['pending', 'decided', 'party_left'];

function statusLabelKey(s: CaseStatus): TranslationKey {
  if (s === 'decided') return 'status.decided';
  if (s === 'party_left') return 'status.partyLeft';
  return 'status.pending';
}

export function HearingModal({ courtCase, onClose }: Props) {
  const { addHearing, updateCase, deleteCase, getCase } = useCases();
  const { t } = useLocale();
  const [current, setCurrent] = useState<CourtCase>(courtCase);
  const [status, setStatus] = useState<CaseStatus>(courtCase.status || 'pending');
  const [statusRemarks, setStatusRemarks] = useState(
    courtCase.statusRemarks || ''
  );
  const [date, setDate] = useState(nextWorkingDayISO());
  const [proceeding, setProceeding] = useState('');
  const [adjournmentReason, setAdjournmentReason] = useState('');
  const [shortOrder, setShortOrder] = useState('');
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    getCase(courtCase.id)
      .then((fresh) => {
        if (!alive) return;
        setCurrent(fresh);
        setStatus(fresh.status || 'pending');
        setStatusRemarks(fresh.statusRemarks || '');
        const latest = getLatestHearing(fresh.hearings);
        if (latest && isHearingEditable(latest.createdAt)) {
          setDate(latest.date || nextWorkingDayISO());
          setProceeding(latest.proceeding || '');
          setAdjournmentReason(latest.adjournmentReason || '');
          setShortOrder(latest.shortOrder || '');
          setRemarks(latest.remarks || '');
        }
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

  const latestHearing = getLatestHearing(current.hearings);
  const latestEditable = latestHearing
    ? isHearingEditable(latestHearing.createdAt)
    : false;
  const today = todayISO();
  const scheduleLocked =
    Boolean(latestHearing) &&
    !latestEditable &&
    Boolean(current.nextDate) &&
    today < current.nextDate;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (status === 'decided') {
      if (!statusRemarks.trim()) {
        setError(t('hearing.decidedRemarksRequired'));
        return;
      }
      setSaving(true);
      try {
        await updateCase(current.id, {
          status: 'decided',
          statusRemarks: statusRemarks.trim(),
        });
        onClose();
      } catch {
        setError(t('errors.saveFailed'));
        setSaving(false);
      }
      return;
    }

    if (status === 'party_left') {
      setSaving(true);
      try {
        await updateCase(current.id, {
          status: 'party_left',
          statusRemarks: statusRemarks.trim(),
        });
        onClose();
      } catch {
        setError(t('errors.saveFailed'));
        setSaving(false);
      }
      return;
    }

    if (scheduleLocked) {
      setError(
        t('hearing.lockedUntilDate', {
          date: formatDisplayDate(current.nextDate, monthLabel),
        })
      );
      return;
    }

    if (!proceeding.trim()) {
      setError(t('hearing.proceedingRequired'));
      return;
    }
    if (isSunday(date)) {
      setError(t('validation.sunday'));
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

  const submitLabel =
    status === 'decided'
      ? t('hearing.markDecided')
      : status === 'party_left'
        ? t('hearing.markPartyLeft')
        : t('hearing.save');

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
                <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                  {h.judgeName ? (
                    <div className="urdu-text">
                      {t('history.judge')}: {h.judgeName}
                    </div>
                  ) : null}
                  {h.party1Advocate ? (
                    <div className="urdu-text">
                      {t('history.advP1')}: {h.party1Advocate}
                    </div>
                  ) : null}
                  {h.party2Advocate ? (
                    <div className="urdu-text">
                      {t('history.advP2')}: {h.party2Advocate}
                    </div>
                  ) : null}
                </div>
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
          {status === 'pending' && latestEditable ? (
            <Alert>{t('hearing.correctionWindow')}</Alert>
          ) : null}
          {status === 'pending' && scheduleLocked ? (
            <Alert variant="destructive">
              {t('hearing.lockedUntilDate', {
                date: formatDisplayDate(current.nextDate, monthLabel),
              })}
            </Alert>
          ) : null}

          <div>
            <Label>{t('hearing.status')}</Label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setStatus(s);
                    setError('');
                  }}
                  aria-pressed={status === s}
                  className={cn(
                    'rounded-md border px-3 py-2.5 text-sm font-semibold transition-colors',
                    status === s
                      ? s === 'decided'
                        ? 'border-success bg-success text-success-foreground'
                        : s === 'party_left'
                          ? 'border-destructive bg-destructive text-destructive-foreground'
                          : 'border-primary bg-primary text-primary-foreground'
                      : 'border-input bg-card text-muted-foreground hover:border-primary/60 hover:text-foreground'
                  )}
                >
                  {t(statusLabelKey(s))}
                </button>
              ))}
            </div>
          </div>

          {status === 'decided' && (
            <div className="space-y-3">
              <Alert variant="success">{t('hearing.decidedNote')}</Alert>
              <div>
                <Label>
                  {t('hearing.statusRemarks')}{' '}
                  <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  className="urdu-input"
                  value={statusRemarks}
                  onChange={(e) => setStatusRemarks(e.target.value)}
                  placeholder={t('hearing.decidedRemarksPh')}
                  required
                  dir="auto"
                  lang="ur"
                />
              </div>
            </div>
          )}

          {status === 'party_left' && (
            <div className="space-y-3">
              <Alert variant="destructive">{t('hearing.partyLeftNote')}</Alert>
              <div>
                <Label>{t('hearing.statusRemarks')}</Label>
                <Textarea
                  className="urdu-input"
                  value={statusRemarks}
                  onChange={(e) => setStatusRemarks(e.target.value)}
                  placeholder={t('hearing.partyLeftRemarksPh')}
                  dir="auto"
                  lang="ur"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  {t('hearing.partyLeftRemarksHint')}
                </p>
              </div>
            </div>
          )}

          {status === 'pending' && !scheduleLocked && (
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
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value && isSunday(value)) {
                      setError(t('validation.sunday'));
                      return;
                    }
                    setError('');
                    setDate(value);
                  }}
                  required
                  dir="ltr"
                />
              </div>
              <div className="sm:col-span-2">
                <ProceedingPicker
                  label={t('hearing.proceeding')}
                  required
                  value={proceeding}
                  onChange={setProceeding}
                  placeholder={t('hearing.proceedingPh')}
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
            <Button
              type="submit"
              disabled={saving || (status === 'pending' && scheduleLocked)}
            >
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
