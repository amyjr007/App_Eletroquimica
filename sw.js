/* Service Worker — Eletroquímica PWA */
const CACHE = 'eletroquimica-v62';

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
  './audio/dialogo1.4.mp3',
  './audio/dialogo1.5.mp3',
  './audio/dialogo1.6.mp3',
  './audio/ex0.mp3',
  './audio/ex1.mp3',
  './audio/ex2.mp3',
  './audio/ex3.mp3',
  './audio/ex4.mp3',
  './audio/ex5.mp3',
  './audio/applause.mp3',
  './audio/yes.mp3',
  './audio/statistics.mp3',
  './audio/lowscore.mp3',
  './audio/error.mp3',
  './audio/dialogo2.mp3',
  './images/galvani.jpeg',
  './images/rã1.png',
  './images/rã2.png'
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

// Navegação (HTML): network-first — sempre tenta a versão mais nova primeiro,
// e só cai pro cache se estiver offline. Evita ficar preso numa versão antiga.
function buscaRedePrimeiro(req) {
  // 'no-store' ignora qualquer cópia guardada no cache HTTP do navegador/CDN,
  // garantindo que a navegação sempre busque o HTML mais recente do servidor.
  const reqFresca = new Request(req.url, { cache: 'no-store' });
  return fetch(reqFresca).then((res) => {
    if (res && res.status === 200 && res.type === 'basic') {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(req, copy));
    }
    return res;
  }).catch(() => caches.match(req).then((hit) => hit || caches.match('./index.html')));
}

// Demais arquivos (áudio, ícones, etc.): cache-first; se não houver, vai à rede e guarda a cópia
function buscaCachePrimeiro(req) {
  return caches.match(req).then((hit) => {
    if (hit) return hit;
    return fetch(req).then((res) => {
      if (res && res.status === 200 && res.type === 'basic') {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
      }
      return res;
    });
  });
}

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  if (e.request.mode === 'navigate') {
    e.respondWith(buscaRedePrimeiro(e.request));
  } else {
    e.respondWith(buscaCachePrimeiro(e.request));
  }
});
