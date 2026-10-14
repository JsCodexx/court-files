const SNOOZE_KEY = 'cf_pwa_install_snooze_until';

export function isInstallBannerSnoozed(): boolean {
  try {
    const raw = localStorage.getItem(SNOOZE_KEY);
    if (!raw) return false;
    const until = Number(raw);
    if (Number.isNaN(until)) return false;
    return Date.now() < until;
  } catch {
    return false;
  }
}

export function snoozeInstallBanner(days: number) {
  try {
    localStorage.setItem(
      SNOOZE_KEY,
      String(Date.now() + days * 24 * 60 * 60 * 1000)
    );
  } catch {
    /* ignore */
  }
}

export function clearInstallBannerSnooze() {
  try {
    localStorage.removeItem(SNOOZE_KEY);
  } catch {
    /* ignore */
  }
}
