# -*- coding: utf-8 -*-
"""从 cache/pages.json 里按章节导出“提炼素材”纯文本，供写笔记用。"""
import html as htmllib
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
from fetch_algorithm import parse_toc, fetch_text, abs_url, BASE  # noqa: E402

CACHE = os.path.join(ROOT, "cache", "pages.json")
OUT = os.path.join(ROOT, "cache", "chapters")


def to_text(body):
    body = re.sub(r"<(?:script|style)[^>]*>.*?</(?:script|style)>", "", body, flags=re.S | re.I)
    body = re.sub(r"<!--.*?-->", "", body, flags=re.S)
    # 代码块
    def pre(m):
        code = htmllib.unescape(re.sub(r"<[^>]+>", "", m.group(1))).replace("\xa0", " ")
        lines = [ln.rstrip() for ln in code.split("\n")]
        while lines and not lines[0].strip():
            lines.pop(0)
        while lines and not lines[-1].strip():
            lines.pop()
        if len(lines) > 22:
            lines = lines[:22] + ["...（后略）"]
        return "\n{{CODE}}\n" + "\n".join(lines) + "\n{{/CODE}}\n"
    body = re.sub(r"<pre[^>]*>(.*?)</pre>", pre, body, flags=re.S | re.I)
    body = re.sub(r"<img[^>]*>", "\n{{IMG}}\n", body, flags=re.I)
    body = re.sub(r"</?(?:p|div|br|li|tr|h[1-6]|table|ul|ol|dd|dt)[^>]*>", "\n", body, flags=re.I)
    body = re.sub(r"<[^>]+>", "", body)
    body = htmllib.unescape(body).replace("\xa0", " ")
    lines = []
    for ln in body.split("\n"):
        ln = re.sub(r"[ \t]+", " ", ln).strip()
        if ln:
            lines.append(ln)
    return "\n".join(lines)


def main():
    os.makedirs(OUT, exist_ok=True)
    chapters = parse_toc(fetch_text(BASE))
    pages = json.load(open(CACHE, encoding="utf-8"))
    report = []
    for ci, ch in enumerate(chapters, 1):
        parts = [f"# {ch['title']}（{len(ch['items'])} 节）\n"]
        for ii, it in enumerate(ch["items"], 1):
            raw = pages.get(it["url"], "")
            txt = to_text(raw)
            parts.append(f"\n## [{ii}] {it['title']}\n{txt}\n")
        name = f"第{ci:02d}章.txt"
        with open(os.path.join(OUT, name), "w", encoding="utf-8") as f:
            f.write("\n".join(parts))
        size = os.path.getsize(os.path.join(OUT, name))
        report.append((ci, ch["title"], len(ch["items"]), round(size / 1024)))
    for r in report:
        print(r)


if __name__ == "__main__":
    main()
