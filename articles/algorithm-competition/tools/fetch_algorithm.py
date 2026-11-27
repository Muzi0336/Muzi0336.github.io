# -*- coding: utf-8 -*-
"""
把 https://www.dotcpp.com/course/algorithm/ 算法竞赛教程抓成本地离线站点。

输出：
  算法竞赛教程/index.html        目录（带全文搜索，数据内嵌，file:// 可直接用）
  算法竞赛教程/pages/c01-01.html  每篇正文一页
  算法竞赛教程/assets/style.css
  算法竞赛教程/assets/images/     正文图片
  算法竞赛教程/.cache/pages.json  原始正文缓存，支持断点续跑
"""
import hashlib
import html as htmllib
import json
import os
import re
import sys
import time
import urllib.request

BASE = "https://www.dotcpp.com/course/algorithm/"
HOST = "https://www.dotcpp.com"
UA = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0 Safari/537.36",
    "Accept-Language": "zh-CN,zh;q=0.9",
    "Referer": "https://www.dotcpp.com/course/algorithm/",
}
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, "cache")
PAGES_DIR = os.path.join(ROOT, "pages")
ASSETS = os.path.join(ROOT, "assets")
IMGS = os.path.join(ASSETS, "images")


def fetch(url, timeout=40):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


def fetch_text(url, timeout=40):
    return fetch(url, timeout).decode("utf-8", "replace")


def abs_url(u):
    u = htmllib.unescape(u.strip())
    if u.startswith("//"):
        return "https:" + u
    if u.startswith("/"):
        return HOST + u
    return u


def clean_text(s):
    return re.sub(r"\s+", " ", htmllib.unescape(re.sub(r"<[^>]+>", "", s))).strip()


def parse_toc(index_html):
    chapters = []
    for block in re.findall(r"<dl[^>]*>.*?</dl>", index_html, re.S):
        dt = re.search(r"<dt[^>]*>.*?<a[^>]*href=['\"]([^'\"]+)['\"][^>]*>(.*?)</a>", block, re.S)
        if not dt:
            continue
        title = clean_text(dt.group(2))
        href = abs_url(dt.group(1))
        # 索引页底部会重复出现本页自身的链接块，跳过
        if title == "算法竞赛教程" or href.rstrip("/") == BASE.rstrip("/"):
            continue
        cur = {"title": title, "items": []}
        for dd in re.findall(r"<dd[^>]*>.*?</dd>", block, re.S):
            a = re.search(r"<a[^>]*href=['\"]([^'\"]+)['\"][^>]*>(.*?)</a>", dd, re.S)
            if a:
                cur["items"].append({"title": clean_text(a.group(2)), "url": abs_url(a.group(1))})
        if cur["items"]:
            chapters.append(cur)
    return chapters


def extract_body(page):
    s = page.find("<!-- S 正文 -->")
    e = page.find("<!-- E 正文 -->")
    if s == -1 or e == -1 or e <= s:
        raise ValueError("找不到正文标记")
    return page[s + len("<!-- S 正文 -->"):e]


def sanitize(body):
    """去掉样式/脚本/广告类标签，统一代码块实体。"""
    body = re.sub(r"<script[^>]*>.*?</script>", "", body, flags=re.S | re.I)
    body = re.sub(r"<style[^>]*>.*?</style>", "", body, flags=re.S | re.I)
    body = re.sub(r"<!--.*?-->", "", body, flags=re.S)
    body = re.sub(r"<pre[^>]*>", "<pre>", body, flags=re.I)
    body = re.sub(r'\s(?:style|class|id|align|width|height|border|cellpadding|cellspacing)='
                  r'(["\']).*?\1', "", body, flags=re.S | re.I)
    # 空段落
    body = re.sub(r"<p>\s*(?:<br\s*/?>|&nbsp;|\s)*</p>", "", body, flags=re.I)
    return body


def fix_code_blocks(body):
    def rep(m):
        code = htmllib.unescape(re.sub(r"<[^>]+>", "", m.group(1)))
        code = code.replace("\xa0", " ")
        code = code.replace("\r\n", "\n").rstrip()
        return "<pre><code>" + htmllib.escape(code) + "</code></pre>"
    return re.sub(r"<pre>(.*?)</pre>", rep, body, flags=re.S | re.I)


