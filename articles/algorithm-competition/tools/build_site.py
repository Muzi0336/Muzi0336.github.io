# -*- coding: utf-8 -*-
"""
算法竞赛教程 · 静态站点生成器
================================================================
输入：笔记/第01..10章 *.md（唯一内容来源，改这里就够）
      assets/img_meta.json（图片宽高，防止版面跳动；图片文件在 assets/ 与 assets/webp/）
输出：index.html（章节目录）
      ch01.html ... ch10.html（阅读页：左＝10 章目录，中＝正文，右＝本章小标题）

改内容：改 笔记/*.md → python tools/build_site.py
改呈现：改 assets/reader.css ＋ 本文件下面的模板
补图：python tools/fetch_images.py → tools/attach_images.py → tools/optimize_images.py
"""
import json
import os
import re
import sys
from html import escape

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "笔记")
OUT = ROOT
META = os.path.join(ROOT, "assets", "img_meta.json")

SITE = "算法竞赛教程"
NAV_LABEL = "算法竞赛"
EYEBROW = "ALGORITHM CONTEST"

LEADS = {
    1: "复杂度、枚举、模拟、贪心、递归与分治是地基，前缀和、差分、二分与倍增是后面每一章都会回来用的工具。",
    2: "DFS / BFS 两副骨架，往上叠迭代加深、双向 BFS、A* 与 IDA*，搜索题的分水岭在剪枝写得好不好。",
    3: "冒泡、插入、选择、希尔、堆、归并、快排与计数、基数排序逐个过一遍，最后用一张表把复杂度与稳定性对齐。",
    4: "从哈希与 KMP 走到 Z 函数、Manacher、后缀数组与自动机，字符串题的核心是把「重复」变成「可复用」。",
    5: "素数筛、快速幂、组合数、高斯消元与博弈论，数学题往往是「建模 + 模板」两件事。",
    6: "从线性 DP 一路到区间、树形、状压、数位与插头 DP，难点全在状态设计与转移顺序。",
    7: "并查集、树状数组、线段树、平衡树、可持久化与那些名字奇怪但好用的结构。",
    8: "存图、遍历、生成树、最短路、连通性、二分图、网络流与高级结构，全教程最长也最杂的一章。",
    9: "向量运算、凸包、旋转卡壳、半平面交与多边形面积，误差控制往往比算法本身更关键。",
    10: "分块、莫队、CDQ、树上启发式合并、表达式求值，这些不在前面章节里的通用技巧都收在这里。",
}

# ---------------------------------------------------------------- 模板
TOPBAR = """<div class="topbar">
  <a class="brand" href="{p}index.html" title="朝云暮辞 · 学习档案">
    <svg viewBox="0 0 30 30" fill="none" stroke="currentColor" stroke-width="2.2">
      <path d="M10 4H4v22h6M20 4h6v22h-6"/>
      <path d="M17.5 9.5 12.5 20.5" stroke-width="1.6"/>
    </svg>
    <span class="brand-text"><b>朝云暮辞</b><small>ARENA LAB</small></span>
  </a>
  <nav class="nav">
    <a href="{p}index.html#contest">计挑赛</a>
    <a href="{p}算法/index.html">算法</a>
    <a href="{p}数据结构教程/index.html">数据结构</a>
    <a href="{p}算法竞赛教程/index.html"{active}>算法竞赛</a>
    <a href="{p}frontend/index.html">前端教程</a>
    <a href="{p}boke/index.html">全栈笔记</a>
    <a href="{p}学习工具/错题本.html">错题本</a>
  </nav>
</div>
"""

FOOTER = """<footer class="site-foot">
  <div class="sf-inner">
    <div class="sf-top">
      <div class="sf-brand">
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none" stroke="currentColor" stroke-width="2.2" style="flex:none">
          <path d="M10 4H4v22h6M20 4h6v22h-6"/>
          <path d="M17.5 9.5 12.5 20.5" stroke-width="1.6"/>
        </svg>
        <div>
          <span class="brand-text" style="line-height:1.1"><b>朝云暮辞</b><small>ARENA LAB</small></span>
          <p>算法竞赛教程笔记，整理自 dotcpp 教程（C 语言中文网）。原文 172 篇长页面重排为 10 章「章 → 节 → 要点」，代码分块、配图外挂存储（webp 懒加载）。个别表述按原文口径订正，仍以原文为准。</p>
        </div>
      </div>
      <nav class="sf-links">
        <a href="{p}算法竞赛教程/index.html">算法竞赛教程</a>
        <a href="{p}数据结构教程/index.html">数据结构教程</a>
        <a href="{p}算法/index.html">算法题库</a>
        <a href="{p}frontend/index.html">前端教程</a>
        <a href="{p}学习工具/错题本.html">错题本</a>
      </nav>
    </div>
    <div class="sf-bottom">
      <span>© 2026 朝云暮辞</span>
      <span>笔记仅供学习参考，原文以 dotcpp 站点为准。</span>
    </div>
  </div>
</footer>
"""

