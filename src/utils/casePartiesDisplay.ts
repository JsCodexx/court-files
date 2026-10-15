import { CourtCase } from '../types';
import { trimText } from './text';

/** Always use the localized VS label (e.g. VS / بنام) — never proceeding text like "Cross". */
export function resolvePartyConnector(_courtCase: CourtCase, vsLabel: string): string {
  return vsLabel;
}

export function formatPartiesLine(
  party1: string,
  party2: string,
  middle: string,
  maxTotal: number
): string {
  const mid = middle.trim() || 'VS';
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
