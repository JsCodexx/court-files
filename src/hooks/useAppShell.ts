import { useEffect, useState } from 'react';

function readStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  if (nav.standalone) return true;
  return window.matchMedia(
    '(display-mode: standalone), (display-mode: fullscreen), (display-mode: minimal-ui)'
  ).matches;
}

function readNarrow(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(max-width: 1023px)').matches;
}

/** Mobile / PWA shell: bottom tab bar instead of sidebar drawer. */
export function useAppShell() {
  const [isStandalone, setIsStandalone] = useState(readStandalone);
  const [isNarrow, setIsNarrow] = useState(readNarrow);

  useEffect(() => {
    const mqDisplay = window.matchMedia(
      '(display-mode: standalone), (display-mode: fullscreen), (display-mode: minimal-ui)'
    );
    const mqNarrow = window.matchMedia('(max-width: 1023px)');

    const sync = () => {
      setIsStandalone(readStandalone());
      setIsNarrow(mqNarrow.matches);
    };

    sync();
    mqDisplay.addEventListener('change', sync);
    mqNarrow.addEventListener('change', sync);
    return () => {
      mqDisplay.removeEventListener('change', sync);
      mqNarrow.removeEventListener('change', sync);
    };
  }, []);

  const showBottomNav = isStandalone || isNarrow;
  const showSidebar = !showBottomNav;

  return { showBottomNav, showSidebar, isStandalone, isNarrow };
}