PAGE = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{page_title}</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="#f4f1e9">
<link rel="stylesheet" href="../计挑赛/assets/style.css">
<link rel="stylesheet" href="../计挑赛/assets/detail.css">
<link rel="stylesheet" href="assets/reader.css">
</head>
<body>
{topbar}
<div class="docwrap">
  <aside class="docnav">
    <a class="back" href="index.html">← 教程目录</a>
    <nav class="docnav-list">
{nav_items}
    </nav>
    <div class="navstat">10 章 · {sec_total} 节<br>{img_total} 张图</div>
  </aside>

  <main class="docmain">
    <div class="doc-eyebrow">— {eyebrow} / {num:02d}</div>
    <h1 class="doc-title">{h1}</h1>
    <p class="doc-lead">{lead}</p>
    <div class="doc-meta">
      <span class="chip">{sec_count} 节</span>
      <span class="chip">{img_count} 图</span>
    </div>
    <div class="rule"></div>
{body}
    <div class="qnav">
{prev_next}
    </div>
  </main>

  <aside class="docside">
    <div class="k">ON THIS PAGE</div>
    <ol>
{toc}
    </ol>
  </aside>
</div>
{footer}
<script src="assets/reader.js" defer></script>
</body>
</html>
"""

INDEX_PAGE = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>算法竞赛教程 · 朝云暮辞</title>
<meta name="description" content="算法竞赛教程笔记，10 章 172 节，按章分页阅读，含原文配图。">
<link rel="stylesheet" href="../计挑赛/assets/style.css">
<link rel="stylesheet" href="../计挑赛/assets/detail.css">
<link rel="stylesheet" href="assets/reader.css">
</head>
<body>
{topbar}
<main class="wrap">
  <section class="hero">
    <div class="hero-left">
      <div class="eyebrow">— Algorithm contest / 10 chapters</div>
      <h1>把算法竞赛，<br>按章读完。</h1>
      <p class="lede">整理自 dotcpp 的算法竞赛教程。原文是 172 篇各自独立的长页面，这里按原目录重排为 10 章：每章一个页面，左侧是全部章节，右侧是本章小标题，正文只保留「节 → 要点」、代码块与原文配图。图片走本地 webp + 懒加载，不依赖外站。</p>
    </div>
    <div class="hero-stat">
      <div class="num">10</div>
      <div class="stat-label">
        <span>章 · {sec_total} 节</span>
        <span>{img_total} 张原文配图</span>
      </div>
    </div>
  </section>

  <section class="idx-list">
    <div class="idx-head">
      <span>— Chapters / 章目录</span>
      <span>{words} 千字 · 2026</span>
    </div>
{rows}
  </section>
</main>
{footer}
</body>
</html>
"""


# ---------------------------------------------------------------- Markdown
def inline(text):
    text = escape(text, quote=False)
    text = re.sub(r"`([^`]+)`", r"<code>\1</code>", text)
    text = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", text)
    return text


def load_meta():
    with open(META, encoding="utf-8") as f:
        return json.load(f)


META_DATA = load_meta()


def img_path(src):
    name = os.path.basename(src)
    m = META_DATA.get(name)
    if m:
        return "assets/" + m["out"], m["w"], m["h"], "assets/" + name
    return "assets/" + name, 0, 0, "assets/" + name


def render_images(lines, i):
    out = []
    while i < len(lines) and lines[i].lstrip().startswith("!["):
        m = re.match(r"!\[(.*?)\]\s*\(\s*(.*?)\s*\)", lines[i].strip())
        i += 1
        if not m:
            continue
        alt, src = m.group(1), m.group(2)
        path, w, h, full = img_path(src)
        size = ' width="%d" height="%d"' % (w, h) if w and h else ""
        out.append(
            '<figure class="figure"><img src="%s"%s data-full="%s" loading="lazy" '
            'decoding="async" alt="%s" title="点击查看原图，滚轮或按钮缩放"></figure>'
            % (path, size, full, escape(alt, quote=True)))
    return "\n".join(out), i


