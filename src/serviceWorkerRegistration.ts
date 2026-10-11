const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    window.location.hostname === '[::1]' ||
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4]\d|[01]?\d\d?)){3}$/)
);

type Config = {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
};

let registerStarted = false;
let activeRegistration: ServiceWorkerRegistration | null = null;
const updateListeners = new Set<(registration: ServiceWorkerRegistration) => void>();

function emitUpdate(registration: ServiceWorkerRegistration) {
  if (!registration.waiting || !navigator.serviceWorker.controller) return;
  activeRegistration = registration;
  updateListeners.forEach((cb) => cb(registration));
}

/** Subscribe to “new version waiting” (e.g. PWA banner). Returns unsubscribe. */
export function subscribeServiceWorkerUpdates(
  listener: (registration: ServiceWorkerRegistration) => void
): () => void {
  updateListeners.add(listener);
  if (
    activeRegistration?.waiting &&
    navigator.serviceWorker.controller
  ) {
    listener(activeRegistration);
  }
  return () => {
    updateListeners.delete(listener);
  };
}

function scheduleUpdateChecks(registration: ServiceWorkerRegistration) {
  const check = () => {
    void registration.update().catch(() => {});
  };

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') check();
  });

  window.addEventListener('focus', check);

  const hourly = window.setInterval(check, 60 * 60 * 1000);
  window.addEventListener('pagehide', () => window.clearInterval(hourly));
}

export function register(config?: Config): void {
  if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) {
    return;
  }
  if (registerStarted) return;
  registerStarted = true;

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
      activeRegistration = registration;
      scheduleUpdateChecks(registration);

      const notify = () => {
        if (registration.waiting && navigator.serviceWorker.controller) {
          config?.onUpdate?.(registration);
          emitUpdate(registration);
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

/** Tell the waiting worker to activate; reload once it controls the page. */
export function applyWaitingServiceWorkerUpdate(
  waitingWorker: ServiceWorker
): Promise<void> {
  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      navigator.serviceWorker.removeEventListener('controllerchange', onChange);
      window.clearTimeout(fallback);
      resolve();
    };

    const onChange = () => finish();
    navigator.serviceWorker.addEventListener('controllerchange', onChange);

    waitingWorker.postMessage({ type: 'SKIP_WAITING' });

    const fallback = window.setTimeout(finish, 4000);
  });
}

export function unregister(): void {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.ready
    .then((registration) => registration.unregister())
    .catch(() => {});
}
