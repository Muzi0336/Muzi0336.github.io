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
    { id: 'contest', label: '竞赛志', href: new URL('contests.html', root).href, text: '竞赛志：计挑赛与蓝桥杯通知、赛程和真题入口' },
    { id: 'knowledge', label: '研习录', href: new URL('knowledge.html', root).href, text: '研习录：算法训练、数据结构与开发教程' },
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
    if (/^(?:contests\.html|problems\/(?:contest|lanqiao)(?:\/|$))/i.test(relativePath)) return 'contest';
    if (/^(?:knowledge\.html|articles(?:\/|$)|problems\/algorithm(?:\/|$))/i.test(relativePath)) return 'knowledge';
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
    var navLinks = nav.querySelectorAll('a');

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

    function setCollapsedAccessibility(collapsed) {
      if ('inert' in nav) nav.inert = collapsed;
      if (collapsed) {
        nav.setAttribute('aria-hidden', 'true');
      } else {
        nav.removeAttribute('aria-hidden');
      }
      Array.prototype.forEach.call(navLinks, function (link) {
        if (collapsed) {
          if (!link.hasAttribute('data-site-nav-tabindex')) {
            link.setAttribute('data-site-nav-tabindex', link.getAttribute('tabindex') || '');
          }
          link.setAttribute('tabindex', '-1');
          return;
        }
        if (!link.hasAttribute('data-site-nav-tabindex')) return;
        var tabindex = link.getAttribute('data-site-nav-tabindex');
        link.removeAttribute('data-site-nav-tabindex');
        if (tabindex) {
          link.setAttribute('tabindex', tabindex);
        } else {
          link.removeAttribute('tabindex');
        }
      });
    }

    function setOpen(open, restoreFocus) {
      var shouldOpen = mobile.matches && open;
      topbar.setAttribute('data-nav-open', shouldOpen ? 'true' : 'false');
      toggle.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
      toggle.setAttribute('aria-label', shouldOpen ? '关闭导航菜单' : '打开导航菜单');
      toggle.title = shouldOpen ? '关闭导航菜单' : '打开导航菜单';
      setCollapsedAccessibility(mobile.matches && !shouldOpen);
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
      setOpen(mobile.matches && isOpen(), false);
    }

    if (mobile.addEventListener) {
      mobile.addEventListener('change', syncViewport);
    } else if (mobile.addListener) {
      mobile.addListener(syncViewport);
    }
    window.addEventListener('resize', syncViewport);
    syncViewport();
  }

  function setupSectionNavigation() {
    var side = document.querySelector('.set-side');
    var content = document.querySelector('.set-content');
    if (!side || !content) return;

    var links = side.querySelectorAll('a[href^="#"]');
    var sections = [];
    if (!links.length) return;

    function setActive(id) {
      Array.prototype.forEach.call(links, function (link) {
        var active = link.getAttribute('href') === '#' + id;
        link.classList.toggle('active', active);
        if (active) {
          link.setAttribute('aria-current', 'location');
        } else {
          link.removeAttribute('aria-current');
        }
      });
    }

    Array.prototype.forEach.call(links, function (link) {
      var id = (link.getAttribute('href') || '').slice(1);
      var section = id ? document.getElementById(id) : null;
      if (!section || !content.contains(section)) return;
      sections.push(section);
      link.addEventListener('click', function () {
        setActive(id);
      });
    });

    if (!sections.length || !('IntersectionObserver' in window)) return;
    var observer = new IntersectionObserver(function (entries) {
      var visible = entries.filter(function (entry) {
        return entry.isIntersecting;
      }).sort(function (left, right) {
        return left.boundingClientRect.top - right.boundingClientRect.top;
      });
      if (visible.length) setActive(visible[0].target.id);
    }, { rootMargin: '-18% 0px -66% 0px', threshold: 0.01 });

    sections.forEach(function (section) {
      observer.observe(section);
    });

    if (location.hash.length > 1) {
      setActive(location.hash.slice(1));
    }
  }

  function setupPortalMotion() {
    var body = document.body;
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!body || !body.classList.contains('portal-page')) return null;
    if (!('IntersectionObserver' in window) || reduced.matches) return null;

    var targets = [];
    var observer = null;

    function markTarget(target, delay) {
      if (!target || targets.indexOf(target) !== -1) return;
      target.setAttribute('data-motion-reveal', '');
      target.style.setProperty('--motion-delay', (delay || 0) + 'ms');
      targets.push(target);
    }

    function markChildren(parentSelector, childSelector) {
      Array.prototype.forEach.call(document.querySelectorAll(parentSelector), function (parent) {
        var index = 0;
        Array.prototype.forEach.call(parent.children, function (child) {
          if (!child.matches(childSelector)) return;
          markTarget(child, Math.min(index, 3) * 60);
          index += 1;
        });
      });
    }

    markChildren('.portal-section-head', 'h2, p');
    markChildren('.entry-layout', '.entry-feature, .entry-side');
    markChildren('.entry-strip', 'p, .mini-links');
    markChildren('.ai-steps', '.ai-step');
    markChildren('.review-layout', '.review-summary, .review-metrics');
    markChildren('.study-map', '.study-block');
    markChildren('.contest-modules', '.contest-module');
    markChildren('.study-ledger', '.portal-entry-card');
    markChildren('.study-ledger-main', '.portal-entry-card');
    markChildren('.ai-use-list', '.ai-use');
    markChildren('.ai-compare', '.ai-compare-col');
    markChildren('.problem-list', '.problem-row');
    markChildren('.setup-callout', 'div, .portal-button');
    markChildren('.future-panel', 'div');

    Array.prototype.forEach.call(document.querySelectorAll([
      '.portal-section > [data-recent-events]',
      '.portal-section > [data-contest-modules]',
      '.portal-section > .clock-line',
      '.portal-section > .portal-placeholder'
    ].join(',')), function (target, index) {
      markTarget(target, Math.min(index, 3) * 60);
    });

    Array.prototype.forEach.call(document.querySelectorAll('[data-reveal]'), function (target) {
      var delay = Number(target.getAttribute('data-reveal-delay'));
      markTarget(target, Number.isFinite(delay) ? delay : 0);
    });

    if (!targets.length) return null;

    function reveal(target) {
      if (!target || target.classList.contains('is-revealed')) return;
      target.classList.add('is-revealed');
      if (observer) observer.unobserve(target);
    }

    function revealAll() {
      targets.forEach(reveal);
      if (observer) observer.disconnect();
      body.classList.remove('portal-motion-ready');
    }

    try {
      observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) reveal(entry.target);
        });
      }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    } catch (error) {
      targets.forEach(function (target) {
        target.removeAttribute('data-motion-reveal');
        target.style.removeProperty('--motion-delay');
      });
      return null;
    }

    body.classList.add('portal-motion-ready');
    try {
      targets.forEach(function (target) {
        observer.observe(target);
      });
    } catch (error) {
      revealAll();
      return null;
    }

    window.requestAnimationFrame(function () {
      targets.forEach(function (target) {
        var rect = target.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) reveal(target);
      });
    });

    if (reduced.addEventListener) {
      reduced.addEventListener('change', function () {
        if (reduced.matches) revealAll();
      });
    } else if (reduced.addListener) {
      reduced.addListener(function () {
        if (reduced.matches) revealAll();
      });
    }

    return { restore: revealAll };
  }

  function setupLinkTitles() {
    var timer = 0;
    var timerLink = null;

    function closestLink(node) {
      while (node && node !== document) {
        if (node.nodeType === 1 && node.tagName === 'A' && node.hasAttribute('href')) return node;
        node = node.parentNode;
      }
      return null;
    }

    function usableLink(link) {
      if (!link || !link.hasAttribute('href') || link.hasAttribute('title')) return false;
      var href = (link.getAttribute('href') || '').trim();
      if (!href || href === '#' || /^javascript:/i.test(href)) return false;
      if (link.getAttribute('aria-disabled') === 'true') return false;
      if (link.classList.contains('disabled') || link.classList.contains('is-disabled')) return false;
      if (link.closest('.brand, .nav')) return false;
      return true;
    }

    function readableText(link) {
      var text = (link.innerText || link.textContent || '').replace(/\s+/g, ' ').trim();
      if (text) return text;
      return (link.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim();
    }

    function titleFor(link, text) {
      var href = (link.getAttribute('href') || '').trim();
      var prefix = '前往：';
      var value = text;
      var url = null;

      try {
        url = new URL(href, location.href);
      } catch (error) {
        return '';
      }

      if (href.charAt(0) === '#' && url.pathname === location.pathname && url.search === location.search && url.hash) {
        prefix = '跳至：';
      } else if (/^mailto:/i.test(href)) {
        prefix = '发送邮件至：';
        value = href.slice(7).split('?')[0].trim() || text;
      } else if (link.hasAttribute('download')) {
        prefix = '下载：';
      } else if (/\.(?:zip|rar|7z|pdf|docx?|xlsx?|pptx?|csv|txt)$/i.test(url.pathname)) {
        prefix = '打开文件：';
      } else if (/^https?:$/i.test(url.protocol) && url.origin !== location.origin) {
        prefix = '打开来源：';
      }

      if (!value) return '';
      return Array.from(prefix + value).slice(0, 80).join('');
    }

    function applyTitle(link) {
      timer = 0;
      timerLink = null;
      if (!usableLink(link) || !document.documentElement.contains(link)) return;
      var label = titleFor(link, readableText(link));
      if (label) link.setAttribute('title', label);
    }

    function schedule(link) {
      link = closestLink(link);
      if (!usableLink(link)) return;
      if (timer && timerLink === link) return;
      if (timer) window.clearTimeout(timer);
      timerLink = link;
      timer = window.setTimeout(function () {
        applyTitle(link);
      }, 140);
    }

    function cancel(link) {
      link = closestLink(link);
      if (timerLink !== link) return;
      if (timer) window.clearTimeout(timer);
      timer = 0;
      timerLink = null;
    }

    document.addEventListener('pointerover', function (event) {
      schedule(event.target);
    }, true);

    document.addEventListener('pointerout', function (event) {
      var from = closestLink(event.target);
      var to = closestLink(event.relatedTarget);
      if (from && from !== to) cancel(from);
    }, true);

    document.addEventListener('focusin', function (event) {
      schedule(event.target);
    }, true);

    document.addEventListener('focusout', function (event) {
      cancel(event.target);
    }, true);
  }

  var nav = renderNav();
  repairLogo();
  if (nav) setupMobileNav(nav);
  setupSectionNavigation();
  var portalMotion = setupPortalMotion();
  setupLinkTitles();

  window.addEventListener('pageshow', function (event) {
    if (event.persisted && portalMotion) portalMotion.restore();
  });

  if (!('serviceWorker' in navigator)) return;
  if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') return;

  window.addEventListener('load', function () {
    try {
      var sw = new URL('sw.js', root);
      navigator.serviceWorker.register(sw.href).catch(function () { });
    } catch (e) { }
  });
})();
