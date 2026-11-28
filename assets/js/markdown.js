/* 全站轻量 Markdown 渲染：AI 回复、蓝桥题解共用。 */
(function () {
    'use strict';
    if (window.SiteMD) return;

    var KEEP_RE = /<(\/?)(sup|sub|br|u|em|strong|i|b)\s*\/?>/gi;

    function esc(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function safeUrl(url) {
        return /^(?:https?:)?\/\//i.test(url) || /^[./#]/.test(url);
    }

    function inline(line, opt) {
        opt = opt || {};
        var keep = [];
        var s = String(line == null ? '' : line);

        if (opt.keepHtml) {
            s = s.replace(KEEP_RE, function (m) {
                keep.push(m);
                return '\u0001' + (keep.length - 1) + '\u0001';
            });
        }
        s = esc(s);

        var stash = [];
        s = s.replace(/`([^`\n]+)`/g, function (_, code) {
            stash.push('<code>' + code + '</code>');
            return '\u0002' + (stash.length - 1) + '\u0002';
        });

        if (opt.images) {
            s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, function (_, alt, src) {
                if (!safeUrl(src)) return alt;
                return '<img alt="' + alt + '" src="' + src + '" loading="lazy">';
            });
        }
        if (opt.links !== false) {
            s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,
                '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
        }
        s = s.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
        if (opt.strike !== false) s = s.replace(/~~([^~\n]+)~~/g, '<del>$1</del>');

        s = s.replace(/\u0001(\d+)\u0001/g, function (_, i) { return keep[Number(i)]; });
        s = s.replace(/\u0002(\d+)\u0002/g, function (_, i) { return stash[Number(i)]; });
        return s;
    }

    function splitRow(line) {
        var t = line.trim();
        if (t.charAt(0) === '|') t = t.slice(1);
        if (t.charAt(t.length - 1) === '|') t = t.slice(0, -1);
        var cells = [];
        var cur = '';
        var inCode = false;
        for (var i = 0; i < t.length; i++) {
            var ch = t.charAt(i);
            if (ch === '`') inCode = !inCode;
            if (ch === '|' && !inCode) {
                cells.push(cur.trim());
                cur = '';
            } else {
                cur += ch;
            }
        }
        cells.push(cur.trim());
        return cells;
    }

    function isSeparator(line) {
        return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
    }

    function table(rows, opt) {
        var head = splitRow(rows[0]);
        var body = rows.slice(1).filter(function (r) { return !isSeparator(r); });
        return '<div class="md-table-wrap"><table><thead><tr>' +
            head.map(function (c) { return '<th>' + inline(c, opt) + '</th>'; }).join('') +
            '</tr></thead><tbody>' +
            body.map(function (r) {
                return '<tr>' + splitRow(r).map(function (c) {
                    return '<td>' + inline(c, opt) + '</td>';
                }).join('') + '</tr>';
            }).join('') +
            '</tbody></table></div>';
    }

    function render(text, opt) {
        opt = opt || {};
        var lines = String(text == null ? '' : text).replace(/\r\n?/g, '\n').split('\n');
        var out = [];
        var para = [];
        var list = null;
        var code = null;

        function flushPara() {
            if (!para.length) return;
            var html = opt.lineBreaks
                ? para.map(function (line) { return inline(line, opt); }).join('<br>')
                : inline(para.join(' ').replace(/\s+/g, ' ').trim(), opt);
            if (html) out.push('<p>' + html + '</p>');
            para = [];
        }
        function closeList() {
            if (list) {
                out.push('</' + list + '>');
                list = null;
            }
        }
        function flushAll() { flushPara(); closeList(); }

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];

            if (code) {
                if (/^\s*```/.test(line)) {
                    out.push('<pre class="md-code"><code>' + esc(code.join('\n')) + '</code></pre>');
                    code = null;
                } else {
                    code.push(line);
                }
                continue;
            }
            if (/^\s*```/.test(line)) {
                flushAll();
                code = [];
                continue;
            }
            if (!line.trim()) {
                flushAll();
                continue;
            }
            if (opt.directives && /^\s*:::/.test(line)) {
                flushAll();
                continue;
            }

            var isTable = opt.tableLoose
                ? /^\s*\|/.test(line) && i + 1 < lines.length && /\|/.test(lines[i + 1])
                : line.indexOf('|') >= 0 && i + 1 < lines.length && isSeparator(lines[i + 1]);
            if (isTable) {
                flushAll();
                var rows = [line];
                var j = i + 1;
                while (j < lines.length && /\|/.test(lines[j]) && lines[j].trim()) {
                    rows.push(lines[j]);
                    j++;
                }
                out.push(table(rows, opt));
                i = j - 1;
                continue;
            }

            var h = opt.headings && /^(#{1,6})\s+(.+)$/.exec(line);
            if (h) {
                flushAll();
                out.push('<h4>' + inline(h[2], opt) + '</h4>');
                continue;
            }
            if (/^\s*(?:---+|\*\*\*+)\s*$/.test(line)) {
                flushAll();
                out.push('<hr>');
                continue;
            }

            var ul = /^\s*[-*+]\s+(.+)$/.exec(line);
            if (ul) {
                flushPara();
                if (list && list !== 'ul') closeList();
                if (!list) { out.push('<ul>'); list = 'ul'; }
                out.push('<li>' + inline(ul[1], opt) + '</li>');
                continue;
            }

            var ol = /^\s*\d+[.)]\s+(.+)$/.exec(line);
            if (ol) {
                flushPara();
                if (list && list !== 'ol') closeList();
                if (!list) { out.push('<ol>'); list = 'ol'; }
                out.push('<li>' + inline(ol[1], opt) + '</li>');
                continue;
            }

            if (/^\s*>\s?/.test(line)) {
                flushAll();
                out.push('<blockquote>' + inline(line.replace(/^\s*>\s?/, ''), opt) + '</blockquote>');
                continue;
            }

            if (list) closeList();
            para.push(line);
        }

        if (code) out.push('<pre class="md-code"><code>' + esc(code.join('\n')) + '</code></pre>');
        flushAll();
        return out.join('\n');
    }

    window.SiteMD = {
        esc: esc,
        inline: inline,
        render: render
    };
})();
