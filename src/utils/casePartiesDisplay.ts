import { CourtCase } from '../types';
import { trimText } from './text';

function normalizeSnippet(value: string | null | undefined): string {
  return (value ?? '').trim().replace(/\s+/g, ' ');
}

/** Skip long or placeholder proceeding text as a party connector. */
function isUsefulConnector(text: string, maxLen: number): boolean {
  if (!text || text.length > maxLen) return false;
  const lower = text.toLowerCase();
  if (lower === '—' || lower === '-' || lower === '...') return false;
  if (/^new case\b/i.test(lower)) return false;
  if (/^case will be/i.test(lower)) return false;
  return true;
}

/**
 * Prefer a short court note (order, adjournment, proceeding) over plain "Vs"
 * when it fits on one cause-list line.
 */
export function resolvePartyConnector(courtCase: CourtCase, vsLabel: string): string {
  const latest = courtCase.hearings?.[0];
  const candidates = [
    latest?.shortOrder,
    latest?.adjournmentReason,
    courtCase.proceeding,
    latest?.proceeding,
  ];

  for (const raw of candidates) {
    const snippet = normalizeSnippet(raw);
    if (isUsefulConnector(snippet, 22)) {
      return snippet;
    }
  }

  return vsLabel;
}

export function formatPartiesLine(
  party1: string,
  party2: string,
  middle: string,
  maxTotal: number
): string {
  const mid = normalizeSnippet(middle) || 'Vs';
  const sep = ` ${mid} `;
  const budget = Math.max(10, maxTotal - sep.length);
  const each = Math.max(4, Math.floor(budget / 2));
  return `${trimText(party1, each)}${sep}${trimText(party2, each)}`;
}

export type PartiesDisplayVariant = 'mobile' | 'compact' | 'full';

export function getCasePartiesDisplay(
  courtCase: CourtCase,
  vsLabel: string,
  variant: PartiesDisplayVariant = 'compact'
): { text: string; title: string; middle: string } {
  const p1 = courtCase.party1.name;
  const p2 = courtCase.party2.name;
  const middle = resolvePartyConnector(courtCase, vsLabel);
  const title = `${p1} ${middle} ${p2}`;

  if (variant === 'full') {
    return { text: title, title, middle };
  }

  const maxTotal = variant === 'mobile' ? 58 : 44;
  const text = formatPartiesLine(p1, p2, middle, maxTotal);
  return { text, title, middle };
}
