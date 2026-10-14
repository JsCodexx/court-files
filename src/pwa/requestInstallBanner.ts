/** Fired when user asks to see install help again (e.g. Profile → Install app). */
export const PWA_REQUEST_INSTALL_BANNER = 'cf-pwa-request-install-banner';

export function requestInstallBanner() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(PWA_REQUEST_INSTALL_BANNER));
}
