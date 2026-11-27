/* 计挑赛四语种入口：点击顶栏入口时先弹出语言选择，不改变当前页面。 */
(function () {
    var triggers = document.querySelectorAll('[data-contest]');
    if (!triggers.length) return;
    var trigger = triggers[0];

    var href = trigger.getAttribute('href') || '计挑赛/index.html';
    var base = href.replace(/index\.html.*$/i, '');
    if (!/\/$/.test(base)) base = base.replace(/[^/]*$/, '');
    var here = location.pathname.replace(/\\/g, '/');

    var langs = [
        { slug: '', name: 'C', sub: 'C 语言', desc: '指针、结构体、文件与基础算法' },
        { slug: 'cpp/', name: 'C++', sub: 'C++17', desc: 'STL、类与模板，兼顾竞赛写法' },
        { slug: 'java/', name: 'Java', sub: 'Java 17', desc: '集合、字符串与面向对象' },
        { slug: 'python/', name: 'Python', sub: 'Python 3', desc: '列表、字典与内置库' }
    ];

    var mask = document.createElement('div');
    mask.className = 'cnav-mask';
    mask.setAttribute('aria-hidden', 'true');
    mask.innerHTML =
        '<div class="cnav-panel" role="dialog" aria-modal="true" aria-label="选择编程语言">' +
        '<div class="cnav-head"><div><span class="cnav-kicker">CONTEST / 计挑赛</span>' +
        '<h2>选择语言题库</h2></div><button class="cnav-close" type="button" aria-label="关闭">×</button></div>' +
        '<div class="cnav-grid">' + langs.map(function (l) {
            var active = here.indexOf('/计挑赛/' + l.slug) >= 0 || (l.slug === '' && /\/计挑赛\/(index|q)\.html$/.test(here));
            return '<a class="cnav-item' + (active ? ' is-current' : '') + '" href="' + base + l.slug + 'index.html">' +
                '<span class="cnav-badge">' + l.name + '</span>' +
                '<span class="cnav-body"><b>' + l.name + '</b><small>' + l.desc + '</small></span>' +
                '<span class="cnav-meta">' + l.sub + (active ? ' · 当前' : '') + '</span></a>';
        }).join('') + '</div>' +
        '<div class="cnav-foot">四套题库共用同一套错题本；切换语言不会丢失本机答题记录。</div></div>';
    document.body.appendChild(mask);

    var panel = mask.querySelector('.cnav-panel');
    var closeBtn = mask.querySelector('.cnav-close');
    var lastFocus = null;

    function open() {
        lastFocus = document.activeElement;
        mask.classList.add('is-open');
        mask.setAttribute('aria-hidden', 'false');
        document.body.classList.add('cnav-lock');
        closeBtn.focus();
    }
    function close() {
        mask.classList.remove('is-open');
        mask.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('cnav-lock');
        if (lastFocus) lastFocus.focus();
    }

    triggers.forEach(function (el) {
        el.addEventListener('click', function (e) {
            e.preventDefault();
            if (mask.classList.contains('is-open')) close(); else open();
        });
    });
    closeBtn.addEventListener('click', close);
    mask.addEventListener('click', function (e) {
        if (!panel.contains(e.target)) close();
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && mask.classList.contains('is-open')) close();
    });

    var css = document.createElement('style');
    css.textContent = [
        '.cnav-mask{position:fixed;inset:0;z-index:120;display:flex;align-items:center;justify-content:center;',
        'padding:24px;background:rgba(26,24,21,.42);backdrop-filter:blur(6px);opacity:0;pointer-events:none;transition:opacity .18s ease}',
        '.cnav-mask.is-open{opacity:1;pointer-events:auto}',
        'body.cnav-lock{overflow:hidden}',
        '.cnav-panel{width:min(680px,100%);max-height:88vh;overflow:auto;background:#faf7f0;color:#26221d;',
        'border:1px solid rgba(38,34,29,.18);box-shadow:0 28px 80px rgba(0,0,0,.28);padding:26px;transform:translateY(10px);transition:transform .22s ease}',
        '.cnav-mask.is-open .cnav-panel{transform:none}',
        '.cnav-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding-bottom:18px;border-bottom:1px solid rgba(38,34,29,.14)}',
        '.cnav-kicker{font:500 10px/1.4 ui-monospace,monospace;letter-spacing:.16em;color:#9c3d28}',
        '.cnav-head h2{margin:7px 0 0;font-size:24px;line-height:1.2;font-weight:600;letter-spacing:.02em}',
        '.cnav-close{flex:none;width:34px;height:34px;border:1px solid rgba(38,34,29,.2);background:transparent;font-size:20px;line-height:1;cursor:pointer;color:#26221d}',
        '.cnav-grid{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:rgba(38,34,29,.14);margin-top:20px;border:1px solid rgba(38,34,29,.14)}',
        '.cnav-item{display:grid;grid-template-columns:auto 1fr;gap:12px;align-items:center;background:#faf7f0;padding:16px 16px 14px;text-decoration:none;color:#26221d;transition:background .16s ease}',
        '.cnav-item:hover,.cnav-item:focus-visible{background:#f1ebdd;outline:none}',
        '.cnav-item.is-current{background:#26221d;color:#f4efe3}',
        '.cnav-badge{width:46px;height:46px;display:grid;place-items:center;border:1px solid currentColor;font:600 12px/1 ui-monospace,monospace;letter-spacing:.02em}',
        '.cnav-body{display:block;min-width:0}',
        '.cnav-body b{display:block;font-size:17px;line-height:1.2;font-weight:600}',
        '.cnav-body small{display:block;margin-top:5px;font-size:12px;line-height:1.5;opacity:.68}',
        '.cnav-meta{grid-column:2;font:10px/1.4 ui-monospace,monospace;letter-spacing:.08em;opacity:.55}',
        '.cnav-item.is-current .cnav-body small,.cnav-item.is-current .cnav-meta{opacity:.8}',
        '.cnav-foot{margin-top:16px;font-size:12px;line-height:1.7;color:#6b6357}',
        '@media(max-width:560px){.cnav-mask{padding:16px}.cnav-panel{padding:20px}.cnav-grid{grid-template-columns:1fr}.cnav-head h2{font-size:20px}}'
    ].join('');
    document.head.appendChild(css);
})();
