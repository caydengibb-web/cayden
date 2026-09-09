/* Offline cache for /form only. Registered with scope "/form", so the rest
   of the site never goes through this worker. Bump VERSION when the page
   changes in a way that must reach phones that already have it. */
const VERSION = 'form-v1';
const PAGE = '/form';
const ASSETS = [
  PAGE,
  '/form.webmanifest',
  '/form-icon-192.png',
  '/form-icon-512.png',
  '/fonts/inter-tight-latin-400-normal.woff2',
  '/fonts/inter-tight-latin-500-normal.woff2',
  '/fonts/inter-tight-latin-800-normal.woff2',
  '/fonts/instrument-serif-latin-400-italic.woff2',
  '/fonts/instrument-serif-latin-400-normal.woff2',
  '/fonts/jetbrains-mono-latin-400-normal.woff2',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) =>
      Promise.all(ASSETS.map((url) => cache.add(url).catch(() => undefined))),
    ),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // The page itself: fresh when online, cached when not.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((cache) => cache.put(PAGE, copy));
          return res;
        })
        .catch(() => caches.match(PAGE)),
    );
    return;
  }

  // Fonts, icons, manifest: cache first.
  event.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(VERSION).then((cache) => cache.put(req, copy));
          }
          return res;
        }),
    ),
  );
});
