const CACHE_NAME = 'quran-offline-vault-v1';

// Install event - takes over immediately
self.addEventListener('install', (e) => {
  self.skipWaiting();
});

// Activate event - cleans up old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});

// Fetch event - The "Smart Vault" Logic
self.addEventListener('fetch', (e) => {
  // Ignore non-http requests
  if (!e.request.url.startsWith('http')) return;

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      // 1. Fetch from the network in the background to keep the vault updated
      const fetchPromise = fetch(e.request).then((networkResponse) => {
        // Save a clone of the network response to the vault
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, networkResponse.clone());
        });
        return networkResponse;
      }).catch(() => {
        // If network fails (offline), ignore error
      });

      // 2. Return the cached response IMMEDIATELY if we have it (Instant Offline Load)
      // If we don't have it in cache, wait for the network fetch
      return cachedResponse || fetchPromise;
    })
  );
});


