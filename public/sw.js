const CACHE_NAME = 'forevervow-v2';
const PRECACHE_URLS = [
  '/',
  '/favicon.png',
  '/apple-touch-icon.png',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/site.webmanifest',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET and cross-origin requests
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // For navigation requests, try network first then cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/'))
    );
    return;
  }

  // Cache only static assets, never API responses or authenticated documents.
  if (!['script', 'style', 'image', 'font'].includes(request.destination)) return;

  // For assets, use stale-while-revalidate
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetched = fetch(request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      }).catch(() => cached);

      return cached || fetched;
    })
  );
});

self.addEventListener('push', (event) => {
  let payload = {};
  try { payload = event.data ? event.data.json() : {}; } catch { payload = { body: event.data?.text() || '' }; }
  const title = payload.title || 'ForeverVow';
  const options = {
    body: payload.body || 'You have a new wedding update.',
    icon: payload.icon || '/android-chrome-192x192.png',
    badge: payload.badge || '/favicon.png',
    data: { target_url: payload.target_url || '/' },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  let target = new URL('/', self.location.origin);
  try {
    const requested = new URL(event.notification.data?.target_url || '/', self.location.origin);
    if (requested.origin === self.location.origin) target = requested;
  } catch { /* Malformed targets open the app home. */ }
  const targetUrl = target.href;
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
    const existing = clients.find((client) => client.url === targetUrl && 'focus' in client);
    if (existing) return existing.focus();
    return self.clients.openWindow(targetUrl);
  }));
});
