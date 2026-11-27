#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
抓取 https://www.dotcpp.com/course/ds/ 数据结构教程全部正文，生成本地离线文档：
  1. 数据结构教程.html  单文件离线书（图片内嵌 base64）
  2. markdown/*.md      按章节拆分的 Markdown
  3. .cache/pages.json  原始抓取缓存，便于增量重跑
"""
import base64
import hashlib
import html as htmllib
import json
import os
import re
import sys
import time
import urllib.request

BASE = "https://www.dotcpp.com/course/ds/"
HOST = "https://www.dotcpp.com"
UA = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0 Safari/537.36",
    "Accept-Language": "zh-CN,zh;q=0.9",
}
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, ".cache")
ASSETS = os.path.join(ROOT, "assets")
MD_DIR = os.path.join(ROOT, "markdown")


def fetch(url, timeout=30):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read().decode("utf-8", "replace")


def parse_toc(index_html):
    chapters, cur = [], None
    for block in re.findall(r"<dl[^>]*>.*?</dl>", index_html, re.S):
        dt = re.search(r"<dt>.*?<a[^>]*href=['\"]([^'\"]+)['\"][^>]*>(.*?)</a>", block, re.S)
        if dt:
            cur = {"title": clean_text(dt.group(2)), "url": abs_url(dt.group(1)), "items": []}
            chapters.append(cur)
        for dd in re.findall(r"<dd>.*?</dd>", block, re.S):
            a = re.search(r"<a[^>]*href=['\"]([^'\"]+)['\"][^>]*>(.*?)</a>", dd, re.S)
            if a and cur is not None:
                cur["items"].append({"title": clean_text(a.group(2)), "url": abs_url(a.group(1))})
    return chapters


def abs_url(u):
    u = htmllib.unescape(u.strip())
    if u.startswith("//"):
        return "https:" + u
    if u.startswith("/"):
        return HOST + u
    return u


def clean_text(s):
    s = re.sub(r"<[^>]+>", "", s)
    return re.sub(r"\s+", " ", htmllib.unescape(s)).strip()


def extract_body(page):
    s = page.find("<!-- S 正文 -->")
    e = page.find("<!-- E 正文 -->")
    if s == -1 or e == -1 or e <= s:
        raise ValueError("body markers not found")
    return page[s + len("<!-- S 正文 -->"):e]


def strip_styles(body):
    body = re.sub(r'<style[^>]*>.*?</style>', "", body, flags=re.S)
    body = re.sub(r'<script[^>]*>.*?</script>', "", body, flags=re.S)
    body = re.sub(r'\s?style=(["\']).*?\1', "", body, flags=re.S)
    body = re.sub(r'\s?class=(["\']).*?\1', "", body, flags=re.S)
    return body


def download_img(url, cache_dir):
    name = hashlib.md5(url.encode()).hexdigest()[:16] + os.path.splitext(url.split("?")[0])[1]
    path = os.path.join(cache_dir, name)
    if not os.path.exists(path):
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=30) as r:
                data = r.read()
            with open(path, "wb") as f:
                f.write(data)
        except Exception as exc:  # noqa: BLE001
            print("  img fail:", url, exc)
            return url, None
    return url, path


def html_to_md(body, img_map, assets_rel="assets"):
    """把正文 HTML 转为 Markdown；img_map: 原始 url -> 本地文件名或 None"""
    body = strip_styles(body)
    blocks = []

    def keep_pre(m):
        inner = m.group(1)
        inner = re.sub(r"<[^>]+>", "", inner)
        code = htmllib.unescape(inner).strip("\n").rstrip()
        blocks.append(code)
        return f"\n\n@@PRE{len(blocks) - 1}@@\n\n"

    body = re.sub(r"<pre[^>]*>(.*?)</pre>", keep_pre, body, flags=re.S)

    def keep_img(m):
        src = re.search(r"src=['\"]([^'\"]+)['\"]", m.group(0))
        if not src:
            return ""
        url = abs_url(src.group(1))
        name = img_map.get(url)
        alt = ""
        a = re.search(r"alt=['\"]([^'\"]*)['\"]", m.group(0))
        if a:
            alt = a.group(1)
        if name:
            blocks.append(f"![{alt}]({assets_rel}/{name})")
        else:
            blocks.append(f"![{alt}]({url})")
        return f"\n\n@@PRE{len(blocks) - 1}@@\n\n"

    body = re.sub(r"<img[^>]*>", keep_img, body)

    # 链接
    body = re.sub(
        r"<a[^>]*href=['\"]([^'\"]*)['\"][^>]*>(.*?)</a>",
        lambda m: f"[{clean_text(m.group(2))}]({abs_url(m.group(1))})",
        body,
        flags=re.S,
    )
    # 标题（内文标题整体降一级：h2->###，因为文章标题已占 ##）
    for lvl in (2, 3, 4):
        body = re.sub(rf"<h{lvl}[^>]*>", "\n\n" + "#" * (lvl + 1) + " ", body, flags=re.I)
        body = re.sub(rf"</h{lvl}>", "\n\n", body, flags=re.I)
    body = re.sub(r"</?(ul|ol|dl|dt|dd|div|section|table|tbody|thead|tr|td|th|figure|figcaption|center|blockquote)[^>]*>", "\n\n", body, flags=re.I)
    body = re.sub(r"<li[^>]*>", "\n- ", body, flags=re.I)
    body = re.sub(r"<br\s*/?>", "\n", body, flags=re.I)
    body = re.sub(r"</?strong[^>]*>|</?b[^>]*>", "**", body, flags=re.I)
    body = re.sub(r"</?em[^>]*>", "*", body, flags=re.I)
    body = re.sub(r"<p[^>]*>", "\n\n", body, flags=re.I)
    body = re.sub(r"</p>", "", body, flags=re.I)
    body = re.sub(r"</?(span|font|u|i|sub|sup|s|big|small)[^>]*>", "", body, flags=re.I)
    body = re.sub(r"<[^>]+>", "", body)

    body = htmllib.unescape(body).replace("\xa0", " ")
    body = re.sub(r"[ \t]+\n", "\n", body)
    body = re.sub(r"\n{3,}", "\n\n", body)
    lines = [ln.rstrip() for ln in body.split("\n")]
    body = "\n".join(lines).strip()
    # 标题行去掉无用的加粗标记
    body = re.sub(r"^(#{3,6}\s*)\*\*(.+?)\*\*\s*$", r"\1\2", body, flags=re.M)
    # 清理只由星号组成的残行
    cleaned = []
    for ln in body.split("\n"):
        t = ln.strip()
        if t and re.fullmatch(r"\*+", t):
            continue
        cleaned.append(ln)
    body = "\n".join(cleaned)

    for i, code in enumerate(blocks):
        if code.startswith("!["):
            body = body.replace(f"@@PRE{i}@@", code)
        else:
            body = body.replace(f"@@PRE{i}@@", "```cpp\n" + code + "\n```")
    body = re.sub(r"\n{3,}", "\n\n", body).strip() + "\n"
    return body


