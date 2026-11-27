# -*- coding: utf-8 -*-
"""Wire the shared four-language contest switcher into top navigation."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PAGES = [
    'index.html',
    '学习工具/错题本.html',
    '计挑赛/index.html', '计挑赛/q.html',
    '计挑赛/cpp/index.html', '计挑赛/cpp/q.html',
    '计挑赛/java/index.html', '计挑赛/java/q.html',
    '计挑赛/python/index.html', '计挑赛/python/q.html',
]


def prefix_for(rel):
    depth = len(Path(rel).parent.parts)
    return '../' * depth


def main():
    for rel in PAGES:
        path = ROOT / rel
        if not path.exists():
            continue
        text = path.read_text(encoding='utf-8')
        prefix = prefix_for(rel)
        contest_href = prefix + '计挑赛/index.html'
        script_src = prefix + '计挑赛/assets/contest-nav.js'

        # Replace only the first top navigation block (not breadcrumbs/footer links).
        def repl(m):
            block = m.group(0)
            block = re.sub(
                r'<a(?![^>]*data-contest)([^>]*)>真题</a>',
                lambda x: '<a class="contest-link' + (' active' if 'active' in x.group(1) else '') +
                          '" href="' + contest_href + '" data-contest>计挑赛</a>',
                block, count=1)
            return block

        text = re.sub(r'<nav class="nav">.*?</nav>', repl, text, count=1, flags=re.S)
        if 'data-contest' not in text:
            print('SKIP (no nav anchor)', rel)
            continue
        if 'contest-nav.js' not in text:
            text = text.replace('</body>', '    <script src="' + script_src + '"></script>\n</body>')
        path.write_text(text, encoding='utf-8')
        print('wired', rel, '->', contest_href, script_src)


if __name__ == '__main__':
    main()
