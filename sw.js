/* Service Worker — Eletroquímica PWA */
const CACHE = 'eletroquimica-v10';

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon-180.png',
  './audio/dialogo0.mp3',
  './audio/dialogo1.mp3',
  './audio/dialogo1.1.mp3',
  './audio/dialogo1.2.mp3',
  './audio/dialogo1.3.mp3',
  './audio/dialogo1.4.mp3'
];

// Instala: pré-carrega todos os arquivos para uso offline
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Ativa: remove caches antigos de versões anteriores
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Busca: cache-first; se não houver, vai à rede e guarda a cópia
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((hit) => {
      if (hit) return hit;
      return fetch(e.request).then((res) => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      }).catch(() => {
        // sem rede: para navegação, devolve a página principal do cache
        if (e.request.mode === 'navigate') return caches.match('./index.html');
      });
    })
  );
});
