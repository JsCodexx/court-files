import { useEffect } from 'react';
const STANDALONE_MQ =
  '(display-mode: standalone), (display-mode: fullscreen), (display-mode: minimal-ui)';

/** Sync PWA / standalone classes on `<html>` for safe-area and scroll CSS. */
export function PwaRootEffects() {
  useEffect(() => {
    const root = document.documentElement;
    const mq = window.matchMedia(STANDALONE_MQ);

    const syncStandalone = () => {
      const nav = window.navigator as Navigator & { standalone?: boolean };
      const standalone = Boolean(nav.standalone) || mq.matches;
      root.classList.toggle('pwa-standalone', standalone);
    };

    syncStandalone();
    mq.addEventListener('change', syncStandalone);
    return () => mq.removeEventListener('change', syncStandalone);
  }, []);

  return null;
}
