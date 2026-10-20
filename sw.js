// Service worker del lanzador Dirección EVG: permite instalarlo como app (Android/Chrome)
// y que el lanzador abra aunque no haya conexión. No intercepta nada de Google.
const CACHE = 'direccion-evg-v4';
const ARCHIVOS = [
  './', './index.html', './manifest.json', './logo.png', './apple-touch-icon.png',
  './icon-192.png', './icon-512.png', './maskable-192.png', './maskable-512.png',
  './favicon-32.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  // Red primero (para recibir cambios), caché si no hay conexión
  e.respondWith(
    fetch(e.request)
      .then(r => { const copia = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copia)); return r; })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
