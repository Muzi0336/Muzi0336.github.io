/* 蓝桥真题 · 公共脚本：数据加载、mini-markdown、手敲代码编辑器 */
(function () {
    'use strict';

    var LQ = window.LQ = {};

    // 年份分片直接写 window.LQ_PAGES[year]，先占好位，避免赋值时报 undefined
    window.LQ_PAGES = window.LQ_PAGES || {};

    /* ---------- 基础 ---------- */
    LQ.esc = function (s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    };

    LQ.qs = function (k) {
        return new URLSearchParams(location.search).get(k) || '';
    };

    LQ.STORE = {
        get: function (k, d) {
            try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; }
        },
        set: function (k, v) {
            try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { }
        }
    };

    /* ---------- mini markdown ---------- */
    var KEEP_RE = /<(\/?)(sup|sub|br|u|em|strong|i|b)\s*\/?>/gi;

    function inline(line) {
        var keep = [];
        var s = line.replace(KEEP_RE, function (m) { keep.push(m); return '\u0001' + (keep.length - 1) + '\u0001'; });
        s = LQ.esc(s);
        s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img alt="$1" src="$2" loading="lazy">');
        s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        s = s.replace(/`([^`]+?)`/g, '<code>$1</code>');
        s = s.replace(/\u0001(\d+)\u0001/g, function (m, i) { return keep[+i]; });
        return s;
    }

    function tableHTML(rows) {
        var cells = function (l) {
            l = l.trim().replace(/^\|/, '').replace(/\|$/, '');
            return l.split('|').map(function (c) { return c.trim(); });
        };
        var head = cells(rows[0]);
        var body = rows.slice(1).filter(function (r) { return !/^\s*\|?\s*:?-{2,}/.test(r); });
        var h = '<table><thead><tr>' + head.map(function (c) { return '<th>' + inline(c) + '</th>'; }).join('') + '</tr></thead><tbody>';
        h += body.map(function (r) {
            return '<tr>' + cells(r).map(function (c) { return '<td>' + inline(c) + '</td>'; }).join('') + '</tr>';
        }).join('');
        return h + '</tbody></table>';
    }

    LQ.md = function (text) {
        if (!text) return '';
        var lines = String(text).replace(/\r/g, '').split('\n');
        var out = [], buf = [], i = 0;

        function flush() {
            if (buf.length) {
                var t = buf.join(' ').replace(/\s+/g, ' ').trim();
                if (t) out.push('<p>' + inline(t) + '</p>');
                buf = [];
            }
        }

        while (i < lines.length) {
            var l = lines[i];

            if (!l.trim()) { flush(); i++; continue; }

            if (/^\s*:::/.test(l)) { flush(); i++; continue; }

            if (/^\s*```/.test(l)) {
                flush();
                var code = [];
                i++;
                while (i < lines.length && !/^\s*```/.test(lines[i])) { code.push(lines[i]); i++; }
                i++;
                out.push('<pre class="md-code"><code>' + LQ.esc(code.join('\n')) + '</code></pre>');
                continue;
            }

            if (/^\s*\|/.test(l)) {
                flush();
                var rows = [l];
                i++;
                while (i < lines.length && /\|/.test(lines[i]) && lines[i].trim()) { rows.push(lines[i]); i++; }
                out.push(tableHTML(rows));
                continue;
            }

            if (/^\s*(?:[-*]|\d+\.)\s+/.test(l)) {
                flush();
                var ordered = /^\s*\d+\./.test(l);
                var items = [];
                while (i < lines.length && /^\s*(?:[-*]|\d+\.)\s+/.test(lines[i])) {
                    items.push(lines[i].replace(/^\s*(?:[-*]|\d+\.)\s+/, ''));
                    i++;
                }
                out.push('<' + (ordered ? 'ol' : 'ul') + '>' + items.map(function (x) {
                    return '<li>' + inline(x.trim()) + '</li>';
                }).join('') + '</</' + (ordered ? 'ol' : 'ul') + '>');
                continue;
            }

            buf.push(l.trim());
            i++;
        }
        flush();
        return out.join('\n');
    };

    /* ---------- KaTeX ---------- */
    LQ.renderMath = function (root) {
        if (!window.renderMathInElement) return;
        try {
            window.renderMathInElement(root || document.body, {
                delimiters: [
                    { left: '$$', right: '$$', display: true },
                    { left: '$', right: '$', display: false },
                    { left: '\\(', right: '\\)', display: false },
                    { left: '\\[', right: '\\]', display: true }
                ],
                throwOnError: false,
                ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code']
            });
        } catch (e) { }
    };

    /* ---------- 数据 ---------- */
    LQ.CAT = null;
    LQ.YEARS = {};

    LQ.catalog = function () {
        if (!LQ.CAT) LQ.CAT = window.LQ_CATALOG || { years: [], papers: [], problems: [] };
        return LQ.CAT;
    };

    LQ.loadYear = function (year) {
        if (LQ.YEARS[year]) return Promise.resolve(LQ.YEARS[year]);
        return new Promise(function (res, rej) {
            var s = document.createElement('script');
            s.src = 'data/p-' + year + '.js';
            s.onload = function () {
                var pack = (window.LQ_PAGES || {})[year] || {};
                LQ.YEARS[year] = pack;
                res(pack);
            };
            s.onerror = function () { rej(new Error('分片加载失败：' + year)); };
            document.head.appendChild(s);
        });
    };

    // 题解分片（Dotcpp 博客），按年份懒加载；缺文件按「无题解」处理
    LQ.SOLS = {};
    LQ.loadSol = function (year) {
        if (LQ.SOLS[year]) return Promise.resolve(LQ.SOLS[year]);
        return new Promise(function (res) {
            var s = document.createElement('script');
            s.src = 'data/sol-' + year + '.js';
            s.onload = function () {
                var pack = (window.LQ_SOL || {})[year] || {};
                LQ.SOLS[year] = pack;
                res(pack);
            };
            s.onerror = function () { LQ.SOLS[year] = {}; res({}); };
            document.head.appendChild(s);
        });
    };

    LQ.problem = function (id) {
        var c = LQ.catalog();
        var row = c.problems.filter(function (p) { return p.id === id; })[0];
        if (!row) return Promise.reject(new Error('没有这道题：' + id));
        return LQ.loadYear(row.year).then(function (pack) {
            var full = pack[id];
            if (!full) throw new Error('分片里没有这道题：' + id);
            return full;
        });
    };

    LQ.paper = function (id) {
        return LQ.catalog().papers.filter(function (p) { return p.id === id; })[0] || null;
    };

    LQ.labels = {
        diff: function (d) {
            var cls = { '入门': 'd0', '简单': 'd1', '中等': 'd2', '困难': 'd3' }[d] || 'd0';
            return '<span class="diff-tag ' + cls + '">' + LQ.esc(d || '未评定') + '</span>';
        },
        src: function (s) {
            return s === 'luogu'
                ? '<span class="src-tag lg">洛谷</span>'
                : '<span class="src-tag">Dotcpp</span>';
        }
    };

    LQ.pct = function (p, from) {
        if (p == null) return '—';
        return p.toFixed(2).replace(/\.?0+$/, '') + '%';
    };

    LQ.groupText = function (tracks) {
        return (tracks || []).join(' · ') || '未标注';
    };

    // 把 "C/C++ 大学A组" 拆成科目与组别
    LQ.trackParts = function (tracks) {
        var subs = [], groups = [];
        (tracks || []).forEach(function (t) {
            var m = String(t).match(/^(C\/C\+\+|C\+\+|Python|Java)\s*(.*)$/);
            if (m) {
                if (m[1]) subs.push(m[1]);
                if (m[2]) groups.push(m[2]);
            } else if (t) {
                subs.push(t);
            }
        });
        function uniq(a) {
            var out = [];
            a.forEach(function (x) { if (out.indexOf(x) < 0) out.push(x); });
            return out;
        }
        return {
            subject: uniq(subs).join(' / ') || '未标注',
            group: uniq(groups).join(' / ') || '—'
        };
    };

    // 题号写法：Dotcpp 加 #，洛谷保留 P 号
    LQ.numText = function (p) {
        return p.src === 'luogu' ? String(p.id) : '#' + p.id;
    };

    /* ---------- 复制 ---------- */
    LQ.copy = function (text, btn) {
        var done = function () {
            if (!btn) return;
            var old = btn.textContent;
            btn.textContent = '已复制';
            setTimeout(function () { btn.textContent = old; }, 1400);
        };
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(done).catch(function () { fallback(); });
        } else fallback();

        function fallback() {
            var ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            try { document.execCommand('copy'); done(); } catch (e) { }
            document.body.removeChild(ta);
        }
    };

    /* ---------- 手敲代码编辑器（同计挑赛形态） ---------- */
    var KW = {
        cpp: [
            ['int', '整型'], ['long', '长整型'], ['long long', '64 位整型'], ['char', '字符'], ['float', '单精度'],
            ['double', '双精度'], ['void', '无返回'], ['bool', '布尔'], ['const', '只读'], ['auto', '自动推导'],
            ['include', '包含头文件'], ['using', '命名空间'], ['namespace', '命名空间'], ['std', '标准库命名空间'],
            ['return', '返回'], ['if', '条件'], ['else', '否则'], ['for', '循环'], ['while', '循环'],
            ['do', '循环'], ['switch', '分支'], ['case', '分支'], ['break', '跳出'], ['continue', '继续'],
            ['struct', '结构体'], ['class', '类'], ['template', '模板'], ['static', '静态'], ['inline', '内联'],
            ['cin', '标准输入'], ['cout', '标准输出'], ['endl', '换行'], ['printf', '格式化输出'], ['scanf', '格式化输入'],
            ['vector', '动态数组'], ['string', '字符串'], ['pair', '二元组'], ['map', '有序映射'], ['unordered_map', '哈希映射'],
            ['set', '有序集合'], ['multiset', '多重集合'], ['queue', '队列'], ['priority_queue', '优先队列'],
            ['stack', '栈'], ['deque', '双端队列'], ['sort', '排序'], ['reverse', '翻转'], ['unique', '去重'],
            ['lower_bound', '下界'], ['upper_bound', '上界'], ['max', '最大值'], ['min', '最小值'], ['abs', '绝对值'],
            ['swap', '交换'], ['memset', '填充'], ['push_back', '尾插'], ['size', '元素个数'], ['begin', '首迭代器'],
            ['end', '尾迭代器'], ['first', '首元素'], ['second', '次元素'], ['make_pair', '构造二元组'],
            ['gcd', '最大公约数'], ['sqrt', '开方'], ['pow', '幂'], ['INT_MAX', 'int 上界'], ['INT_MIN', 'int 下界'],
            ['LLONG_MAX', 'long long 上界'], ['ios', '输入输出流'], ['sync_with_stdio', '关闭同步'], ['tie', '绑定']
        ],
        c: [
            ['int', '整型'], ['char', '字符'], ['float', '单精度'], ['double', '双精度'], ['void', '无类型'],
            ['long', '长整型'], ['short', '短整型'], ['unsigned', '无符号'], ['signed', '有符号'],
            ['const', '只读'], ['static', '静态'], ['struct', '结构体'], ['union', '共用体'], ['enum', '枚举'],
            ['typedef', '类型别名'], ['sizeof', '长度运算符'], ['return', '返回'], ['if', '条件'], ['else', '否则'],
            ['for', '循环'], ['while', '循环'], ['do', '循环'], ['switch', '分支'], ['case', '分支'],
            ['default', '默认'], ['break', '跳出'], ['continue', '继续'], ['main', '主函数'], ['include', '包含头文件'],
            ['define', '宏定义'], ['printf', '格式化输出'], ['scanf', '格式化输入'], ['puts', '输出字符串'],
            ['gets', '读入字符串'], ['getchar', '读字符'], ['putchar', '输出字符'], ['fgets', '读一行'],
            ['fopen', '打开文件'], ['fclose', '关闭文件'], ['malloc', '申请内存'], ['calloc', '申请并清零'],
            ['realloc', '调整内存'], ['free', '释放内存'], ['strlen', '字符串长度'], ['strcpy', '复制字符串'],
            ['strcat', '拼接字符串'], ['strcmp', '比较字符串'], ['strstr', '查找子串'], ['memset', '填充'],
            ['memcpy', '内存拷贝'], ['qsort', '快速排序'], ['atoi', '转整数'], ['sprintf', '格式化到字符串'],
            ['abs', '绝对值'], ['sqrt', '开方'], ['pow', '幂'], ['isdigit', '是否数字'], ['isalpha', '是否字母'],
            ['toupper', '转大写'], ['tolower', '转小写'], ['EOF', '文件结束'], ['NULL', '空指针'],
            ['stdio', '标准输入输出头文件'], ['string', '字符串头文件'], ['math', '数学头文件']
        ],
        py: [
            ['print', '输出'], ['input', '读入一行'], ['int', '转整数'], ['str', '转字符串'], ['float', '转小数'],
            ['list', '列表'], ['dict', '字典'], ['set', '集合'], ['tuple', '元组'], ['bool', '布尔'],
            ['len', '长度'], ['range', '整数序列'], ['enumerate', '带下标遍历'], ['zip', '并行遍历'],
            ['sorted', '排序'], ['sum', '求和'], ['max', '最大值'], ['min', '最小值'], ['abs', '绝对值'],
            ['map', '映射'], ['filter', '过滤'], ['reversed', '反转'], ['open', '打开文件'],
            ['def', '定义函数'], ['return', '返回'], ['if', '条件'], ['elif', '否则如果'], ['else', '否则'],
            ['for', '循环'], ['while', '循环'], ['in', '成员判断'], ['not', '取反'], ['and', '与'], ['or', '或'],
            ['break', '跳出'], ['continue', '继续'], ['import', '导入模块'], ['from', '从模块导入'],
            ['class', '定义类'], ['lambda', '匿名函数'], ['try', '捕获异常'], ['except', '异常分支'],
            ['sys', '系统模块'], ['stdin', '标准输入'], ['readline', '读一行'], ['split', '切分'],
            ['strip', '去空白'], ['append', '追加'], ['join', '拼接'], ['count', '计数'], ['index', '下标'],
            ['format', '格式化'], ['math', '数学模块'], ['inf', '无穷'], ['None', '空值']
        ]
    };

    var SAMPLE_BY_LANG = {
        cpp: '#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    \n    return 0;\n}\n',
        c: '#include <stdio.h>\n\nint main() {\n    \n    return 0;\n}\n',
        py: 'import sys\n\n\ndef main():\n    \n\nmain()\n'
    };

    LQ.editorLangs = { cpp: 'C++17', c: 'C11', py: 'Python 3' };

    /**
     * 挂载编辑器
     * @param {Object} opt {mount, key, lang, sample}
     */
    LQ.mountEditor = function (opt) {
        var mount = opt.mount;
        if (!mount) return;
        var lang = opt.lang || 'cpp';
        var key = 'lq.code.' + opt.key;

        function draw() {
            mount.innerHTML = [
                '<div class="ed-head">',
                '  <span class="k">MY CODE <span style="color:var(--muted)">/ 手敲代码</span></span>',
                '  <div class="langs" id="edLangs">',
                Object.keys(LQ.editorLangs).map(function (k) {
                    return '<button data-lang="' + k + '" class="' + (k === lang ? 'on' : '') + '">' + LQ.editorLangs[k] + '</button>';
                }).join(''),
                '  </div>',
                '  <span class="sp"></span>',
                '  <span class="st" id="edState">自动保存</span>',
                '  <button id="edSample">插入模板</button>',
                '  <button id="edCopy">复制草稿</button>',
                '  <button id="edClear">清空</button>',
                '</div>',
                '<div class="ed-wrap">',
                '  <textarea id="ed" spellcheck="false" placeholder="在这里手敲代码，内容只存在本机浏览器，不会上传、也不会评测。"></textarea>',
                '  <div class="ac" id="ac"></div>',
                '</div>',
                '<div class="ed-foot">',
                '  <span>Tab 缩进 · 括号自动配对 · ↑↓ 选择补全 · Tab / Enter 接受 · 不运行、不判题</span>',
                '  <span id="edCount">0 字符</span>',
                '</div>'
            ].join('');

            var ed = mount.querySelector('#ed');
            var ac = mount.querySelector('#ac');
            var stateEl = mount.querySelector('#edState');
            var countEl = mount.querySelector('#edCount');
            var candidates = [], sel = 0, timer = null;

            var storeKey = key + '.' + lang;
            ed.value = localStorage.getItem(storeKey) || '';
            count();

            function count() { countEl.textContent = ed.value.length + ' 字符'; }
            function save() {
                try { localStorage.setItem(storeKey, ed.value); } catch (e) { }
                stateEl.textContent = '已保存 · ' + new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
            }
            function soft() {
                stateEl.textContent = '输入中…';
                clearTimeout(timer);
                timer = setTimeout(save, 500);
            }

            function caret() {
                var mirror = document.createElement('div');
                var cs = getComputedStyle(ed);
                ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'paddingTop',
                    'paddingLeft', 'paddingRight', 'borderTopWidth', 'borderLeftWidth', 'whiteSpace',
                    'wordBreak', 'tabSize'].forEach(function (p) { mirror.style[p] = cs[p]; });
                mirror.style.position = 'absolute';
                mirror.style.visibility = 'hidden';
                mirror.style.top = '0';
                mirror.style.left = '0';
                mirror.style.width = ed.clientWidth + 'px';
                mirror.style.whiteSpace = 'pre-wrap';
                mirror.textContent = ed.value.slice(0, ed.selectionStart);
                var marker = document.createElement('span');
                marker.textContent = '\u200b';
                mirror.appendChild(marker);
                ed.parentNode.appendChild(mirror);
                var r = marker.getBoundingClientRect();
                var wr = ed.parentNode.getBoundingClientRect();
                var top = r.top - wr.top + parseFloat(cs.lineHeight) + 2;
                var left = Math.min(r.left - wr.left, ed.clientWidth - 240);
                mirror.remove();
                return { top: top, left: Math.max(6, left) };
            }

            function hideAC() { ac.classList.remove('show'); ac.innerHTML = ''; }

            function showAC() {
                var before = ed.value.slice(0, ed.selectionStart);
                var m = before.match(/[A-Za-z_][A-Za-z0-9_]*$/);
                if (!m) return hideAC();
                var pre = m[0].toLowerCase();
                var table = KW[lang] || KW.cpp;
                var HIGH = table.slice(0, 24).map(function (k) { return k[0]; });
                var rank = function (w) { var i = HIGH.indexOf(w); return i < 0 ? 99 : i; };
                candidates = table
                    .filter(function (k) { return k[0].toLowerCase().indexOf(pre) === 0 && k[0].toLowerCase() !== pre; })
                    .sort(function (a, b) { return rank(a[0]) - rank(b[0]) || a[0].length - b[0].length; })
                    .slice(0, 8);
                if (!candidates.length) return hideAC();
                sel = 0;
                var pos = caret();
                ac.style.top = pos.top + 'px';
                ac.style.left = pos.left + 'px';
                ac.classList.add('show');
                ac.innerHTML = candidates.map(function (k, i) {
                    return '<div class="item ' + (i === 0 ? 'sel' : '') + '" data-i="' + i + '"><span>' + LQ.esc(k[0]) + '</span><span class="hint">' + LQ.esc(k[1]) + '</span></div>';
                }).join('');
                Array.prototype.forEach.call(ac.querySelectorAll('.item'), function (el) {
                    el.addEventListener('mousedown', function (ev) { ev.preventDefault(); accept(+el.dataset.i); });
                });
            }

            function highlight(i) {
                Array.prototype.forEach.call(ac.querySelectorAll('.item'), function (el, n) {
                    el.classList.toggle('sel', n === i);
                });
            }

            function accept(i) {
                var w = candidates[i];
                if (!w) return hideAC();
                var before = ed.value.slice(0, ed.selectionStart);
                var m = before.match(/[A-Za-z_][A-Za-z0-9_]*$/);
                if (!m) return hideAC();
                var start = ed.selectionStart - m[0].length;
                ed.value = ed.value.slice(0, start) + w[0] + ed.value.slice(ed.selectionStart);
                ed.selectionStart = ed.selectionEnd = start + w[0].length;
                hideAC();
                soft(); count(); ed.focus();
            }

            ed.addEventListener('input', function () { count(); soft(); showAC(); });
            ed.addEventListener('click', hideAC);
            ed.addEventListener('blur', function () { setTimeout(hideAC, 120); });

            ed.addEventListener('keydown', function (e) {
                var open = ac.classList.contains('show');
                if (open) {
                    if (e.key === 'ArrowDown') { e.preventDefault(); sel = (sel + 1) % candidates.length; highlight(sel); return; }
                    if (e.key === 'ArrowUp') { e.preventDefault(); sel = (sel - 1 + candidates.length) % candidates.length; highlight(sel); return; }
                    if (e.key === 'Tab' || (e.key === 'Enter' && !e.shiftKey)) { e.preventDefault(); accept(sel); return; }
                    if (e.key === 'Escape') { e.preventDefault(); hideAC(); return; }
                }
                if (e.key === 'Tab') {
                    e.preventDefault();
                    var s = ed.selectionStart, t = ed.selectionEnd;
                    if (e.shiftKey) {
                        var ls = ed.value.lastIndexOf('\n', s - 1) + 1;
                        var mm = ed.value.slice(ls, s).match(/^ {1,4}/);
                        if (mm) {
                            ed.value = ed.value.slice(0, ls) + ed.value.slice(ls + mm[0].length);
                            ed.selectionStart = ed.selectionEnd = s - mm[0].length;
                        }
                    } else {
                        ed.value = ed.value.slice(0, s) + '    ' + ed.value.slice(t);
                        ed.selectionStart = ed.selectionEnd = s + 4;
                    }
                    soft(); count(); return;
                }
                if (e.key === 'Enter') {
                    e.preventDefault();
                    var p = ed.selectionStart;
                    var before = ed.value.slice(0, p);
                    var lineStart = before.lastIndexOf('\n') + 1;
                    var line = before.slice(lineStart);
                    var indent = (line.match(/^\s*/) || [''])[0];
                    var ch = ed.value[p] || '';
                    if (line.trim().endsWith('{') || line.trim().endsWith(':')) indent += '    ';
                    if (ch === '}' || ch === ')' || ch === ']') {
                        ed.value = ed.value.slice(0, p) + '\n' + indent + '\n' + (line.match(/^\s*/) || [''])[0] + ed.value.slice(p);
                        ed.selectionStart = ed.selectionEnd = p + 1 + indent.length;
                    } else {
                        ed.value = ed.value.slice(0, p) + '\n' + indent + ed.value.slice(ed.selectionEnd);
                        ed.selectionStart = ed.selectionEnd = p + 1 + indent.length;
                    }
                    soft(); count(); hideAC(); return;
                }
                var pairs = { '(': ')', '[': ']', '{': '}', '"': '"', "'": "'" };
                if (pairs[e.key]) {
                    var a = ed.selectionStart, b = ed.selectionEnd;
                    if (a !== b) return;
                    e.preventDefault();
                    ed.value = ed.value.slice(0, a) + e.key + pairs[e.key] + ed.value.slice(b);
                    ed.selectionStart = ed.selectionEnd = a + 1;
                    soft(); count(); return;
                }
                if (e.key === 'Backspace') {
                    var q = ed.selectionStart;
                    var prev = ed.value[q - 1], next = ed.value[q];
                    if (prev && next && pairs[prev] === next && q === ed.selectionEnd) {
                        e.preventDefault();
                        ed.value = ed.value.slice(0, q - 1) + ed.value.slice(q + 1);
                        ed.selectionStart = ed.selectionEnd = q - 1;
                        soft(); count();
                    }
                }
            });

            mount.querySelector('#edSample').addEventListener('click', function () {
                if (!ed.value.trim() || confirm('用当前语言的模板覆盖草稿？现有内容会被替换。')) {
                    ed.value = SAMPLE_BY_LANG[lang] || '';
                    save(); count(); ed.focus();
                }
            });
            mount.querySelector('#edClear').addEventListener('click', function () {
                if (!ed.value.trim() || confirm('清空这道题的手写代码？')) {
                    ed.value = ''; save(); count(); ed.focus();
                }
            });
            mount.querySelector('#edCopy').addEventListener('click', function () {
                LQ.copy(ed.value, mount.querySelector('#edCopy'));
            });
            Array.prototype.forEach.call(mount.querySelectorAll('#edLangs button'), function (btn) {
                btn.addEventListener('click', function () {
                    save();
                    lang = btn.dataset.lang;
                    opt.lang = lang;
                    draw();
                });
            });
        }

        draw();
    };

    /* ---------- 语言推断 ---------- */
    LQ.guessLang = function (tracks) {
        var t = (tracks || []).join(' ');
        if (/Python/i.test(t)) return 'py';
        if (/C\+\+/.test(t)) return 'cpp';
        if (/\bC\b/.test(t) && !/C\+\+/.test(t)) return 'c';
        return 'cpp';
    };
})();