def download_img(url):
    ext = os.path.splitext(url.split("?")[0])[1].lower()
    if ext not in (".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".bmp"):
        ext = ".png"
    name = hashlib.md5(url.encode()).hexdigest()[:16] + ext
    path = os.path.join(IMGS, name)
    if os.path.exists(path) and os.path.getsize(path) > 0:
        return name
    try:
        data = fetch(url)
        with open(path, "wb") as f:
            f.write(data)
        return name
    except Exception as exc:  # noqa: BLE001
        print("  ! 图片失败", url, exc, file=sys.stderr)
        return None


def rewrite_images(body, img_map):
    def rep(m):
        src = re.search(r"src=['\"]([^'\"]+)['\"]", m.group(0))
        if not src:
            return ""
        u = abs_url(src.group(1))
        if u.startswith("data:"):
            return m.group(0)
        if u not in img_map:
            img_map[u] = download_img(u)
        name = img_map[u]
        alt = re.search(r"alt=['\"]([^'\"]*)['\"]", m.group(0))
        alt_attr = f' alt="{htmllib.escape(alt.group(1))}"' if alt else ' alt=""'
        if name:
            return f'<img src="../assets/images/{name}"{alt_attr} loading="lazy">'
        return f'<img src="{htmllib.escape(u)}"{alt_attr} loading="lazy">'
    body = re.sub(r"<img[^>]*>", rep, body, flags=re.I)
    # 站内链接改成本地页（若指向本教程内的文章）
    return body


def plain_text(body):
    t = re.sub(r"<(?:script|style)[^>]*>.*?</(?:script|style)>", "", body, flags=re.S | re.I)
    t = re.sub(r"<[^>]+>", " ", t)
    t = htmllib.unescape(t).replace("\xa0", " ")
    return re.sub(r"\s+", " ", t).strip()


INDEX_CSS = """/* 目录页 */
:root{--fg:#20242b;--muted:#6b7280;--line:#e6e8eb;--accent:#2563eb;--bg:#fafaf8}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.8 "Microsoft YaHei",system-ui,sans-serif}
.wrap{max-width:960px;margin:0 auto;padding:56px 24px 90px;background:#fff;min-height:100vh;
 box-shadow:0 0 0 1px var(--line)}
header{border-bottom:3px solid #111;padding-bottom:18px;margin-bottom:22px}
h1{margin:0 0 6px;font-size:26px;letter-spacing:.5px}
.sub{color:var(--muted);font-size:13px}
.tools{position:sticky;top:0;background:#fff;padding:14px 0 10px;margin:0 0 8px;z-index:5;border-bottom:1px solid var(--line)}
#q{width:100%;padding:10px 14px;font-size:15px;border:1px solid var(--line);border-radius:8px;outline:none;
 font-family:inherit;background:#fdfdfd}
#q:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(37,99,235,.1)}
#hint{color:var(--muted);font-size:12px;margin-top:6px;min-height:18px}
.ch{font-weight:700;font-size:15px;color:var(--accent);margin:26px 0 10px;padding-left:2px;
 border-left:3px solid var(--accent);padding:0 0 0 8px}
ul.li{list-style:none;margin:0 0 8px;padding:0 0 0 12px}
ul.li li{padding:3px 0}
ul.li a{color:#333;text-decoration:none;border-bottom:1px solid transparent}
ul.li a:hover{color:var(--accent);border-bottom-color:#bfd3fb}
ul.li a .t{display:inline}
.result{display:block;margin:0 0 14px;padding:10px 12px;border:1px solid var(--line);border-radius:8px;
 text-decoration:none;color:inherit;background:#fff}
.result:hover{border-color:#bfd3fb;background:#f7faff}
.result .rt{font-weight:700;font-size:15px}
.result .rp{color:var(--muted);font-size:13px;margin-top:4px;line-height:1.7}
.result .rc{color:var(--accent);font-size:12px}
#list.hide{display:none}
#results{display:none}
footer{margin-top:48px;padding-top:16px;border-top:1px solid var(--line);color:var(--muted);font-size:12.5px;line-height:1.9}
"""

PAGE_CSS_PATH = "assets/style.css"


def build_page_shell(title, body_html, nav_html, prev_link, next_link, crumb):
    return f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{htmllib.escape(title)} · 算法竞赛教程</title>
<link rel="stylesheet" href="../{PAGE_CSS_PATH}">
</head>
<body>
<aside class="side">
<div class="side-head"><a href="../index.html" class="home">算法竞赛教程</a><span class="src">离线版</span></div>
{nav_html}
</aside>
<main>
<div class="crumb">{crumb}</div>
<article>
<h1>{htmllib.escape(title)}</h1>
{body_html}
</article>
<div class="pager">
{f'<a class="prev" href="{prev_link[0]}">← {htmllib.escape(prev_link[1])}</a>' if prev_link else '<span></span>'}
{f'<a class="next" href="{next_link[0]}">{htmllib.escape(next_link[1])} →</a>' if next_link else '<span></span>'}
</div>
</main>
</body>
</html>
"""


def main():
    for d in (CACHE, PAGES_DIR, ASSETS, IMGS):
        os.makedirs(d, exist_ok=True)

    print("抓取目录页 ...")
    chapters = parse_toc(fetch_text(BASE))
    total = sum(len(c["items"]) for c in chapters)
    print(f"{len(chapters)} 章 / {total} 篇")
    if total == 0:
        raise SystemExit("目录解析为空，页面结构可能变了")

    pages_file = os.path.join(CACHE, "pages.json")
    pages = {}
    if os.path.exists(pages_file):
        with open(pages_file, encoding="utf-8") as f:
            pages = json.load(f)

    done = 0
    for ci, ch in enumerate(chapters, 1):
        for ii, it in enumerate(ch["items"], 1):
            url = it["url"]
            if url in pages:
                continue
            try:
                pages[url] = extract_body(fetch_text(url))
                done += 1
                print(f"[{ci}-{ii}] ok {it['title']}")
            except Exception as exc:  # noqa: BLE001
                print(f"[{ci}-{ii}] FAIL {it['title']}: {exc}", file=sys.stderr)
            time.sleep(0.6)
            if done % 10 == 0:
                with open(pages_file, "w", encoding="utf-8") as f:
                    json.dump(pages, f, ensure_ascii=False)
    with open(pages_file, "w", encoding="utf-8") as f:
        json.dump(pages, f, ensure_ascii=False)
    print(f"正文缓存 {len(pages)}/{total}")

    # 图片
    img_map = {}
    for url, raw in pages.items():
        for src in re.findall(r"<img[^>]*?src=['\"]([^'\"]+)['\"]", raw, re.I):
            u = abs_url(src)
            if u.startswith("data:") or u in img_map:
                continue
            img_map[u] = download_img(u)
    print("图片", len([v for v in img_map.values() if v]), "/", len(img_map))

    # 页面
    nav_items = []   # (chapter_index, title, filename)
    for ci, ch in enumerate(chapters, 1):
        for ii, it in enumerate(ch["items"], 1):
            nav_items.append((ci, ch["title"], it["title"], it["url"]))

    # 侧栏（每页内嵌，静态好点）
    def nav_html_for(cur_fname):
        parts = ['<nav class="toc">']
        last_ch = None
        for (ci, ch_title, title, url) in nav_items:
            fname = fname_of(ci, nav_items, url)
            if ch_title != last_ch:
                if last_ch is not None:
                    parts.append("</ol>")
                parts.append(f'<div class="ch">{htmllib.escape(ch_title)}</div><ol>')
                last_ch = ch_title
            cls = ' class="on"' if fname == cur_fname else ""
            parts.append(f'<li><a href="{fname}"{cls}>{htmllib.escape(title)}</a></li>')
        parts.append("</ol></nav>")
        return "".join(parts)

    def fname_of(ci, items, url):
        for idx, (c, _, _, u) in enumerate(items):
            if u == url:
                ii = sum(1 for (c2, _, _, _) in items[:idx] if c2 == c) + 1
                return f"c{ci:02d}-{ii:02d}.html"
        return "#"

    search_data = []
    for idx, (ci, ch_title, title, url) in enumerate(nav_items):
        raw = pages.get(url, "")
        body = fix_code_blocks(sanitize(raw))
        body = rewrite_images(body, img_map)
        # 站内其他文章链接 → 本地页
        for (c2, _, t2, u2) in nav_items:
            if u2 != url:
                body = body.replace(f'href="{u2}"', f'href="{fname_of(c2, nav_items, u2)}"')
                body = body.replace(f'href="{HOST}/course/{u2.rstrip("/").split("/")[-1]}"',
                                    f'href="{fname_of(c2, nav_items, u2)}"')
        if not body.strip():
            body = "<p>（这一篇抓取失败，可访问原网页查看）</p>"
        fname = fname_of(ci, nav_items, url)
        prev_link = None
        next_link = None
        if idx > 0:
            pc, _, pt, pu = nav_items[idx - 1]
            prev_link = (fname_of(pc, nav_items, pu), pt)
        if idx < len(nav_items) - 1:
            nc, _, nt, nu = nav_items[idx + 1]
            next_link = (fname_of(nc, nav_items, nu), nt)
        crumb = f'<a href="../index.html">目录</a> / {htmllib.escape(ch_title)}'
        html_doc = build_page_shell(title, body, nav_html_for(fname), prev_link, next_link, crumb)
        with open(os.path.join(PAGES_DIR, fname), "w", encoding="utf-8") as f:
            f.write(html_doc)
        txt = plain_text(raw)[:1800]
        search_data.append({"f": f"pages/{fname}", "t": title, "c": ch_title, "x": txt})
        if idx % 20 == 0:
            print("生成", fname)

    # 目录页
    toc_html = []
    for ci, ch in enumerate(chapters, 1):
        toc_html.append(f'<div class="ch">{htmllib.escape(ch["title"])}</div><ul class="li">')
        for ii, it in enumerate(ch["items"], 1):
            toc_html.append(f'<li><a href="pages/{fname_of(ci, nav_items, it["url"])}">{htmllib.escape(it["title"])}</a></li>')
        toc_html.append("</ul>")
    data_js = json.dumps(search_data, ensure_ascii=False).replace("</", "<\\/")

    index_doc = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>算法竞赛教程（离线版）</title>
<style>{INDEX_CSS}</style>
</head>
<body>
<div class="wrap">
<header>
<h1>算法竞赛教程</h1>
<div class="sub">Dotcpp 编程 · 离线本地版 ｜ {len(chapters)} 章 · {total} 篇 ｜ 双击本文件即可阅读，无需联网</div>
</header>
<div class="tools">
<input id="q" type="search" placeholder="搜索标题或正文关键词，如 动态规划、KMP、背包" autocomplete="off">
<div id="hint">共 {total} 篇，输入关键词开始搜索</div>
</div>
<div id="list">
{''.join(toc_html)}
</div>
<div id="results"></div>
<footer>
内容来源：<a href="https://www.dotcpp.com/course/algorithm/">www.dotcpp.com/course/algorithm/</a>，版权归原作者所有，此离线版仅供个人学习使用。<br>
抓取时间：{time.strftime('%Y-%m-%d')} ｜ 若某篇排版异常，可对照原网页阅读。
</footer>
</div>
<script>
const DATA = {data_js};
const q = document.getElementById('q'), list = document.getElementById('list'),
      res = document.getElementById('results'), hint = document.getElementById('hint');
function esc(s){{const d=document.createElement('div');d.textContent=s;return d.innerHTML;}}
function run(){{
  const k = q.value.trim().toLowerCase();
  if(!k){{list.classList.remove('hide');res.style.display='none';res.innerHTML='';
    hint.textContent='共 {total} 篇，输入关键词开始搜索';return;}}
  list.classList.add('hide');res.style.display='block';
  const hits=[];
  for(const it of DATA){{
    const inTitle = it.t.toLowerCase().includes(k);
    const i = it.x.toLowerCase().indexOf(k);
    if(inTitle) hits.push([it,-1]); else if(i>=0) hits.push([it,i]);
  }}
  hits.sort((a,b)=>(a[1]<0?-1:0)-(b[1]<0?-1:0));
  hint.textContent = hits.length ? ('命中 '+hits.length+' 篇') : '没有找到，换个关键词试试';
  res.innerHTML = hits.slice(0,80).map(([it,i])=>{{
    let snip='';
    if(i>=0){{const s=Math.max(0,i-60),e=i+k.length+120;
      snip='<div class="rp">…'+esc(it.x.slice(s,e))+'…</div>';}}
    return '<a class="result" href="'+it.f+'"><div class="rc">'+esc(it.c)+'</div>'+
      '<div class="rt">'+esc(it.t)+'</div>'+snip+'</a>';
  }}).join('') || '<div class="rp">没有匹配结果。</div>';
}}
let timer;q.addEventListener('input',()=>{{clearTimeout(timer);timer=setTimeout(run,120);}});
</script>
</body>
</html>
"""
    with open(os.path.join(ROOT, "index.html"), "w", encoding="utf-8") as f:
        f.write(index_doc)
    print("目录页完成")
    print("总大小 MB:", round(sum(os.path.getsize(os.path.join(dp, fn)) for dp, _, fs in os.walk(ROOT) for fn in fs) / 1048576, 1))


if __name__ == "__main__":
    main()
