const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    window.location.hostname === '[::1]' ||
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4]\d|[01]?\d\d?)){3}$/)
);

type Config = {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
};

export function register(config?: Config): void {
  if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) {
    return;
  }

  window.addEventListener('load', () => {
    const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

    if (isLocalhost) {
      checkValidServiceWorker(swUrl, config);
      return;
    }

    registerValidSW(swUrl, config);
  });
}

function registerValidSW(swUrl: string, config?: Config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      const notify = () => {
        if (registration.waiting && navigator.serviceWorker.controller) {
          config?.onUpdate?.(registration);
        } else if (!navigator.serviceWorker.controller) {
          config?.onSuccess?.(registration);
        }
      };

      if (registration.waiting) notify();

      registration.onupdatefound = () => {
        const installing = registration.installing;
        if (!installing) return;
        installing.onstatechange = () => {
          if (installing.state === 'installed') notify();
        };
      };
    })
    .catch((err) => {
      console.error('Service worker registration failed:', err);
    });
}

function checkValidServiceWorker(swUrl: string, config?: Config) {
  fetch(swUrl, { headers: { 'Service-Worker': 'script' } })
    .then((response) => {
      const ct = response.headers.get('content-type') || '';
      if (
        response.status === 404 ||
        (ct.includes('text/html') && !ct.includes('javascript'))
      ) {
        navigator.serviceWorker.ready.then((reg) => reg.unregister());
        return;
      }
      registerValidSW(swUrl, config);
    })
    .catch(() => {
      console.warn('No service worker found (dev). PWA works after production build.');
    });
}

export function unregister(): void {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.ready
    .then((registration) => registration.unregister())
    .catch(() => {});
}
