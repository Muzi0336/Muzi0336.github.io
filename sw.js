/* 站点静态资源缓存：页面与日程数据网络优先，普通静态资源缓存后后台更新。 */
const CACHE = 'zyyc-static-v8';
const NETWORK_TIMEOUT = 2500;
const PRECACHE = [
  './',
  'index.html',
  'contests.html',
  'knowledge.html',
  'ai.html',
  'tools/mistakes.html',
  'settings.html',
  'assets/css/site.css',
  'assets/css/portal.css',
  'assets/css/detail.css',
  'assets/css/settings.css',
  'assets/css/fonts.css?v=1',
  'assets/js/site.js',
  'assets/js/portal.js',
  'assets/js/quiz-ai.js',
  'assets/js/contest-schedule.js',
  'assets/data/contest-catalog.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    const base = self.registration.scope;
    await Promise.all(PRECACHE.map((path) => {
      const request = new Request(new URL(path, base).href, { cache: 'reload' });
      return cache.add(request).catch(() => null);
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

function isHtml(request, url) {
  return request.mode === 'navigate' ||
    request.destination === 'document' ||
    /\.html$/i.test(url.pathname) ||
    (request.headers.get('accept') || '').indexOf('text/html') !== -1;
}

function isNetworkFirstAsset(url) {
  return url.pathname.endsWith('/assets/data/contest-catalog.js') ||
    url.pathname.endsWith('/assets/js/contest-schedule.js');
}

function offlineResponse(request) {
  if (request.mode === 'navigate') {
    return new Response(
      '<!doctype html><html lang="zh-CN"><meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<title>暂时离线</title><body style="font:16px/1.7 sans-serif;padding:2rem">' +
      '<h1>暂时无法连接</h1><p>当前网络不可用，本地也还没有缓存这个页面。</p></body></html>',
      {
        status: 503,
        statusText: 'Offline',
        headers: { 'Content-Type': 'text/html; charset=UTF-8', 'Cache-Control': 'no-store' }
      }
    );
  }
  return new Response('Offline', {
    status: 503,
    statusText: 'Offline',
    headers: { 'Content-Type': 'text/plain; charset=UTF-8', 'Cache-Control': 'no-store' }
  });
}

async function fetchAndCache(request, cache, timeout) {
  const controller = typeof AbortController === 'function' ? new AbortController() : null;
  const timer = setTimeout(() => {
    if (controller) controller.abort();
  }, timeout);

  try {
    const response = await fetch(request, controller ? { signal: controller.signal } : undefined);
    if (response && response.ok) {
      cache.put(request, response.clone()).catch(() => null);
    }
    return response;
  } catch (error) {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  const response = await fetchAndCache(request, cache, NETWORK_TIMEOUT);

  if (response && response.ok) return response;
  if (cached) return cached;
  return response || offlineResponse(request);
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  const network = fetchAndCache(request, cache, NETWORK_TIMEOUT);

  if (cached) {
    network.catch(() => null);
    return cached;
  }
  const response = await network;
  return response || offlineResponse(request);
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (isHtml(request, url) || isNetworkFirstAsset(url)) {
    event.respondWith(networkFirst(request));
    return;
  }
  if (isStatic(url)) {
    event.respondWith(staleWhileRevalidate(request));
  }
});
