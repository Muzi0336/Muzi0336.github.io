# -*- coding: utf-8 -*-
"""第 0 层：把 Dotcpp + 洛谷合成的本地真题，统一成单一题源。
输出 ../data/catalog.js（轻量索引） + ../data/p-<year>.js（按年分片全文）
"""
import json, os, re, glob, hashlib
from bs4 import BeautifulSoup

BASE = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))  # 指向 problems/lanqiao/
REPO_ROOT = os.path.dirname(os.path.dirname(BASE))
EXAM = BASE
DATA = os.path.join(BASE, 'data')
IMG = os.path.join(BASE, 'images')
CACHE = os.path.join(REPO_ROOT, '.cache', 'lanqiao', 'problems')  # 可选：Dotcpp 题面 HTML 缓存，缺失则跳过样例补全
BUILD_CACHE = os.path.join(REPO_ROOT, '.cache', 'lanqiao', 'build')
DIFF_CACHE = os.path.join(BUILD_CACHE, 'diffmap.json')  # 可选：本地难度映射缓存
os.makedirs(DATA, exist_ok=True)

DUP = {'1023', '1024'}
STAGES = ('省赛', '决赛', '国赛', '省赛及国赛')


def parse_set(title):
    lang = grp = ''
    g = re.search(r'(C/C\+\+|C\+\+|Python|Java)\s*(研究生|大学A|大学B|大学C|大学)[组]?', title)
    if g:
        lang = 'C++' if g.group(1) in ('C/C++', 'C++') else g.group(1)
        grp = g.group(2) + '组'
    if '及以前' in title:
        yq = '2012年及以前'
    else:
        y = re.search(r'(\d{4})年', title); j = re.search(r'第[一二三四五六七八九十]+届', title)
        yq = f'{y.group(1)}年{j.group(0)}' if (y and j) else (f'{y.group(1)}年' if y else '其他')
    stage = ''
    if '决赛' in title: stage = '决赛'
    elif '省赛' in title and '国赛' in title: stage = '省赛及国赛'
    elif '国赛' in title: stage = '国赛'
    elif '省赛' in title: stage = '省赛'
    if '第二场' in title: stage = (stage + '第二场') if stage else '第二场'
    return lang, grp, (stage or '真题'), yq


def img_file(src, pid):
    h = hashlib.md5(src.encode('utf-8', 'ignore')).hexdigest()[:8]
    ext = os.path.splitext(src.split('?')[0])[1].lower()
    if ext not in ('.png', '.jpg', '.jpeg', '.gif', '.bmp', '.svg', '.webp'):
        ext = '.png'
    return f'{pid}_{h}{ext}'


def strip_fence(s):
    s = (s or '').strip()
    m = re.match(r'^```[^\n]*\n(.*?)\n?```$', s, re.S)
    return m.group(1).strip('\n') if m else s


LUOGU_DIFF = {
    '入门': '简单', '普及−': '简单', '普及-': '简单',
    '普及': '中等', '普及/提高−': '中等', '普及+/提高−': '中等', '普及+/提高': '中等',
    '提高': '困难', '提高+/省选−': '困难', '省选/NOI−': '困难', 'NOI': '困难', 'NOI+/CTSC': '困难',
}


def norm_luogu_diff(raw):
    for k, v in LUOGU_DIFF.items():
        if k in raw:
            return v
    return ''


def norm_track(s):
    """把 '省赛 C/C++ 大学AB组（洛谷题单）' 规范成 [('C/C++ 大学A组'), ('C/C++ 大学B组')]"""
    s = s.replace('（洛谷题单）', '').strip()
    stage = ''
    for st in ('省赛及国赛', '省赛第二场', '省赛', '国赛', '决赛'):
        if s.startswith(st):
            stage = st
            s = s[len(st):].strip()
            break
    m = re.match(r'(C/C\+\+|C\+\+|Python|Java)\s*', s)
    lang = m.group(1) if m else ''
    rest = s[m.end():].strip() if m else s
    gm = re.match(r'大学([ABC]{1,3})组', rest)
    if gm:
        groups = [f'大学{c}组' for c in gm.group(1)]
    elif '研究生' in rest:
        groups = ['研究生组']
    elif '综合' in rest:
        groups = ['综合']
    else:
        groups = []
    out = [f'{lang} {g}'.strip() for g in groups] or ([lang] if lang else [s])
    return out, stage


