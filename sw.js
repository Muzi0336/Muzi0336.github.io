/* 站点静态资源缓存：HTML 走网络优先，CSS/JS/图片走缓存并后台更新。 */
const CACHE = 'zyyc-static-v7';
const CORE = ['assets/css/site.css', 'assets/css/detail.css', 'assets/css/fonts.css?v=1', 'assets/js/site.js'];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    const base = self.registration.scope;
    await Promise.all(CORE.map((path) => {
      return cache.add(new URL(path, base).href).catch(() => null);
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith('zyyc-') && key !== CACHE).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

function isStatic(url) {
  return /\.(css|js|mjs|png|jpg|jpeg|webp|gif|svg|ico|woff2?|ttf|otf)$/i.test(url.pathname);
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  const url = new URL(request.url);
  const key = new Request(url.origin + url.pathname);
  const cached = await cache.match(key);
  const network = fetch(request).then((response) => {
    if (response && response.ok) cache.put(key, response.clone());
    return response;
  }).catch(() => null);

  if (!cached) return network.then((response) => response || Response.error());
  return Promise.race([
    network,
    new Promise((resolve) => setTimeout(() => resolve(cached), 2200))
  ]).then((response) => response || cached);
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  const network = fetch(request).then((response) => {
    if (response && response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => null);

  if (cached) {
    network.catch(() => null);
    return cached;
  }
  return network.then((response) => response || Response.error());
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }
  if (isStatic(url)) {
    event.respondWith(staleWhileRevalidate(request));
  }
});
