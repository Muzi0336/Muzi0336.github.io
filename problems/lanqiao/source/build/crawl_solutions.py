# -*- coding: utf-8 -*-
"""抓取 Dotcpp 题解（blog.dotcpp.com）并按年份写成分片，供题目页展示。

用法：
    python crawl_solutions.py --sample 8      # 只探前 8 道 Dotcpp 题，打印统计，不写文件
    python crawl_solutions.py               # 抓全部 Dotcpp 题，写 exam/data/sol-<年份>.js

题解来源：题面页右栏「我要看题解」→ https://blog.dotcpp.com/tijie/p<题号>/
列表项           → https://blog.dotcpp.com/a/<文章 id>
正文容器         → .article-content .panel-body .article-text
"""
import json, os, re, sys, time, random
import requests
from bs4 import BeautifulSoup

BASE = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))  # problems/lanqiao
DATA = os.path.join(BASE, 'data')
OUT = os.path.join(DATA)
UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36'
H = {'User-Agent': UA, 'Accept-Language': 'zh-CN,zh;q=0.9'}
S = requests.Session()
S.headers.update(H)

MAX_PER_PROBLEM = 5      # 每题最多收录几篇题解（第一页前 N 篇）
MAX_BODY = 4000          # 单篇正文截断长度


def load_catalog():
    raw = open(os.path.join(DATA, 'catalog.js'), encoding='utf-8').read()
    return json.loads(raw.split('=', 1)[1].strip().rstrip(';'))


def get(url, tries=3):
    for i in range(tries):
        try:
            r = S.get(url, timeout=20)
            if r.status_code == 200:
                return r.text
        except Exception as e:
            pass
        time.sleep(1.2 + i)
    return ''


BLOCK = {'p', 'div', 'li', 'ul', 'ol', 'h1', 'h2', 'h3', 'h4', 'section', 'tr'}


def node_text(node):
    """把正文 DOM 转成保留换行的纯文本。br→\n，块级元素→空行，img→![](url)"""
    out = []

    def walk(n):
        if isinstance(n, str):
            out.append(n.replace('\u00a0', ' '))
            return
        name = n.name
        if name == 'br':
            out.append('\n')
            return
        if name == 'img':
            src = n.get('src') or ''
            if src.startswith('/'):
                src = 'https://blog.dotcpp.com' + src
            out.append('![](%s)' % src)
            return
        if name in ('script', 'style'):
            return
        for c in n.children:
            walk(c)
        if name in BLOCK:
            out.append('\n')

    walk(node)
    txt = ''.join(out)
    txt = txt.replace('\r', '')
    txt = re.sub(r'[ \t]+\n', '\n', txt)
    txt = re.sub(r'\n{3,}', '\n\n', txt)
    return txt.strip()


def parse_list(pid, page=1):
    """返回该题某一页的题解列表（每项含 aid/title/date/likes/views）"""
    url = 'https://blog.dotcpp.com/tijie/p%s/' % pid
    if page > 1:
        url += '?page=%d' % page
    html = get(url)
    if not html:
        return [], 0
    soup = BeautifulSoup(html, 'html.parser')
    items = []
    for art in soup.select('article.article-item'):
        a = art.select_one('.article-title a')
        if not a:
            continue
        href = a.get('href') or ''
        m = re.search(r'/a/(\d+)', href)
        if not m:
            continue
        meta = art.select_one('.article-tag')
        tags = meta.get_text(' ', strip=True) if meta else ''
        d = re.search(r'(\d{4})年(\d{2})月(\d{2})日', tags)
        likes = re.search(r'(\d+)\s*点赞', tags)
        views = re.search(r'(\d+)\s*浏览', tags)
        items.append({
            'aid': m.group(1),
            'title': a.get_text(strip=True),
            'date': '%s-%s-%s' % d.groups() if d else '',
            'likes': int(likes.group(1)) if likes else 0,
            'views': int(views.group(1)) if views else 0,
        })
    pages = [int(x) for x in re.findall(r'p%s/?\?[^"\']*page=(\d+)' % pid, html)]
    maxpage = max(pages) if pages else 1
    return items, maxpage


def parse_article(aid):
    html = get('https://blog.dotcpp.com/a/%s' % aid)
    if not html:
        return ''
    soup = BeautifulSoup(html, 'html.parser')
    box = soup.select_one('.article-content .panel-body .article-text')
    if not box:
        return ''
    return node_text(box)


def main():
    sample = 0
    if '--sample' in sys.argv:
        sample = int(sys.argv[sys.argv.index('--sample') + 1])
    cat = load_catalog()
    ids = [p['id'] for p in cat['problems'] if p['src'] == 'dotcpp']
    year_of = {p['id']: p['year'] for p in cat['problems']}
    if sample:
        ids = ids[:sample]

    total_arts = 0
    total_chars = 0
    by_year = {}
    empty = []

    for n, pid in enumerate(ids, 1):
        items, _ = parse_list(pid)
        time.sleep(0.15 + random.random() * 0.15)
        if not items:
            empty.append(pid)
            print('[%d/%d] %s 无题解' % (n, len(ids), pid), flush=True)
            continue
        arts = []
        for it in items[:MAX_PER_PROBLEM]:
            body = parse_article(it['aid'])
            time.sleep(0.15 + random.random() * 0.2)
            if not body:
                continue
            if len(body) > MAX_BODY:
                body = body[:MAX_BODY].rstrip() + '\n\n（正文过长，已截断，全文见原文链接）'
            it['md'] = body
            total_chars += len(body)
            arts.append(it)
        total_arts += len(arts)
        y = year_of[pid]
        by_year.setdefault(y, {})[pid] = arts
        print('[%d/%d] %s → %d 篇, 正文 %d 字' % (n, len(ids), pid, len(arts), sum(len(a['md']) for a in arts)), flush=True)

    print('\n题数 %d，有题解 %d，无题解 %d，文章 %d 篇，正文合计 %.1f 万字，平均 %.0f 字/篇'
          % (len(ids), len(ids) - len(empty), len(empty), total_arts, total_chars / 10000,
             total_chars / max(1, total_arts)))

    if sample:
        print('（采样模式，未写文件）')
        return

    for y, obj in by_year.items():
        fn = 'sol-' + re.sub(r'[^\w\u4e00-\u9fa5]+', '_', y) + '.js'
        path = os.path.join(OUT, fn)
        payload = json.dumps(obj, ensure_ascii=False, separators=(',', ':'))
        open(path, 'w', encoding='utf-8').write('window.LQ_SOL=window.LQ_SOL||{};window.LQ_SOL[%s]=%s;'
                                                % (json.dumps(y, ensure_ascii=False), payload))
        print('写出', fn, len(obj), '题', '%.1f KB' % (os.path.getsize(path) / 1024))


if __name__ == '__main__':
    main()