# ---------------- A. Dotcpp ----------------
d = json.load(open(os.path.join(BASE, 'source', '蓝桥杯真题数据.json'), encoding='utf-8'))
sets = d['sets']; probs = d['problems']; stats = d['stats']

# 难度表：优先 json 的 sets diff，再回落到题库列表缓存
diff_map = {}
for st in sets:
    for pr in st['problems_full']:
        if pr.get('diff') in ('入门', '简单', '中等', '困难'):
            diff_map.setdefault(pr['id'], pr['diff'])
dm = DIFF_CACHE
if os.path.exists(dm):
    for k, v in json.load(open(dm, encoding='utf-8')).items():
        if v in ('入门', '简单', '中等', '困难'):
            diff_map[k] = v

# 出现位置
occ = {}
papers = []
for st in sets:
    lang, grp, stage, yq = parse_set(st['title'])
    papers.append({'id': st['id'], 'title': st['title'], 'year': yq, 'stage': stage,
                   'lang': lang or '未区分', 'group': grp or '综合',
                   'count': len(st['problems_full']), 'dup': st['id'] in DUP,
                   'url': f"https://www.dotcpp.com/oj/{st['id']}/"})
    if st['id'] in DUP:
        continue
    for pr in st['problems_full']:
        o = occ.setdefault(pr['id'], {'tracks': set(), 'stages': set(), 'papers': set()})
        o['tracks'].add(f"{lang or '未区分科目'} {grp or ''}".strip())
        o['stages'].add(stage)
        o['papers'].add(st['id'])

def sample_out(pid):
    f = os.path.join(CACHE, pid + '.html')
    if not os.path.exists(f):
        return None
    soup = BeautifulSoup(open(f, encoding='utf-8').read(), 'html.parser')
    pres = [p.get_text('', strip=False) for p in soup.select('pre.sampledata')]
    # 页面上按「样例输入」「样例输出」顺序排列
    if len(pres) >= 2:
        return pres[1].strip('\n')
    return None

def short_title(t):
    if t.startswith('蓝桥杯') and ('-' in t or '－' in t):
        for sep in ('-', '－'):
            if sep in t:
                head, tail = t.split(sep, 1)
                if ('真题' in head or '届' in head) and len(tail.strip()) > 1:
                    return tail.strip()
    return t


dot_items = {}
missing_out = []
for pid, p in probs.items():
    sec = p.get('sections') or {}
    s_in = strip_fence(sec.get('sample_in'))
    s_out = sample_out(pid)
    if s_out is None:
        missing_out.append(pid)
        s_out = ''
    imgs = [f"images/{img_file(src, pid)}" for src in (p.get('images') or [])]
    o = occ.get(pid, {'tracks': set(), 'stages': set(), 'papers': set()})
    body = []
    if sec.get('desc'):
        body.append({'h': '题目描述', 'md': re.sub(r'\{\{IMG:(.*?)\}\}', '', sec['desc'], flags=re.S).strip()})
    if sec.get('input'):
        body.append({'h': '输入格式', 'md': sec['input']})
    if sec.get('output'):
        body.append({'h': '输出格式', 'md': sec['output']})
    if sec.get('hint'):
        body.append({'h': '提示', 'md': sec['hint']})
    items = [{'in': s_in, 'out': s_out}] if (s_in or s_out) else []
    st = stats.get(pid, {})
    full_title = p.get('title', '')
    dot_items[pid] = {
        'id': pid, 'src': 'dotcpp', 'num': p.get('num') or pid, 'year': None,
        'title': short_title(full_title), 'rawTitle': full_title,
        'diff': diff_map.get(pid) or '未评定', 'diffRaw': diff_map.get(pid, ''),
        'pct': st.get('pct'), 'pctFrom': 'dotcpp',
        'timeLimit': (p.get('time_limit') or '').replace('时间限制:', '').strip(),
        'memLimit': (p.get('mem_limit') or '').replace('内存限制:', '').strip(),
        'url': f'https://www.dotcpp.com/oj/problem{pid}.html',
        'tracks': sorted(o['tracks']), 'stages': sorted(o['stages']), 'papers': sorted(o['papers']),
        'sections': body, 'samples': items, 'images': imgs, 'note': '',
    }

