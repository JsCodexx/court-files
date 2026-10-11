import { useEffect, useState } from 'react';

/** True when logged-in AppLayout has mounted bottom tab bar (`html.has-bottom-nav`). */
export function useHasShellBottomNav(): boolean {
  const [has, setHas] = useState(
    () =>
      typeof document !== 'undefined' &&
      document.documentElement.classList.contains('has-bottom-nav')
  );

  useEffect(() => {
    const sync = () => {
      setHas(document.documentElement.classList.contains('has-bottom-nav'));
    };
    sync();
    const obs = new MutationObserver(sync);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => obs.disconnect();
  }, []);

  return has;
}

/** Bottom offset class for fixed PWA toasts — respects tab bar only inside app shell. */
export function pwaPromptBottomClass(hasShellTabBar: boolean): string {
  return hasShellTabBar
    ? 'bottom-[calc(var(--app-tab-bar-clearance)+0.75rem)]'
    : 'bottom-[max(0.75rem,env(safe-area-inset-bottom))]';
}
