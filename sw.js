// Service worker for offline use. Generated into /sw.js by scripts/build.js, which fills in the cache version (a hash
// of the precached files) and the asset list, so any change to a shipped file produces a new cache.
const CACHE = "dojo-e781b7109049";
const ASSETS = ["./","./index.html","./manifest.webmanifest","./css/fonts.css","./css/styles.css","./css/base.css","./dist/app.js","./fonts/barlow-400.woff2","./fonts/barlow-500.woff2","./fonts/barlow-600.woff2","./fonts/barlow-condensed-500.woff2","./fonts/barlow-condensed-600.woff2","./fonts/barlow-condensed-700.woff2","./fonts/barlow-condensed-800.woff2","./icons/icon.svg","./icons/icon-192.png","./icons/icon-512.png","./icons/maskable-192.png","./icons/maskable-512.png","./icons/apple-touch-icon.png"];

self.addEventListener("install", e => {
  // Precache everything; do not skipWaiting here: the page asks first ("A new version is ready").
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith("dojo-") && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("message", e => { if (e.data === "skipWaiting") self.skipWaiting(); });
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  // Navigations get the cached page (the query and hash don't change it); assets are cache-first.
  if (req.mode === "navigate") { e.respondWith(caches.match("./index.html").then(r => r || fetch(req))); return; }
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(r => r || fetch(req)));
});
