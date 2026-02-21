const CACHE_NAME = 'quran-engine-v3';

// Core structural files
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://fonts.googleapis.com/css2?family=Amiri+Quran&family=Inter:wght@400;500;600;700;800&display=swap'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_ASSETS);
    })
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        // Delete old engines to force updates
        if (key !== CACHE_NAME && key !== 'quran-full-db-v1') {
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});

// Smart Interceptor
self.addEventListener('fetch', (e) => {
  if (!e.request.url.startsWith('http')) return;

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      // 1. Give the cached file immediately if we have it
      if (cachedResponse) {
        return cachedResponse;
      }
      // 2. Otherwise safely fetch from internet
      return fetch(e.request).catch(() => {
         // Silently fail if offline so the app can handle it visually
      });
    })
  );
});


