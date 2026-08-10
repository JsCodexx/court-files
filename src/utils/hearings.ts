import { HearingRecord } from '../types';

/** Hearings may be corrected only within 48 hours of creation. */
export const HEARING_EDIT_WINDOW_MS = 48 * 60 * 60 * 1000;

export function isHearingEditable(createdAt: string): boolean {
  const created = Date.parse(createdAt);
  if (Number.isNaN(created)) return false;
  return Date.now() - created <= HEARING_EDIT_WINDOW_MS;
}

/** Latest hearing by creation time (API returns newest first). */
export function getLatestHearing<T extends { createdAt: string }>(
  hearings: T[]
): T | null {
  if (!hearings.length) return null;
  return hearings.reduce((latest, h) =>
    Date.parse(h.createdAt) > Date.parse(latest.createdAt) ? h : latest
  );
}

export type HearingWithSerial = HearingRecord & { serial: number };

export type HearingJudgeGroup = {
  judgeKey: string;
  judgeName: string;
  rows: HearingWithSerial[];
};

function judgeKeyOf(h: HearingRecord): string {
  if (h.judgePersonId) return h.judgePersonId;
  const name = h.judgeName.trim().toLowerCase();
  return name || '__unknown__';
}

/**
 * Group hearings under each judge (Punjab-style proceeding history).
 * Serial numbers run chronologically (1 = earliest). Groups and rows
 * are ordered newest-first for display.
 */
export function groupHearingsByJudge(
  hearings: HearingRecord[]
): HearingJudgeGroup[] {
  const sorted = [...hearings].sort((a, b) => {
    const byDate = a.date.localeCompare(b.date);
    if (byDate !== 0) return byDate;
    return a.createdAt.localeCompare(b.createdAt);
  });

  const numbered: HearingWithSerial[] = sorted.map((h, i) => ({
    ...h,
    serial: i + 1,
  }));

  const byJudge = new Map<string, HearingJudgeGroup>();
  for (const row of numbered) {
    const key = judgeKeyOf(row);
    const existing = byJudge.get(key);
    if (existing) {
      existing.rows.push(row);
    } else {
      byJudge.set(key, {
        judgeKey: key,
        judgeName: row.judgeName.trim() || '—',
        rows: [row],
      });
    }
  }

  const groups = Array.from(byJudge.values());
  groups.sort((a, b) => {
    const aLatest = a.rows[a.rows.length - 1]?.date ?? '';
    const bLatest = b.rows[b.rows.length - 1]?.date ?? '';
    return bLatest.localeCompare(aLatest);
  });

  return groups.map((g) => ({
    ...g,
    rows: [...g.rows].sort((a, b) => {
      const byDate = b.date.localeCompare(a.date);
      if (byDate !== 0) return byDate;
      return b.serial - a.serial;
    }),
  }));
}
