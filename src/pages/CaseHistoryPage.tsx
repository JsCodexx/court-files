import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Pencil, Plus, Scale, Trash2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { HearingModal } from '../components/HearingModal';
import { CaseStatusBadge } from '../components/CaseStatusBadge';
import { ChangeJudgeDialog } from '../components/ChangeJudgeDialog';
import { Alert } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Textarea } from '../components/ui/textarea';
import { useCases } from '../context/CasesContext';
import { useLocale } from '../i18n/LocaleContext';
import { TranslationKey } from '../i18n/translations';
import { CourtCase, HearingRecord } from '../types';
import { formatDisplayDate, isSunday } from '../utils/dates';
import { isHearingEditable } from '../utils/hearings';
import { ApiError } from '../utils/api';

const PAGE_SIZES = [10, 25, 50];

interface EditState {
  hearing: HearingRecord;
  date: string;
  proceeding: string;
  adjournmentReason: string;
  shortOrder: string;
  remarks: string;
}

export function CaseHistoryPage() {
  const { id } = useParams<{ id: string }>();
  const { getCase, updateHearing, deleteHearing, version } = useCases();
  const { t } = useLocale();

  const [courtCase, setCourtCase] = useState<CourtCase | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(1);
  const [edit, setEdit] = useState<EditState | null>(null);
  const [saving, setSaving] = useState(false);
  const [adding, setAdding] = useState(false);
  const [changeJudgeOpen, setChangeJudgeOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    let alive = true;
    getCase(id)
      .then((c) => {
        if (alive) {
          setCourtCase(c);
          setNotFound(false);
        }
      })
      .catch(() => {
        if (alive) setNotFound(true);
      });
    return () => {
      alive = false;
    };
  }, [id, getCase, version]);

  const monthLabel = (index: number, short?: boolean) =>
    t((short ? `monthShort.${index}` : `month.${index}`) as TranslationKey);

  const nil = t('history.nil');
  const hearings = useMemo(() => {
    const list = courtCase?.hearings ?? [];
    const q = query.trim().toLowerCase();
    const filtered = q
      ? list.filter((h) =>
          [h.proceeding, h.adjournmentReason, h.shortOrder, h.remarks, h.date]
            .filter(Boolean)
            .some((v) => String(v).toLowerCase().includes(q))
        )
      : list;
    return [...filtered].sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [courtCase, query]);

  const totalPages = Math.max(1, Math.ceil(hearings.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = hearings.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );
  const from = hearings.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const to = Math.min(safePage * pageSize, hearings.length);

  const onDelete = async (hearingId: string, createdAt: string) => {
    if (!courtCase) return;
    if (!isHearingEditable(createdAt)) {
      setError(t('hearing.editLocked'));
      return;
    }
    if (!window.confirm(t('history.deleteConfirm'))) return;
    setError('');
    try {
      const fresh = await deleteHearing(courtCase.id, hearingId);
      setCourtCase(fresh);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? t(err.errorKey as TranslationKey)
          : t('errors.saveFailed')
      );
    }
  };

  const openEdit = (h: HearingRecord) => {
    if (!isHearingEditable(h.createdAt)) {
      setError(t('hearing.editLocked'));
      return;
    }
    setEdit({
      hearing: h,
      date: h.date,
      proceeding: h.proceeding,
      adjournmentReason: h.adjournmentReason ?? '',
      shortOrder: h.shortOrder ?? '',
      remarks: h.remarks ?? '',
    });
  };

  const onSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courtCase || !edit) return;
    setError('');
    if (isSunday(edit.date)) {
      setError(t('validation.sunday'));
      return;
    }
    setSaving(true);
    try {
      const fresh = await updateHearing(courtCase.id, edit.hearing.id, {
        date: edit.date,
        proceeding: edit.proceeding.trim(),
        adjournmentReason: edit.adjournmentReason.trim(),
        shortOrder: edit.shortOrder.trim(),
        remarks: edit.remarks.trim(),
      });
      setCourtCase(fresh);
      setEdit(null);
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

  if (notFound) {
    return (
      <div className="animate-rise-in space-y-4">
        <Alert variant="destructive">{t('history.notFound')}</Alert>
        <Button asChild variant="secondary">
          <Link to="/dashboard">
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            {t('history.back')}
          </Link>
        </Button>
      </div>
    );
  }

  if (!courtCase) {
    return (
      <div className="p-10 text-center text-sm text-muted-foreground">
        {t('common.dash')}
      </div>
    );
  }

  const parties = [
    {
      key: 'history.party1',
      name: courtCase.party1.name,
      idCard: courtCase.party1.idCard,
      phone: courtCase.party1.phone,
    },
    {
      key: 'history.party2',
      name: courtCase.party2.name,
      idCard: courtCase.party2.idCard,
      phone: courtCase.party2.phone,
    },
    ...(courtCase.client.name
      ? [
          {
            key: 'history.client',
            name: courtCase.client.name,
            idCard: '',
            phone: courtCase.client.phone,
          },
        ]
      : []),
  ];

  return (
    <div className="animate-rise-in space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h1 className="page-title">{t('history.title')}</h1>
            <CaseStatusBadge status={courtCase.status} alwaysShow />
          </div>
          <p className="urdu-text mt-1 text-sm text-muted-foreground">
            <span dir="ltr" className="font-semibold">
              {courtCase.caseId}
            </span>
            {' · '}
            {courtCase.party1.name} {t('common.vs')} {courtCase.party2.name}
            {' · '}
            {t(`category.${courtCase.category}` as TranslationKey)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
              {t('history.back')}
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/cases/${courtCase.id}/edit`}>
              <Pencil className="h-4 w-4" />
              {t('addCase.edit')}
            </Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setChangeJudgeOpen(true)}
          >
            <Scale className="h-4 w-4" />
            {t('judge.change')}
          </Button>
          <Button size="sm" onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4" />
            {t('history.addHearing')}
          </Button>
        </div>
      </div>

      {error && <Alert variant="destructive">{error}</Alert>}

      <ChangeJudgeDialog
        courtCase={courtCase}
        open={changeJudgeOpen}
        onClose={() => setChangeJudgeOpen(false)}
        onSaved={setCourtCase}
      />

      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-muted/40 py-4">
          <CardTitle className="text-lg">{t('history.parties')}</CardTitle>
        </CardHeader>
        <Table className="min-w-[560px]">
          <TableHeader>
            <TableRow>
              <TableHead>{t('history.party')}</TableHead>
              <TableHead>{t('history.name')}</TableHead>
              <TableHead>{t('history.idCard')}</TableHead>
              <TableHead>{t('history.mobile')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {parties.map((p) => (
              <TableRow key={p.key}>
                <TableCell className="font-medium">
                  {t(p.key as TranslationKey)}
                </TableCell>
                <TableCell className="urdu-text">{p.name}</TableCell>
                <TableCell dir="ltr">{p.idCard || nil}</TableCell>
                <TableCell dir="ltr">{p.phone || nil}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-muted/40 py-4">
          <CardTitle className="text-lg">{t('history.benchTitle')}</CardTitle>
        </CardHeader>
        <Table className="min-w-[560px]">
          <TableHeader>
            <TableRow>
              <TableHead>{t('history.benchFrom')}</TableHead>
              <TableHead>{t('history.judge')}</TableHead>
              <TableHead>{t('history.advP1')}</TableHead>
              <TableHead>{t('history.advP2')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(courtCase.benchHistory ?? []).length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-8 text-center text-muted-foreground"
                >
                  {t('history.empty')}
                </TableCell>
              </TableRow>
            ) : (
              (courtCase.benchHistory ?? []).map((b) => (
                <TableRow key={b.id}>
                  <TableCell dir="ltr" className="whitespace-nowrap font-medium">
                    {formatDisplayDate(b.effectiveFrom.slice(0, 10), monthLabel)}
                  </TableCell>
                  <TableCell className="urdu-text">
                    {b.judgeName || nil}
                  </TableCell>
                  <TableCell className="urdu-text">
                    {b.party1Advocate || nil}
                  </TableCell>
                  <TableCell className="urdu-text">
                    {b.party2Advocate || nil}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-muted/40 py-4">
          <CardTitle className="text-lg">{t('history.title')}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{t('history.show')}</span>
              <Select
                value={String(pageSize)}
                onValueChange={(v) => {
                  setPageSize(Number(v));
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-8 w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZES.map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span>{t('history.entries')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Label className="mb-0 whitespace-nowrap">
                {t('history.search')}
              </Label>
              <Input
                className="h-8 w-56"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder={t('history.searchPh')}
                dir="auto"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('history.nextDate')}</TableHead>
                <TableHead>{t('history.judge')}</TableHead>
                <TableHead>{t('history.advP1')}</TableHead>
                <TableHead>{t('history.advP2')}</TableHead>
                <TableHead>{t('history.stage')}</TableHead>
                <TableHead>{t('history.adjournment')}</TableHead>
                <TableHead>{t('history.shortOrder')}</TableHead>
                <TableHead>{t('history.remarks')}</TableHead>
                <TableHead className="text-end">
                  {t('history.actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="py-10 text-center text-muted-foreground"
                  >
                    {t('history.empty')}
                  </TableCell>
                </TableRow>
              ) : (
                pageRows.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell dir="ltr" className="whitespace-nowrap font-medium">
                      {formatDisplayDate(h.date, monthLabel)}
                    </TableCell>
                    <TableCell className="urdu-text">
                      {h.judgeName || nil}
                    </TableCell>
                    <TableCell className="urdu-text">
                      {h.party1Advocate || nil}
                    </TableCell>
                    <TableCell className="urdu-text">
                      {h.party2Advocate || nil}
                    </TableCell>
                    <TableCell className="urdu-text">{h.proceeding}</TableCell>
                    <TableCell className="urdu-text">
                      {h.adjournmentReason || nil}
                    </TableCell>
                    <TableCell className="urdu-text">
                      {h.shortOrder || nil}
                    </TableCell>
                    <TableCell className="urdu-text">
                      {h.remarks || nil}
                    </TableCell>
                    <TableCell className="text-end">
                      <div className="inline-flex gap-1.5">
                        {(() => {
                          const editable = isHearingEditable(h.createdAt);
                          return (
                            <>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                disabled={!editable}
                                className="h-8 w-8 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground disabled:opacity-40"
                                onClick={() => openEdit(h)}
                                aria-label={
                                  editable
                                    ? t('history.edit')
                                    : t('history.editLocked')
                                }
                                title={
                                  editable
                                    ? t('history.edit')
                                    : t('history.editLocked')
                                }
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                disabled={!editable}
                                className="h-8 w-8 rounded-full bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground disabled:opacity-40"
                                onClick={() => onDelete(h.id, h.createdAt)}
                                aria-label={
                                  editable
                                    ? t('history.deleteHearing')
                                    : t('history.editLocked')
                                }
                                title={
                                  editable
                                    ? t('history.deleteHearing')
                                    : t('history.editLocked')
                                }
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          );
                        })()}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 text-sm text-muted-foreground">
            <span>
              {t('history.showing', {
                from,
                to,
                total: hearings.length,
              })}
            </span>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                {t('history.prev')}
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <Button
                  key={n}
                  type="button"
                  size="sm"
                  variant={n === safePage ? 'default' : 'outline'}
                  onClick={() => setPage(n)}
                >
                  {n}
                </Button>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                {t('history.next')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {adding && (
        <HearingModal
          courtCase={courtCase}
          onClose={() => setAdding(false)}
        />
      )}

      {edit && (
        <Dialog open onOpenChange={(isOpen) => !isOpen && setEdit(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('history.edit')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={onSaveEdit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>
                    {t('history.nextDate')}{' '}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={edit.date}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value && isSunday(value)) {
                        setError(t('validation.sunday'));
                        return;
                      }
                      setError('');
                      setEdit((prev) =>
                        prev ? { ...prev, date: value } : prev
                      );
                    }}
                    required
                    dir="ltr"
                  />
                </div>
                <div>
                  <Label>
                    {t('history.stage')}{' '}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    className="urdu-input"
                    value={edit.proceeding}
                    onChange={(e) =>
                      setEdit((prev) =>
                        prev ? { ...prev, proceeding: e.target.value } : prev
                      )
                    }
                    required
                    maxLength={200}
                    dir="auto"
                    lang="ur"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label>{t('history.adjournment')}</Label>
                  <Input
                    className="urdu-input"
                    value={edit.adjournmentReason}
                    onChange={(e) =>
                      setEdit((prev) =>
                        prev
                          ? { ...prev, adjournmentReason: e.target.value }
                          : prev
                      )
                    }
                    maxLength={500}
                    placeholder={t('hearing.adjournmentPh')}
                    dir="auto"
                    lang="ur"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label>{t('history.shortOrder')}</Label>
                  <Input
                    className="urdu-input"
                    value={edit.shortOrder}
                    onChange={(e) =>
                      setEdit((prev) =>
                        prev ? { ...prev, shortOrder: e.target.value } : prev
                      )
                    }
                    maxLength={500}
                    placeholder={t('hearing.shortOrderPh')}
                    dir="auto"
                    lang="ur"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label>{t('history.remarks')}</Label>
                  <Textarea
                    className="urdu-input"
                    value={edit.remarks}
                    onChange={(e) =>
                      setEdit((prev) =>
                        prev ? { ...prev, remarks: e.target.value } : prev
                      )
                    }
                    maxLength={1000}
                    dir="auto"
                    lang="ur"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setEdit(null)}
                >
                  {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={saving}>
                  {t('history.editSave')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
