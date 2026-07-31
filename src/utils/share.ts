import { CourtCase } from '../types';
import { formatDisplayDate } from './dates';

export interface ShareLabels {
  vs: string;
  court: string;
  judge: string;
  todayProc: string;
  nextDate: string;
  nextProc: string;
  dash: string;
  copied: string;
  monthLabel?: (index: number, short?: boolean) => string;
}

const defaultLabels: ShareLabels = {
  vs: 'Vs',
  court: 'Court',
  judge: 'Judge',
  todayProc: "Today's Proceedings",
  nextDate: 'Next Date',
  nextProc: 'Next Proceedings',
  dash: '—',
  copied: 'List copied to clipboard.',
};

export function buildCaseListText(
  cases: CourtCase[],
  title: string,
  labels: ShareLabels = defaultLabels
): string {
  const lines = cases.map((c, i) => {
    const parts = [
      `${i + 1}. ${c.caseId}`,
      `${c.party1.name} ${labels.vs} ${c.party2.name}`,
      c.courtNumber ? `${labels.court}: ${c.courtNumber}` : null,
      `${labels.judge}: ${c.judgeName}`,
      `${labels.todayProc}: ${c.proceeding || labels.dash}`,
      `${labels.nextDate}: ${formatDisplayDate(c.nextDate, labels.monthLabel)}`,
      `${labels.nextProc}: ${c.hearings[0]?.proceeding || c.proceeding || labels.dash}`,
    ].filter(Boolean);
    return parts.join(' | ');
  });

  return `${title}\n\n${lines.join('\n')}`;
}

export function shareWhatsApp(text: string): void {
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

export function shareEmail(subject: string, text: string): void {
  window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
}

export async function shareNative(
  title: string,
  text: string,
  copiedMessage = defaultLabels.copied
): Promise<void> {
  if (navigator.share) {
    await navigator.share({ title, text });
    return;
  }
  await navigator.clipboard.writeText(text);
  alert(copiedMessage);
}
