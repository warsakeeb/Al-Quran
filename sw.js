const CACHE_NAME = 'quran-shell-safe-v1';

// Cache ONLY the App Shell files here so we NEVER trigger an ERR_FAILED crash.
const SHELL_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone/babel.min.js'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        // Clear old shells, but DO NOT touch the big offline data vault!
        if (key !== CACHE_NAME && key !== 'quran-vault-master') {
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (!e.request.url.startsWith('http')) return;

  // Let the React App handle heavy API caching safely.
  if (e.request.url.includes('api.alquran.cloud')) return;

  e.respondWith(
    fetch(e.request).then((networkResponse) => {
      caches.open(CACHE_NAME).then((cache) => cache.put(e.request, networkResponse.clone()));
      return networkResponse;
    }).catch(() => {
      return caches.match(e.request);
    })
  );
});


