/* 全站提示阶梯：未作答时逐层引导，作答后可独立展开全部步骤。 */
(function () {
  var KEY = 'hint.ladder.v2';
  var LEGACY_KEY = 'hint.ladder.v1';

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; }
  }
  function readLegacy() {
    try { return JSON.parse(localStorage.getItem(LEGACY_KEY) || '{}') || {}; } catch (e) { return {}; }
  }
  function write(all) {
    try { localStorage.setItem(KEY, JSON.stringify(all)); } catch (e) { }
  }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }

  function mount(root, opts) {
    if (!root) return null;
    opts = opts || {};
    var key = opts.key || (location.pathname + location.search);
    var steps = opts.steps || [];
    if (!steps.length) return null;
    var all = read();
    var saved = all[key];
    if (!saved) {
      var legacy = readLegacy()[key];
      saved = typeof legacy === 'number' ? { level: legacy, unlocked: false, open: [] } : null;
    }
    if (typeof saved === 'number') saved = { level: saved, unlocked: false, open: [] };
    saved = saved || {};
    var level = clamp(Number(saved.level) || 0, 0, steps.length);
    var unlocked = !!saved.unlocked;
    var openSet = {};
    (Array.isArray(saved.open) ? saved.open : []).forEach(function (n) {
      n = Number(n);
      if (n >= 0 && n < steps.length) openSet[n] = true;
    });

    root.classList.add('hint-ladder');
    root.innerHTML =
      '<div class="hl-top">' +
        '<span class="hl-kicker">HINTS / 提示阶梯</span>' +
        '<span class="hl-note">' + (opts.note || '先自己试，再逐层展开') + '</span>' +
        '<button class="hl-skip" type="button">直接看完整解析</button>' +
      '</div>' +
      steps.map(function (step, i) {
        return '<div class="hl-step" data-i="' + i + '">' +
          '<button class="hl-step-btn" type="button" aria-expanded="false" aria-controls="hl-body-' + i + '">' +
            '<span class="hl-no">' + String(i + 1).padStart(2, '0') + '</span>' +
            '<span class="hl-title">' + (step.title || ('提示 ' + (i + 1))) + '</span>' +
            '<span class="hl-state"></span>' +
          '</button>' +
          '<div class="hl-body" id="hl-body-' + i + '">' + (step.html || '') + '</div>' +
        '</div>';
      }).join('');

    var stepEls = Array.prototype.slice.call(root.querySelectorAll('.hl-step'));
    var skip = root.querySelector('.hl-skip');
    var note = root.querySelector('.hl-note');
    var baseNote = opts.note || '先自己试，再逐层展开';

    function save() {
      all[key] = {
        level: level,
        unlocked: unlocked,
        open: Object.keys(openSet).map(Number).sort(function (a, b) { return a - b; })
      };
      write(all);
    }

    function allOpen() {
      return steps.every(function (_, i) { return !!openSet[i]; });
    }

    function paint() {
      stepEls.forEach(function (el, i) {
        var open = unlocked ? !!openSet[i] : i < level;
        var allowed = unlocked || i <= level;
        el.classList.toggle('is-open', open);
        el.classList.toggle('is-locked', !allowed);
        var btn = el.querySelector('.hl-step-btn');
        var state = el.querySelector('.hl-state');
        btn.disabled = !allowed;
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        state.textContent = open ? '收起' : (allowed ? '展开' : '先过上一层');
      });
      root.classList.toggle('is-unlocked', unlocked);
      if (note) note.textContent = unlocked ? (steps.length === 1 ? '已解锁：解析可展开' : '已解锁：每一步都可以单独展开') : baseNote;
      if (skip) skip.textContent = steps.length === 1 ? (allOpen() ? '收起解析' : '查看解析') : (allOpen() ? '收起全部解析' : '展开全部解析');
    }

    function open(n) {
      n = clamp(Math.round(Number(n) || 0), 0, steps.length);
      if (unlocked) {
        for (var i = 0; i < n; i++) openSet[i] = true;
      } else if (n > level) {
        level = n;
      }
      save();
      paint();
      return level;
    }

    function unlock(options) {
      var expand = typeof options === 'boolean' ? options : !!(options && options.expand);
      unlocked = true;
      level = steps.length;
      if (expand) steps.forEach(function (_, i) { openSet[i] = true; });
      save();
      paint();
      return api;
    }

    function toggle(i) {
      if (!unlocked) return open(i + 1);
      if (openSet[i]) delete openSet[i];
      else openSet[i] = true;
      save();
      paint();
    }

    root.addEventListener('click', function (e) {
      var b = e.target.closest('.hl-step-btn');
      if (b && !b.disabled) {
        var i = Number(b.closest('.hl-step').getAttribute('data-i'));
        toggle(i);
        return;
      }
      if (e.target.closest('.hl-skip')) {
        if (!unlocked) {
          unlock({ expand: true });
        } else if (allOpen()) {
          openSet = {};
          save();
          paint();
        } else {
          steps.forEach(function (_, i) { openSet[i] = true; });
          save();
          paint();
        }
      }
    });

    paint();
    var api = {
      open: open,
      unlock: unlock,
      unlockAll: function () { return unlock({ expand: true }); },
      toggle: toggle,
      level: function () { return level; },
      isUnlocked: function () { return unlocked; },
      reset: function () {
        level = 0;
        unlocked = false;
        openSet = {};
        delete all[key];
        write(all);
        paint();
      }
    };
    return api;
  }

  window.HintLadder = { mount: mount };
})();
