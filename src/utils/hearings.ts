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