# 年份：题在其所属套的年份里
pid_year = {}
for st in sets:
    if st['id'] in DUP:
        continue
    yq = parse_set(st['title'])[3]
    for pr in st['problems_full']:
        pid_year.setdefault(pr['id'], set()).add(yq)
for pid, it in dot_items.items():
    ys = pid_year.get(pid)
    it['year'] = sorted(ys)[-1] if ys else ''
    # 图片占位补齐：desc 里的 {{IMG}} 已删，但图片列表来自 p['images']

# ---------------- B. 洛谷 ----------------
lg_items = {}
lg_heads = 0
for f in sorted(glob.glob(os.path.join(BASE, 'source', '20*', '*.md'))):
    year = os.path.basename(os.path.dirname(f))
    t = open(f, encoding='utf-8').read()
    if '## 题目详情' not in t:
        continue
    det = t.split('## 题目详情', 1)[1]
    for b in re.split(r'\n### — · ', '\n' + det)[1:]:
        b = re.split(r'\n---\s*\n', b)[0]
        if not b.strip():
            continue
        lg_heads += 1
        title = b.split('\n', 1)[0].strip()
        head = b[:b.find('####')] if '####' in b else b
        mpid = re.search(r'洛谷\s*(P\d+)', head) or re.search(r'(P\d{3,})', head)
        pid = mpid.group(1) if mpid else 'LG' + hashlib.md5((title + year).encode()).hexdigest()[:8]
        md = re.search(r'难度\s*(.+?)\s*｜', head)
        draw_full = md.group(1).strip() if md else ''
        mb = re.search(r'（(.+?)）', draw_full)
        draw = mb.group(1).strip() if mb else re.sub(r'（.*?）', '', draw_full).strip()
        dp = re.search(r'(入门|简单|中等|困难)', draw_full)
        dnorm = dp.group(1) if dp else (norm_luogu_diff(draw) or '未评定')
        mp = re.search(r'通过率\s*([\d.]+)%', head)
        pct = float(mp.group(1)) if mp else None
        mt = re.search(r'时间\s*([\d.]+\s*[sS]|[^｜]+?)\s*｜', head)
        tl = mt.group(1).strip() if mt else ''
        mm = re.search(r'内存\s*([\d.]+\s*[KMG]{1,2})', head)
        ml = mm.group(1).strip() if mm else ''
        mu = re.search(r'(https://www\.luogu\.com\.cn/problem/\S+)', head)
        url = mu.group(1) if mu else ''
        mg = re.search(r'考过的语言/组别：(.+)$', head, re.M)
        raw_grp = mg.group(1).strip() if mg else ''
        tracks, stg = [], set()
        for piece in [x for x in re.split(r'[、,，]', raw_grp) if x.strip()]:
            tks, s = norm_track(piece)
            tracks += tks
            if s:
                stg.add(s)
        stages = sorted(stg) or ['省赛']
        # 段落
        segs = re.split(r'^#### (.+)$', b, flags=re.M)
        sections, samples, note = [], [], ''
        pair = {}
        for i in range(1, len(segs), 2):
            h = segs[i].strip()
            body_md = (segs[i + 1] if i + 1 < len(segs) else '').strip()
            if not body_md:
                continue
            if '样例输入' in h:
                k = re.search(r'(\d+)', h)
                pair[int(k.group(1)) if k else 1] = {'in': strip_fence(body_md), 'out': ''}
            elif '样例输出' in h:
                k = re.search(r'(\d+)', h)
                key = int(k.group(1)) if k else 1
                pair.setdefault(key, {'in': '', 'out': ''})['out'] = strip_fence(body_md)
            elif h == '样例解释':
                note = body_md
            else:
                if '洛谷自造' in body_md and not note:
                    note = body_md
                sections.append({'h': h, 'md': body_md})
        samples = [pair[k] for k in sorted(pair) if (pair[k]['in'].strip() or pair[k]['out'].strip())]
        imgs = re.findall(r'!\[[^\]]*\]\((\.\./\.\./images/[^)]+)\)', b)
        lg_items[pid] = {
            'id': pid, 'src': 'luogu', 'num': pid, 'year': year, 'title': title,
            'diff': dnorm, 'diffRaw': draw, 'pct': pct, 'pctFrom': 'luogu',
            'timeLimit': tl, 'memLimit': ml, 'url': url,
            'tracks': tracks, 'stages': stages or ['省赛'], 'papers': [f'LG-{year}'],
            'sections': sections, 'samples': samples, 'images': [x.replace('../../images/', 'images/') for x in imgs],
            'note': note if '洛谷自造' in note else '',
        }