def build_html(chapters):
    """生成单文件离线书"""
    nav = ['<nav class="toc"><div class="toc-title">目录</div>']
    sections = []
    for ci, ch in enumerate(chapters, 1):
        nav.append(f'<div class="toc-chapter"><div class="toc-chapter-name">{htmllib.escape(ch["title"])}</div><ol>')
        for ii, it in enumerate(ch["items"], 1):
            anchor = f"c{ci}-{ii}"
            nav.append(f'<li><a href="#{anchor}">{htmllib.escape(it["title"])}</a></li>')
            sections.append(f'<section class="item" id="{anchor}"><h2>{htmllib.escape(it["title"])}</h2>{it["html"]}</section>')
        nav.append("</ol></div>")
    nav.append("</nav>")

    css = """
:root{--fg:#1f2328;--muted:#6b7280;--line:#e5e7eb;--bg:#fbfbfa;--accent:#1a73e8}
*{box-sizing:border-box}
body{margin:0;font-family:"Source Han Serif SC","Noto Serif CJK SC","Microsoft YaHei",system-ui,sans-serif;
 background:var(--bg);color:var(--fg);line-height:1.85;font-size:16px}
.layout{display:flex;align-items:flex-start}
nav.toc{position:sticky;top:0;flex:0 0 268px;height:100vh;overflow-y:auto;padding:22px 14px 40px;
 border-right:1px solid var(--line);background:#fff;font-family:"Microsoft YaHei",system-ui,sans-serif;font-size:13px}
.toc-title{font-size:15px;font-weight:700;padding:0 8px 10px;letter-spacing:1px}
.toc-chapter{margin:0 0 12px}
.toc-chapter-name{font-weight:700;color:var(--accent);padding:4px 8px}
nav.toc ol{margin:0;padding-left:22px}
nav.toc li{padding:2px 0}
nav.toc a{color:#444;text-decoration:none}
nav.toc a:hover{color:var(--accent)}
main{flex:1;min-width:0;max-width:860px;margin:0 auto;padding:40px 46px 90px;background:#fff;
 box-shadow:0 0 0 1px var(--line)}
h1.book-title{font-size:28px;margin:0 0 6px}
.book-sub{color:var(--muted);font-size:13px;margin-bottom:36px;line-height:1.7}
section.item{page-break-before:always}
section.item h2{font-size:20px;margin:38px 0 14px;padding-bottom:8px;border-bottom:2px solid #111}
section.item h3,section.item h4{font-size:17px;margin:24px 0 10px}
p{margin:12px 0;text-align:justify}
img{max-width:100%;height:auto;display:block;margin:18px auto;border-radius:4px}
pre{background:#f6f8fa;border:1px solid #e1e4e8;border-radius:6px;padding:14px 16px;overflow-x:auto;
 font-size:13.5px;line-height:1.6;font-family:Consolas,"Courier New",monospace;white-space:pre}
a{color:var(--accent);text-decoration:none;border-bottom:1px dotted #a8c7fa}
@media print{
 nav.toc{display:none}
 main{box-shadow:none;max-width:none;padding:0}
 body{font-size:11.5pt;background:#fff}
 section.item h2{page-break-after:avoid}
 pre{white-space:pre-wrap;word-break:break-all;font-size:9.5pt}
 img{max-width:100%;page-break-inside:avoid}
 .book-sub{margin-bottom:18px}
}
@media (max-width:900px){.layout{display:block}nav.toc{position:static;height:auto;border-right:none;border-bottom:1px solid var(--line)}main{padding:24px 18px}}
"""
    doc = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>数据结构教程（Dotcpp 离线版）</title>
