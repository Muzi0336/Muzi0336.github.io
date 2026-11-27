# -*- coding: utf-8 -*-
"""校验第 0 层数据：题数、卷题数、孤儿题、年份覆盖、图片引用、分片体积。
用法：python check_layer0.py
数据全部从 ../data 的 catalog.js 与 p-<年份>.js 读取，不依赖 problems.json。
"""
import json, os, glob, collections, sys

BASE = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA = os.path.join(BASE, 'data')
IMG = os.path.join(BASE, 'images')


def load_js(path):
    raw = open(path, encoding='utf-8').read()
    raw = raw.split('=', 1)[1].strip().rstrip(';')
    return json.loads(raw)


cat = load_js(os.path.join(DATA, 'catalog.js'))
print('catalog：年份 %d，卷 %d，题目摘要 %d' % (len(cat['years']), len(cat['papers']), len(cat['problems'])))
print('卷类型：dotcpp %d，洛谷 %d' % (
    sum(1 for p in cat['papers'] if not p.get('luogu')),
    sum(1 for p in cat['papers'] if p.get('luogu'))))

allp = {}
chunk_n = {}
for f in sorted(glob.glob(os.path.join(DATA, 'p-*.js'))):
    obj = load_js(f)
    key = os.path.basename(f)[2:-3]
    chunk_n[key] = len(obj)
    allp.update(obj)

print('\n--- 分片 ---')
for f in sorted(glob.glob(os.path.join(DATA, 'p-*.js'))):
    print('%-28s %8.1f KB  %3d 题' % (os.path.basename(f), os.path.getsize(f) / 1024, chunk_n[os.path.basename(f)[2:-3]]))
print('%-28s %8.1f KB' % ('catalog.js', os.path.getsize(os.path.join(DATA, 'catalog.js')) / 1024))

problems = []
for p in cat['problems']:
    pid = p['id']
    if pid not in allp:
        problems.append((pid, 'catalog 有、分片缺全文'))
        continue
    v = allp[pid]
    for k in ('year', 'title', 'diff', 'sections'):
        if not v.get(k):
            problems.append((pid, '字段为空：' + k))

bad_paper = []
paper_total = 0
for paper in cat['papers']:
    items = [p for p in cat['problems'] if paper['id'] in (p.get('papers') or [])]
    paper_total += len(items)
    if len(items) != paper.get('count'):
        bad_paper.append((paper['id'], paper.get('count'), len(items)))

orphan = [p['id'] for p in cat['problems'] if not (p.get('papers') or [])]
year_count = collections.Counter(p['year'] for p in cat['problems'])
missing_year = [y for y in cat['years'] if y not in year_count]

miss_img = []
for v in allp.values():
    for p in v.get('images') or []:
        fn = p.replace('images/', '')
        if not os.path.exists(os.path.join(IMG, fn)):
            miss_img.append((v['id'], fn))

print('\n--- 汇总 ---')
print('题目总数 %d（catalog %d，分片 %d）' % (len(allp), len(cat['problems']), len(allp)))
print('难度分布', dict(collections.Counter(v['diff'] for v in allp.values())))
print('年份题数', dict(year_count))
print('卷数 %d，卷题条目合计 %d' % (len(cat['papers']), paper_total))
print('卷 count 不一致 %d %s' % (len(bad_paper), bad_paper[:5]))
print('孤儿题 %d %s' % (len(orphan), orphan[:5]))
print('无题年份 %d %s' % (len(missing_year), missing_year))
print('缺失图片 %d %s' % (len(miss_img), miss_img[:5]))
print('字段问题 %d %s' % (len(problems), problems[:5]))

ok = not (bad_paper or orphan or missing_year or miss_img or problems)
print('\n结论：' + ('全部通过' if ok else '存在问题，见上'))
sys.exit(0 if ok else 1)