# 洛谷"卷"
lg_papers = []
for year in sorted({v['year'] for v in lg_items.values()}):
    cnt = sum(1 for v in lg_items.values() if v['year'] == year)
    lg_papers.append({'id': f'LG-{year}', 'title': f'{year} 洛谷蓝桥杯题单（非官方数据）', 'year': year,
                      'stage': '洛谷题单', 'lang': 'C/C++', 'group': '综合', 'count': cnt, 'dup': False,
                      'url': 'https://www.luogu.com.cn/problem/list?type=luogu&tag=361,363',
                      'luogu': True})

# ---------------- C. 输出 ----------------
ALL = {}
ALL.update(dot_items)
ALL.update(lg_items)
print('Dotcpp', len(dot_items), '洛谷', len(lg_items), '合计', len(ALL))
print('缺样例输出的 Dotcpp 题', len(missing_out))
print('洛谷块解析', lg_heads, '→ 唯一', len(lg_items))

years = sorted({v['year'] for v in ALL.values()}, key=lambda y: (re.match(r'(\d{4})', y).group(1) if re.match(r'(\d{4})', y) else '0'))
# 目录索引
cat = {
    'generated': '2026-11-27',
    'source': 'Dotcpp 蓝桥杯真题 450 题 + 洛谷蓝桥杯题单 307 题',
    'years': years,
    'papers': sorted([p for p in papers if not p['dup']], key=lambda p: p['id']) + lg_papers,
    'problems': [{
        'id': v['id'], 'src': v['src'], 'year': v['year'], 'title': v['title'],
        'diff': v['diff'], 'pct': v['pct'], 'tracks': v['tracks'],
        'stages': v['stages'], 'papers': v['papers'],
    } for v in sorted(ALL.values(), key=lambda x: x['id'])],
}
open(os.path.join(DATA, 'catalog.js'), 'w', encoding='utf-8').write(
    'window.LQ_CATALOG=' + json.dumps(cat, ensure_ascii=False, separators=(',', ':')) + ';')

# 按年分片
chunks = {}
for v in ALL.values():
    key = v['year'] or '其他'
    chunks.setdefault(key, {})[v['id']] = v
for key, obj in chunks.items():
    fn = 'p-' + re.sub(r'[^\w\u4e00-\u9fa5]+', '_', key) + '.js'
    open(os.path.join(DATA, fn), 'w', encoding='utf-8').write(
        f'window.LQ_PAGES["{key}"]=' + json.dumps(obj, ensure_ascii=False, separators=(',', ':')) + ';')
    print('   分片', fn, len(obj), '题')

# 全量 JSON 仅作离线备份，统一写到项目缓存，不放进站点目录
os.makedirs(BUILD_CACHE, exist_ok=True)
open(os.path.join(BUILD_CACHE, 'problems.json'), 'w', encoding='utf-8').write(
    json.dumps(ALL, ensure_ascii=False, indent=1))

# 校验
miss_img = []
for v in ALL.values():
    for p in v['images']:
        fn = p.replace('images/', '')
        if not os.path.exists(os.path.join(IMG, fn)):
            miss_img.append((v['id'], fn))
print('\n缺失图片引用', len(miss_img), miss_img[:5])
nodiff = sum(1 for v in ALL.values() if not v['diff'])
print('无难度', nodiff, '| 无样例', sum(1 for v in ALL.values() if not v['samples']))
print('分片数', len(chunks), '| years', len(years))
