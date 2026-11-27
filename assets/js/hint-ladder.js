/* 全站提示阶梯：key 独立保存展开层级，不自动展开下一层 */
(function () {
  var KEY = 'hint.ladder.v1';

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; }
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
    var level = clamp(Number(all[key]) || 0, 0, steps.length);

    root.classList.add('hint-ladder');
    root.innerHTML =
      '<div class="hl-top">' +
        '<span class="hl-kicker">HINTS / 提示阶梯</span>' +
        '<span class="hl-note">' + (opts.note || '先自己试，再逐层展开') + '</span>' +
        (steps.length ? '<button class="hl-skip" type="button">直接看完整解析</button>' : '') +
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

    function paint() {
      stepEls.forEach(function (el, i) {
        var open = i < level;
        var allowed = i <= level;
        el.classList.toggle('is-open', open);
        el.classList.toggle('is-locked', !allowed);
        var btn = el.querySelector('.hl-step-btn');
        var state = el.querySelector('.hl-state');
        btn.disabled = !allowed;
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        state.textContent = open ? '已展开' : (allowed ? '展开' : '先过上一层');
      });
      if (skip) skip.hidden = level >= steps.length;
    }

    function open(n) {
      n = clamp(Math.round(Number(n) || 0), 0, steps.length);
      if (n <= level) return level;
      level = n;
      all[key] = level;
      write(all);
      paint();
      return level;
    }

    root.addEventListener('click', function (e) {
      var b = e.target.closest('.hl-step-btn');
      if (b && !b.disabled) {
        var i = Number(b.closest('.hl-step').getAttribute('data-i'));
        open(i + 1);
        return;
      }
      if (e.target.closest('.hl-skip')) open(steps.length);
    });

    paint();
    return {
      open: open,
      level: function () { return level; },
      reset: function () { level = 0; delete all[key]; write(all); paint(); }
    };
  }

  window.HintLadder = { mount: mount };
})();
