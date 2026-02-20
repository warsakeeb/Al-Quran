// This is the Service Worker that makes the app installable
self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  return self.clients.claim();
});

// A simple fetch listener is required by Chrome to trigger the Install prompt
self.addEventListener('fetch', (e) => {
  e.respondWith(fetch(e.request).catch(() => new Response('Offline')));
});

