/* 站点通用：注册 Service Worker，让重复访问先读本地缓存。 */
(function () {
  if (!('serviceWorker' in navigator)) return;
  if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') return;
  var selfScript = document.currentScript || document.querySelector('script[src*="assets/js/site.js"]');

  window.addEventListener('load', function () {
    try {
      var sw = selfScript && selfScript.src ? new URL('../../sw.js', selfScript.src) : new URL('sw.js', location.href);
      navigator.serviceWorker.register(sw.href).catch(function () { });
    } catch (e) { }
  });
})();
