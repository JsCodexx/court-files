export function isIosDevice(): boolean {
  if (typeof window === 'undefined') return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  if (nav.standalone) return false;
  const ua = nav.userAgent || '';
  if (/iPad|iPhone|iPod/.test(ua)) return true;
  return ua.includes('Macintosh') && 'ontouchend' in document;
}

export function isAndroidDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android/i.test(window.navigator.userAgent || '');
}