def render_table(lines, i):
    rows = []
    while i < len(lines) and lines[i].strip().startswith("|"):
        rows.append(lines[i].strip())
        i += 1
    cells = [[c.strip() for c in r.strip("|").split("|")] for r in rows]
    if not cells:
        return "", i
    head = cells[0]
    body = [r for r in cells[1:] if not all(re.fullmatch(r":?-{2,}:?", c) for c in r if c)]
    html = ['<table class="dtable"><thead><tr>']
    html.append("".join("<th>%s</th>" % inline(c) for c in head))
    html.append("</tr></thead><tbody>")
    for r in body:
        html.append("<tr>" + "".join("<td>%s</td>" % inline(c) for c in r) + "</tr>")
    html.append("</tbody></table>\n")
    return "".join(html), i


def render_code(lines, i):
    lang = lines[i].strip()[3:].strip() or "text"
    i += 1
    buf = []
    while i < len(lines) and not lines[i].strip().startswith("```"):
        buf.append(lines[i])
        i += 1
    i += 1
    code = escape("\n".join(buf).rstrip("\n"), quote=False)
    return ('<div class="codecard"><div class="cc-head"><span class="lang">%s</span>'
            '<span class="sp"></span><button type="button" data-copy>复制</button></div>'
            "<pre><code>%s</code></pre></div>\n" % (escape(lang), code)), i


def is_block_start(line):
    s = line.strip()
    return (not s or s.startswith("- ") or s.startswith("`") or s.startswith("|")
            or s.startswith("![") or line.startswith("  - "))


def render_section_body(lines):
    out = []
    i, n = 0, len(lines)
    in_list = False

    def close():
        nonlocal in_list
        if in_list:
            out.append("</ul>")
            in_list = False

    while i < n:
        line = lines[i]
        s = line.strip()

        if not s:
            close()
            i += 1
            continue

        if s.startswith("```"):
            close()
            html, i = render_code(lines, i)
            out.append(html)
            continue

        if s.startswith("|"):
            close()
            html, i = render_table(lines, i)
            out.append(html)
            continue

        if s.startswith("!["):
            close()
            html, i = render_images(lines, i)
            out.append(html)
            continue

        if re.match(r"-+\s", s) and (line.startswith("- ") or line.startswith("  - ")):
            sub = line.startswith("  - ")
            if not in_list:
                out.append('<ul class="pts">')
                in_list = True
            text = re.sub(r"^-\s*", "", s)
            out.append('<li%s>%s</li>' % (' class="sub"' if sub else "", inline(text)))
            i += 1
            continue

        close()
        para = [s]
        i += 1
        while i < n and not is_block_start(lines[i]):
            para.append(lines[i].strip())
            i += 1
        out.append('<p class="doc-lead">%s</p>' % inline(" ".join(para)))

    close()
    return "\n".join(out)


def parse_note(path):
    with open(path, encoding="utf-8") as f:
        md = f.read()
    lines = md.splitlines()
    title = ""
    sections = []
    cur = None
    for line in lines:
        if line.startswith("# ") and not title:
            title = line[2:].strip()
            continue
        if line.startswith("## "):
            cur = {"raw": line[3:].strip(), "lines": []}
            sections.append(cur)
            continue
        if cur is not None:
            cur["lines"].append(line)
    return title, sections


def split_title(raw, idx):
    m = re.match(r"^(\d+)\s*[.、]\s*(.*)$", raw)
    if m:
        return int(m.group(1)), m.group(2).strip()
    return idx, raw.strip()


def chapter_files():
    files = [f for f in os.listdir(SRC) if f.endswith(".md") and re.match(r"^第\d{2}章", f)]
    files.sort(key=lambda f: int(re.match(r"^第(\d{2})章", f).group(1)))
    return files


def ch_slug(num):
    return "ch%02d.html" % num


