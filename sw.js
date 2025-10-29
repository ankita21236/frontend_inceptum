const CACHE_NAME = 'aegis-cache-v1';
// All the files your app needs to work offline
const FILES_TO_CACHE = [
  'index.html',
  'style.css',
  'manifest.json',
  'js/main.js',
  'js/auth.js',
  'js/actions.js',
  'js/api.js',
  'js/chat.js',
  'js/globe.js',
  'js/map.js',
  'js/state.js',
  'js/ui.js',
  'https.unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https.unpkg.com/leaflet@1.9.4/dist/leaflet.js'
  // You would add all other external libraries here (three.js, etc.)
  // and any local image/font files.
];

// 1. Install the Service Worker
self.addEventListener('install', (evt) => {
  console.log('[ServiceWorker] Install');
  // Pre-cache all essential app files
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching offline page');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 2. Activate the Service Worker
self.addEventListener('activate', (evt) => {
  console.log('[ServiceWorker] Activate');
  // Remove old, unused caches
  evt.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim();
});

// 3. Serve cached content
self.addEventListener('fetch', (evt) => {
  // Try to get from network first, then fall back to cache
  evt.respondWith(
    caches.match(evt.request)
      .then((response) => {
        return response || fetch(evt.request);
      })
  );
});