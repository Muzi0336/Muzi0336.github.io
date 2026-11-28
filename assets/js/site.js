/* 站点通用：统一主导航、移动菜单，并在正式域名下注册离线缓存。 */
(function () {
  'use strict';

  var selfScript = document.currentScript || document.querySelector('script[src*="assets/js/site.js"]');
  var root = new URL('../../', selfScript ? selfScript.src : location.href);
  var path = location.pathname.replace(/\\/g, '/');
  var rootPath = root.pathname.replace(/\/+$/, '');
  var relativePath = path;

  if (rootPath && (path === rootPath || path.indexOf(rootPath + '/') === 0)) {
    relativePath = path.slice(rootPath.length);
  }
  relativePath = relativePath.replace(/^\/+/, '');

  var links = [
    { id: 'home', label: '首页', href: new URL('index.html', root).href, text: '首页：站点入口与全景导览' },
    { id: 'contest', label: '竞赛志', href: new URL('contests.html', root).href, text: '竞赛志：计挑赛、蓝桥与算法练习总览' },
    { id: 'knowledge', label: '研习录', href: new URL('knowledge.html', root).href, text: '研习录：教程、笔记与数据结构研习' },
    { id: 'review', label: '温故集', href: new URL('tools/mistakes.html', root).href, text: '温故集：错题归档与复习队列' },
    { id: 'ai', label: 'AI问学', href: new URL('ai.html', root).href, text: 'AI问学：AI 助教与学习问答' }
  ];
  var settingsLink = {
    id: 'settings',
    label: '设置',
    href: new URL('settings.html', root).href,
    text: '站点设置：AI 接口、数据与隐私'
  };

  function activeId() {
    if (!relativePath || /^index\.html$/i.test(relativePath)) return 'home';
    if (/^(?:contests\.html|problems\/(?:contest|lanqiao|algorithm)(?:\/|$))/i.test(relativePath)) return 'contest';
    if (/^(?:knowledge\.html|articles(?:\/|$))/i.test(relativePath)) return 'knowledge';
    if (/^tools\/mistakes\.html$/i.test(relativePath)) return 'review';
    if (/^ai\.html$/i.test(relativePath)) return 'ai';
    if (/^settings\.html$/i.test(relativePath)) return 'settings';
    return '';
  }

  function appendLink(nav, link, active) {
    var anchor = document.createElement('a');
    anchor.href = link.href;
    anchor.textContent = link.label;
    anchor.title = link.text;
    anchor.setAttribute('aria-label', link.text);
    if (link.id === active) {
      anchor.className = 'active';
      anchor.setAttribute('aria-current', 'page');
    }
    if (link.id === 'settings') anchor.className = (anchor.className + ' nav-settings').trim();
    nav.appendChild(anchor);
  }

  function renderNav() {
    var nav = document.querySelector('.topbar > nav.nav');
    if (!nav) return null;
    var active = activeId();
    var fragment = document.createDocumentFragment();

    nav.setAttribute('aria-label', '主要导航');
    links.forEach(function (link) {
      appendLink(fragment, link, active);
    });
    appendLink(fragment, settingsLink, active);
    nav.innerHTML = '';
    nav.appendChild(fragment);
    return nav;
  }

  function repairLogo() {
    var brand = document.querySelector('.topbar > .brand');
    if (brand) brand.href = new URL('index.html', root).href;
  }

  function setupMobileNav(nav) {
    var topbar = nav.parentNode;
    var brand = topbar.querySelector('.brand');
    var toggle = document.createElement('button');
    var mobile = window.matchMedia('(max-width: 760px)');

    nav.id = nav.id || 'site-primary-nav';
    toggle.type = 'button';
    toggle.className = 'nav-toggle';
    toggle.setAttribute('aria-controls', nav.id);
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', '打开导航菜单');
    toggle.title = '打开导航菜单';
    toggle.innerHTML = '<span class="nav-toggle-mark" aria-hidden="true"><i></i><i></i><i></i></span>';
    topbar.insertBefore(toggle, nav);
    document.documentElement.classList.add('site-nav-js');
    topbar.setAttribute('data-nav-open', 'false');

    function isOpen() {
      return topbar.getAttribute('data-nav-open') === 'true';
    }

    function setOpen(open, restoreFocus) {
      var shouldOpen = mobile.matches && open;
      topbar.setAttribute('data-nav-open', shouldOpen ? 'true' : 'false');
      toggle.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
      toggle.setAttribute('aria-label', shouldOpen ? '关闭导航菜单' : '打开导航菜单');
      toggle.title = shouldOpen ? '关闭导航菜单' : '打开导航菜单';
      if (restoreFocus) toggle.focus();
    }

    toggle.addEventListener('click', function () {
      setOpen(!isOpen(), false);
    });

    nav.addEventListener('click', function (event) {
      var target = event.target;
      while (target && target !== nav) {
        if (target.tagName === 'A') {
          setOpen(false, false);
          break;
        }
        target = target.parentNode;
      }
    });

    document.addEventListener('keydown', function (event) {
      if ((event.key === 'Escape' || event.key === 'Esc') && isOpen()) {
        event.preventDefault();
        setOpen(false, true);
      }
    });

    document.addEventListener('click', function (event) {
      if (isOpen() && !topbar.contains(event.target)) setOpen(false, false);
    });

    function syncViewport() {
      if (!mobile.matches) setOpen(false, false);
    }

    if (mobile.addEventListener) {
      mobile.addEventListener('change', syncViewport);
    } else if (mobile.addListener) {
      mobile.addListener(syncViewport);
    }
    window.addEventListener('resize', syncViewport);
    syncViewport();
  }

  var nav = renderNav();
  repairLogo();
  if (nav) setupMobileNav(nav);

  if (!('serviceWorker' in navigator)) return;
  if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') return;

  window.addEventListener('load', function () {
    try {
      var sw = new URL('sw.js', root);
      navigator.serviceWorker.register(sw.href).catch(function () { });
    } catch (e) { }
  });
})();
