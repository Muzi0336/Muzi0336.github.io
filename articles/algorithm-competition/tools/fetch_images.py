# -*- coding: utf-8 -*-
"""
算法竞赛教程 · 图片抓取
================================================================
读 .cache/algorithm-competition/pages.json（172 篇正文 HTML），把每篇里 <img> 引用的图下载到
assets/，并写出一份 assets/img_index.json：

    { "第01章": { "1.算法是什么？": [{"file": "...png", "alt": "...", "w": .., "h": ..}], ... } }

文件名取 URL 的 md5 前 16 位，重复引用自动复用同一张。
用法：python tools/fetch_images.py [--force]
"""
import hashlib
import json
import os
import re
import sys
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from html import unescape

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fetch_algorithm import parse_toc, fetch_text, BASE, abs_url, CACHE as CACHE_DIR  # noqa: E402

ASSETS = os.path.join(ROOT, "assets")
INDEX = os.path.join(ASSETS, "img_index.json")
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/120.0 Safari/537.36")


def img_tags(body):
    out = []
    for tag in re.findall(r"<img[^>]*>", body):
        m = re.search(r'src\s*=\s*"([^"]+)"', tag)
        if not m:
            continue
        src = abs_url(m.group(1))
        alt_m = re.search(r'alt\s*=\s*"([^"]*)"', tag)
        alt = unescape(alt_m.group(1)) if alt_m else ""
        out.append((src, alt))
    return out


def name_of(url):
    h = hashlib.md5(url.encode()).hexdigest()[:16]
    ext = os.path.splitext(url.split("?")[0])[1].lower()
    if ext not in (".png", ".jpg", ".jpeg", ".gif", ".webp"):
        ext = ".png"
    return h + ext


def download(url, path):
    for attempt in range(4):
        try:
            req = urllib.request.Request(url, headers={
                "User-Agent": UA,
                "Referer": BASE,
                "Accept": "image/*,*/*;q=0.8",
            })
            with urllib.request.urlopen(req, timeout=25) as r:
                data = r.read()
            if data[:4] == b"\x89PNG" or data[:2] in (b"\xff\xd8", b"GI") or data[:4] == b"RIFF":
                with open(path, "wb") as f:
                    f.write(data)
                return len(data)
        except Exception as e:
            if attempt == 3:
                print("  FAIL", url, e)
                return 0
            time.sleep(1 + attempt)
    return 0


def main():
    force = "--force" in sys.argv
    os.makedirs(ASSETS, exist_ok=True)
    chapters = parse_toc(fetch_text(BASE))
    pages = json.load(open(os.path.join(CACHE_DIR, "pages.json"), encoding="utf-8"))

    index = {}
    tasks = []
    missing = 0
    for ci, ch in enumerate(chapters, 1):
        ch_key = ch["title"]
        sec_map = {}
        for it in ch["items"]:
            url = it["url"]
            body = pages.get(url)
            if body is None:
                missing += 1
                continue
            items = []
            for src, alt in img_tags(body):
                f = name_of(src)
                items.append({"file": f, "alt": alt, "src": src})
                tasks.append((src, os.path.join(ASSETS, f)))
            if items:
                sec_map[it["title"]] = items
        index["第%02d章" % ci] = sec_map

    uniq = {}
    for src, path in tasks:
        uniq[path] = src
    print("图片引用 %d 处，唯一文件 %d 个；缺正文 %d 篇" % (len(tasks), len(uniq), missing))

    todo = [(s, p) for p, s in uniq.items() if force or not os.path.exists(p)]
    print("待下载 %d 个" % len(todo))
    total = 0
    with ThreadPoolExecutor(max_workers=8) as ex:
        futs = {ex.submit(download, s, p): p for s, p in todo}
        for i, fu in enumerate(futs):
            total += fu.result() or 0
            if (i + 1) % 50 == 0:
                print("  ... %d/%d  %.1f MB" % (i + 1, len(todo), total / 1048576))

    with open(INDEX, "w", encoding="utf-8") as f:
        json.dump(index, f, ensure_ascii=False)

    have = [p for p in uniq if os.path.exists(p)]
    print("完成：本地 %d / %d 张，%.1f MB；索引已写 assets/img_index.json" % (
        len(have), len(uniq), total / 1048576))


if __name__ == "__main__":
    main()
