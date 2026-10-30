/* global self, caches, URL, location, fetch */
// Egyszerű offline gyorsítótár: az alkalmazás fájljai telepítéskor, utána „előbb gyorsítótár, háttérben frissítés”.
const GYORSITOTAR = 'bimline-__VERZIO__';
const FAJLOK = ['./', './index.html', './app.js', './app.css', './manifest.webmanifest', './ikon.svg'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(GYORSITOTAR).then((c) => c.addAll(FAJLOK)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((k) => Promise.all(k.filter((x) => x !== GYORSITOTAR).map((x) => caches.delete(x)))).then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    caches.match(e.request).then((talalt) => {
      const halo = fetch(e.request)
        .then((v) => {
          if (v.ok) caches.open(GYORSITOTAR).then((c) => c.put(e.request, v.clone()));
          return v;
        })
        .catch(() => talalt);
      return talalt ?? halo;
    }),
  );
});
