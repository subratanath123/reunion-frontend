const CACHE_NAME = 'reunion-v2';
const STATIC_ASSETS = [
  '/',
  '/logo.jpg',
  '/bkash-logo.svg',
  '/manifest.json',
];

// Install: cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: only handle same-origin GET requests for static assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // Skip non-GET requests (POST, PUT, DELETE etc.)
  if (request.method !== 'GET') {
    return;
  }

  // Skip API calls - let them go directly to network
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // Skip audio/media files (206 partial responses can't be cached)
  if (url.pathname.endsWith('.mp3') || url.pathname.endsWith('.wav') || url.pathname.endsWith('.ogg')) {
    return;
  }

  // Cache-first for static assets, network fallback
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((response) => {
          if (response.ok && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => cached);

      return cached || fetchPromise;
    })
  );
});
