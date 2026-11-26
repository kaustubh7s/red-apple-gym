const CACHE_NAME = 'redapple-pwa-v4';

const STATIC_PRECACHE = [
  '/',
  '/pass',
  '/pass/lookup',
  '/offline',
  '/manifest.json',
  '/images/logo.png',
  '/images/owner.jpg',
  '/images/gym-1.jpg',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/icon-maskable-192x192.png',
  '/icon-maskable-512x512.png',
  '/apple-touch-icon.png',
  '/favicon.ico'
];

// Install Event - Pre-cache essential app shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_PRECACHE).catch((err) => {
        console.warn('[SW] Pre-caching partial failure:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean old caches and claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Smart network-first navigation & cache-first for static assets
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Skip non-GET requests or browser extension/chrome-extension requests
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // Skip Turbopack / Next.js dev server hot reload web sockets
  if (
    url.pathname.includes('turbopack') ||
    url.pathname.includes('_next/webpack-hmr') ||
    url.pathname.startsWith('/__nextjs')
  ) {
    return;
  }

  // Handle HTML document navigations (Network-First with Offline Pass Fallback)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // If valid response, clone and cache it
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(async () => {
          // 1. Check if the exact requested page is in cache
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }

          // 2. If navigating to any pass page (e.g. /pass/..., /pass?id=...), fall back to cached pass shell
          if (url.pathname.startsWith('/pass')) {
            const cachedPass =
              (await caches.match('/pass')) ||
              (await caches.match('/pass/lookup')) ||
              (await caches.match('/pass.html')) ||
              (await caches.match('/pass/index.html')) ||
              (await caches.match('/'));
            if (cachedPass) {
              return cachedPass;
            }
          }

          // 3. Fall back to offline page
          const offlinePage = (await caches.match('/offline')) || (await caches.match('/offline.html'));
          if (offlinePage) {
            return offlinePage;
          }
          return new Response('Offline - Red Apple Athletic Club', {
            headers: { 'Content-Type': 'text/plain' }
          });
        })
    );
    return;
  }

  // Handle static assets (CSS, JS, fonts, images) - Stale-While-Revalidate
  const isStaticAsset =
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image' ||
    request.destination === 'font' ||
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|webp|ico|woff2?)$/);

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Default network pass-through for API calls and dynamic data
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

// Message listener for skipWaiting or manual updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

