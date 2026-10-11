/**
 * CRA’s dev error overlay treats any uncaught window error as app failure.
 * Browser extensions often throw on navigation/clicks (e.g. chrome-extension://…/M_ID).
 */
export function suppressExtensionDevOverlay(): void {
  if (process.env.NODE_ENV !== 'development') return;

  const isExtensionScript = (url: string | undefined) =>
    !!url &&
    (url.startsWith('chrome-extension://') ||
      url.startsWith('moz-extension://') ||
      url.startsWith('safari-extension://'));

  window.addEventListener(
    'error',
    (event) => {
      if (isExtensionScript(event.filename)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    },
    true
  );

  window.addEventListener(
    'unhandledrejection',
    (event) => {
      const reason = event.reason;
      const stack =
        typeof reason === 'object' && reason && 'stack' in reason
          ? String((reason as Error).stack)
          : String(reason ?? '');
      if (stack.includes('chrome-extension://') || stack.includes('moz-extension://')) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    },
    true
  );
}
