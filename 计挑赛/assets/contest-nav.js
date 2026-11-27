/* 计挑赛四语种入口：在页面顶部显示静态切换条，不使用浮层。 */
(function () {
    var script = document.currentScript;
    if (!script) return;
    var here = decodeURIComponent(location.pathname).replace(/\\/g, '/');
    if (!/\/计挑赛\//.test(here)) return;

    var base = script.src.replace(/assets\/contest-nav\.js.*$/i, '');
    var current = /\/cpp\//.test(here) ? 'cpp'
        : /\/java\//.test(here) ? 'java'
        : /\/python\//.test(here) ? 'python'
        : 'c';

    var langs = [
        { slug: 'c', href: 'index.html', name: 'C', meta: '215 道', desc: '语言基础' },
        { slug: 'cpp', href: 'cpp/index.html', name: 'C++', meta: '212 道', desc: 'STL 与竞赛' },
        { slug: 'java', href: 'java/index.html', name: 'Java', meta: '215 道', desc: '集合与面向对象' },
        { slug: 'python', href: 'python/index.html', name: 'Python', meta: '198 道', desc: '列表与内置库' }
    ];

    var bar = document.createElement('div');
    bar.className = 'contest-switch';
    bar.innerHTML = '<span class="cs-label">计挑赛 <em>/</em> 题库</span>' +
        '<div class="cs-links">' + langs.map(function (l) {
            var active = l.slug === current;
            return '<a class="cs-link' + (active ? ' is-current' : '') + '" href="' + base + l.href + '">' +
                '<b>' + l.name + '</b><strong>' + l.meta + '</strong><small>' + l.desc + '</small></a>';
        }).join('') + '</div>';

    var main = document.querySelector('main');
    if (!main || !main.parentNode) return;
    main.parentNode.insertBefore(bar, main);

    var css = document.createElement('style');
    css.textContent = [
        '.contest-switch{max-width:1180px;margin:0 auto;padding:14px 24px 12px;display:flex;align-items:center;gap:14px;flex-wrap:wrap;box-sizing:border-box;position:sticky;top:88px;z-index:40;background:#faf7f0}',
        '.cs-label{font:500 10px/1.4 ui-monospace,monospace;letter-spacing:.14em;color:#8a8174;white-space:nowrap}',
        '.cs-label em{font-style:normal;color:#b8b0a2}',
        '.cs-links{display:flex;gap:1px;background:rgba(38,34,29,.13);border:1px solid rgba(38,34,29,.13)}',
        '.cs-link{display:grid;grid-template-columns:auto auto;align-items:baseline;gap:2px 7px;padding:7px 12px 6px;background:#faf7f0;color:#26221d;text-decoration:none;transition:background .16s ease,color .16s ease}',
        '.cs-link:hover,.cs-link:focus-visible{background:#f0e9db;outline:none}',
        '.cs-link.is-current{background:#26221d;color:#f4efe3}',
        '.cs-link b{font:600 13px/1.2 ui-monospace,monospace}',
        '.cs-link strong{font:500 9px/1 ui-monospace,monospace;letter-spacing:.04em;opacity:.55}',
        '.cs-link small{grid-column:1/-1;font-size:10px;line-height:1.3;opacity:.58;white-space:nowrap}',
        '.cs-link.is-current small,.cs-link.is-current strong{opacity:.82}',
        '@media(max-width:640px){.contest-switch{padding:10px 16px 9px;gap:8px;top:64px}.cs-label{width:100%}.cs-links{width:100%;display:grid;grid-template-columns:1fr 1fr}.cs-link small{display:none}}'
    ].join('');
    document.head.appendChild(css);
})();
