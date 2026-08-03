/**
 * Shorten a string and append "..." when over the limit.
 */
export function trimText(value: string | null | undefined, max = 20): string {
  const s = (value ?? '').trim().replace(/\s+/g, ' ');
  if (!s) return '';
  if (s.length <= max) return s;
  return `${s.slice(0, max).trimEnd()}...`;
}

/** Trim each party name, then join with the vs label. */
export function trimParties(
  party1: string,
  party2: string,
  vs: string,
  maxEach = 14
): string {
  return `${trimText(party1, maxEach)} ${vs} ${trimText(party2, maxEach)}`;
}
