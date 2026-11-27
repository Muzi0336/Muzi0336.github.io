# -*- coding: utf-8 -*-
"""汇总核对数据：章节数、重复项、图片分章统计、代码块与原文重合度。"""
import collections
import html as htmllib
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
from fetch_algorithm import parse_toc, fetch_text, abs_url, BASE  # noqa: E402

NOTES = os.path.join(ROOT, "笔记")
pages = json.load(open(os.path.join(ROOT, "cache", "pages.json"), encoding="utf-8"))
chapters = parse_toc(fetch_text(BASE))


def norm_lines(code):
    out = []
    for ln in code.replace("\xa0", " ").split("\n"):
        ln = re.sub(r"[ \t]+", " ", ln).strip()
        if ln and ln not in ("...", "…"):
            out.append(ln)
    return out


def src_blocks(body):
    return [norm_lines(htmllib.unescape(re.sub(r"<[^>]+>", "", m.group(1))))
            for m in re.finditer(r"<pre[^>]*>(.*?)</pre>", body, re.S | re.I)]


total_items = sum(len(c["items"]) for c in chapters)
uniq_urls = len({i["url"] for c in chapters for i in c["items"]})

print(f"章节块 {len(chapters)}，小节条目 {total_items}，唯一文章 URL {uniq_urls}")
for ci, c in enumerate(chapters, 1):
    dup = len(c["items"]) - len({i["url"] for i in c["items"]})
    print(f"  第{ci:02d}章 {c['title']}：{len(c['items'])} 节，重复链接 {dup}")

# 图片分章
img_by_ch = []
allimgs = set()
for ci, c in enumerate(chapters, 1):
    n = 0
    for it in c["items"]:
        for u in re.findall(r"<img[^>]*?src=['\"]([^'\"]+)['\"]", pages.get(it["url"], ""), re.I):
            u = abs_url(u)
            if not u.startswith("data:"):
                allimgs.add(u); n += 1
    img_by_ch.append((ci, c["title"], n))
print("图片引用总数(含重复) ", sum(x[2] for x in img_by_ch), " 唯一 URL", len(allimgs))
for x in img_by_ch:
    print("  ", x)

# 代码块重合度
n_blocks = 0
matched = 0
files = [f for f in os.listdir(NOTES) if f.startswith("第") and f.endswith(".md")]
for ci, c in enumerate(chapters):
    txt = open(os.path.join(NOTES, files[ci]), encoding="utf-8").read()
    parts = re.split(r"(?m)^## ", txt)[1:]
    for ii, it in enumerate(c["items"]):
        if ii >= len(parts):
            continue
        body = parts[ii]
        srcs = src_blocks(pages.get(it["url"], ""))
        allsrc = set()
        for b in srcs:
            allsrc.update(b)
        for m in re.finditer(r"```[a-zA-Z0-9+-]*\n(.*?)```", body, re.S):
            n_blocks += 1
            nl = norm_lines(m.group(1))
            if not nl:
                continue
            hit = sum(1 for ln in nl if ln in allsrc)
            if hit / len(nl) >= 0.6:
                matched += 1
print(f"笔记代码块 {n_blocks}，其中与原文逐行重合≥60% 的 {matched}，改写/精简版 {n_blocks - matched}")