def main():
    files = chapter_files()
    if not files:
        sys.exit("找不到 笔记/*.md")

    chapters = []
    total_sections = 0
    total_imgs = 0
    total_words = 0

    for path_name in files:
        num = int(re.match(r"^第(\d{2})章", path_name).group(1))
        h1, sections = parse_note(os.path.join(SRC, path_name))
        img_count = sum(len(re.findall(r"!\[", "".join(s["lines"]))) for s in sections)
        total_sections += len(sections)
        total_imgs += img_count
        total_words += len(re.findall(r"[\u4e00-\u9fa5]", "".join(
            "".join(s["lines"]) for s in sections))) / 1000.0
        chapters.append(dict(num=num, h1=h1, sections=sections,
                             img=img_count, file=ch_slug(num)))

    nav_items_tpl = '      <a href="%s"%s><span class="n">%02d</span><span class="t">%s</span></a>'

    for ch in chapters:
        body_parts = []
        toc_parts = []
        for k, sec in enumerate(ch["sections"], 1):
            no, title = split_title(sec["raw"], k)
            anchor = "s%d" % k
            body_parts.append(
                '<section class="dsec" id="%s">\n'
                '  <div class="sec-no">%02d / SECTION</div>\n'
                '  <h2>%s</h2>\n%s\n</section>'
                % (anchor, k, inline(title), render_section_body(sec["lines"])))
            toc_parts.append('      <li><a href="#%s">%s</a></li>' % (anchor, inline(title)))

        nav_items = []
        for c in chapters:
            short = re.sub(r"^第[一二三四五六七八九十]+章\s*", "", c["h1"])
            nav_items.append(nav_items_tpl % (
                c["file"], ' class="on"' if c["num"] == ch["num"] else "",
                c["num"], escape(short)))

        idx = ch["num"] - 1
        prev_c = chapters[idx - 1] if idx > 0 else None
        next_c = chapters[idx + 1] if idx < len(chapters) - 1 else None

        def qnav(c, kind):
            if not c:
                txt = "已是第一章" if kind == "prev" else "已是最后一章"
                return ('        <a class="%s disabled"><span class="k">%s</span><span class="t">%s</span></a>'
                        % (kind, "PREV" if kind == "prev" else "NEXT", txt))
            short = re.sub(r"^第[一二三四五六七八九十]+章\s*", "", c["h1"])
            return ('        <a class="%s" href="%s"><span class="k">%s / %02d</span><span class="t">%s</span></a>'
                    % (kind, c["file"], "PREV" if kind == "prev" else "NEXT", c["num"], escape(short)))

        prev_next = "\n".join([qnav(prev_c, "prev"), qnav(next_c, "next")])

        html = PAGE.format(
            page_title="%s · 算法竞赛教程" % ch["h1"],
            desc=escape("%s — %s" % (ch["h1"], LEADS.get(ch["num"], "")), quote=True),
            topbar=TOPBAR.format(p="../", active=' class="active"'),
            nav_items="\n".join(nav_items),
            sec_total=total_sections,
            img_total=total_imgs,
            eyebrow=EYEBROW,
            num=ch["num"],
            h1=inline(ch["h1"]),
            lead=escape(LEADS.get(ch["num"], ""), quote=False),
            sec_count=len(ch["sections"]),
            img_count=ch["img"],
            body="\n".join(body_parts),
            prev_next=prev_next,
            toc="\n".join(toc_parts),
            footer=FOOTER.format(p="../"),
        )
        with open(os.path.join(OUT, ch["file"]), "w", encoding="utf-8") as f:
            f.write(html)
        print("  %s  %5.1f KB  %2d 节 %3d 图" % (ch["file"], len(html.encode()) / 1024,
                                                len(ch["sections"]), ch["img"]))

    rows = []
    for c in chapters:
        short = re.sub(r"^第[一二三四五六七八九十]+章\s*", "", c["h1"])
        rows.append(
            '    <a class="idx-row" href="%s">\n'
            '      <div class="idx-no">%02d / CH</div>\n'
            '      <div class="idx-main"><h3>%s</h3><p>%s</p></div>\n'
            '      <div class="idx-side"><span class="tag">%d 节 · %d 图</span><span class="go">→</span></div>\n'
            "    </a>" % (c["file"], c["num"], escape(short),
                          escape(LEADS.get(c["num"], ""), quote=False), len(c["sections"]), c["img"]))

    index_html = INDEX_PAGE.format(
        topbar=TOPBAR.format(p="../", active=' class="active"'),
        sec_total=total_sections,
        img_total=total_imgs,
        words=int(total_words),
        rows="\n".join(rows),
        footer=FOOTER.format(p="../"),
    )
    with open(os.path.join(OUT, "index.html"), "w", encoding="utf-8") as f:
        f.write(index_html)

    print("\nindex.html  %d 章 / %d 节 / %d 图" % (len(chapters), total_sections, total_imgs))


if __name__ == "__main__":
    main()
