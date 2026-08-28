// Vaani-Setu Progressive Web App Service Worker
const CACHE_NAME = 'vaani-setu-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/src/css/styles.css',
  '/src/js/app.js',
  '/src/js/i18n.js',
  '/src/js/schemes.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