<style>{css}</style>
</head>
<body>
<div class="layout">
{''.join(nav)}
<main>
<h1 class="book-title">数据结构与算法教程</h1>
<div class="book-sub">来源：Dotcpp 编程 · https://www.dotcpp.com/course/ds/<br>
共 {len(chapters)} 章、{sum(len(c['items']) for c in chapters)} 节 · 本地离线版，仅供个人学习使用</div>
{''.join(sections)}
</main>
</div>
</body>
</html>
"""
    out = os.path.join(ROOT, "数据结构教程.html")
    with open(out, "w", encoding="utf-8") as f:
        f.write(doc)
    return out


def main():
    os.makedirs(CACHE, exist_ok=True)
    os.makedirs(ASSETS, exist_ok=True)
    os.makedirs(MD_DIR, exist_ok=True)

    print("抓取目录页 ...")
    chapters = parse_toc(fetch(BASE))
    total = sum(len(c["items"]) for c in chapters)
    print(f"共 {len(chapters)} 章 / {total} 节")

    pages_file = os.path.join(CACHE, "pages.json")
    pages = {}
    if os.path.exists(pages_file):
        with open(pages_file, encoding="utf-8") as f:
            pages = json.load(f)

    for ci, ch in enumerate(chapters, 1):
        for ii, it in enumerate(ch["items"], 1):
            url = it["url"]
            if url in pages:
                print(f"[{ci}-{ii}] 缓存 {it['title']}")
                continue
            try:
                body = extract_body(fetch(url))
                pages[url] = body
                print(f"[{ci}-{ii}] ok {it['title']}")
            except Exception as exc:  # noqa: BLE001
                print(f"[{ci}-{ii}] FAIL {it['title']}: {exc}", file=sys.stderr)
            time.sleep(0.8)
            if (ci * 100 + ii) % 10 == 0:
                with open(pages_file, "w", encoding="utf-8") as f:
                    json.dump(pages, f, ensure_ascii=False)

    with open(pages_file, "w", encoding="utf-8") as f:
        json.dump(pages, f, ensure_ascii=False)
    print(f"页面缓存完成：{len(pages)} / {total}")

    # 图片下载
    img_map = {}
    for url, body in pages.items():
        for src in re.findall(r"<img[^>]*?src=['\"]([^'\"]+)['\"]", strip_styles(body)):
            absu = abs_url(src)
            if absu.startswith("data:"):
                continue
            if absu not in img_map:
                _, path = download_img(absu, ASSETS)
                img_map[absu] = os.path.basename(path) if path else None
    print(f"图片：{len([v for v in img_map.values() if v])} 张下载完成")

    # 生成 Markdown
    files = []
    for ci, ch in enumerate(chapters, 1):
        parts = [f"# {ch['title']}\n"]
        for ii, it in enumerate(ch["items"], 1):
            body = pages.get(it["url"], "")
            md = html_to_md(body, img_map, assets_rel="../assets") if body else "> 抓取失败，请查看原网页。\n"
            parts.append(f"\n## {it['title']}\n\n{md}")
        name = f"{ci:02d}-{re.sub(r'[\\\\/:*?\"<>| ]', '', ch['title'])}.md"
        path = os.path.join(MD_DIR, name)
        with open(path, "w", encoding="utf-8") as f:
            f.write("\n".join(parts))
        files.append((ch["title"], name))
        print("markdown:", name)

    idx = ["# 数据结构与算法教程（Dotcpp 离线版）\n",
           "> 来源：https://www.dotcpp.com/course/ds/ ｜ 仅供个人学习使用\n",
           f"> 共 {len(chapters)} 章 / {total} 节\n"]
    for title, name in files:
        idx.append(f"- [{title}]({urllib.parse.quote(name)})")
    with open(os.path.join(MD_DIR, "README.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(idx) + "\n")

    # 生成单文件 HTML（图片 base64 内嵌）
    for ci, ch in enumerate(chapters, 1):
        for ii, it in enumerate(ch["items"], 1):
            body = strip_styles(pages.get(it["url"], ""))
            if not body.strip():
                body = "<p>（抓取失败，请查看原网页）</p>"
                it["html"] = body
                continue

            def inline_img(m):
                src = re.search(r"src=['\"]([^'\"]+)['\"]", m.group(0))
                if not src:
                    return ""
                absu = abs_url(src.group(1))
                name = img_map.get(absu)
                if not name:
                    return m.group(0)
                p = os.path.join(ASSETS, name)
                ext = os.path.splitext(p)[1].lower().lstrip(".") or "png"
                if ext == "jpg":
                    ext = "jpeg"
                with open(p, "rb") as f:
                    data = base64.b64encode(f.read()).decode()
                return f'<img src="data:image/{ext};base64,{data}" alt="">'

            body = re.sub(r"<img[^>]*>", inline_img, body, flags=re.I)
            body = re.sub(r'\s(?:width|height|alt|title)=(["\']).*?\1', "", body, flags=re.S)
            # 内文标题降一级，与文章标题形成层次
            body = re.sub(r"<h(\d)[^>]*>", lambda m: f"<h{min(int(m.group(1)) + 1, 6)}>", body, flags=re.I)
            body = re.sub(r"</h(\d)>", lambda m: f"</h{min(int(m.group(1)) + 1, 6)}>", body, flags=re.I)
            it["html"] = body

    out = build_html(chapters)
    print("HTML:", out, round(os.path.getsize(out) / 1048576, 1), "MB")


if __name__ == "__main__":
    main()
