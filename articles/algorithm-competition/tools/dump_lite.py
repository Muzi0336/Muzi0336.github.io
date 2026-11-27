# -*- coding: utf-8 -*-
"""导出精简素材：每节正文截断到 ~1000 字，代码只留前 12 行，便于快速写笔记。"""
import html as htmllib
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
from fetch_algorithm import parse_toc, fetch_text, BASE  # noqa: E402

CACHE = os.path.join(ROOT, "cache", "pages.json")
OUT = os.path.join(ROOT, "cache", "chapters_lite")
TEXT_LIMIT = 1100
CODE_LINES = 12


def to_text(body):
    body = re.sub(r"<(?:script|style)[^>]*>.*?</(?:script|style)>", "", body, flags=re.S | re.I)
    body = re.sub(r"<!--.*?-->", "", body, flags=re.S)
    codes = []

    def pre(m):
        code = htmllib.unescape(re.sub(r"<[^>]+>", "", m.group(1))).replace("\xa0", " ")
        lines = [ln.rstrip() for ln in code.split("\n")]
        while lines and not lines[0].strip():
            lines.pop(0)
        while lines and not lines[-1].strip():
            lines.pop()
        if len(lines) > CODE_LINES:
            lines = lines[:CODE_LINES] + ["..."]
        codes.append("\n".join(lines))
        return f"\n@@C{len(codes) - 1}@@\n"

    body = re.sub(r"<pre[^>]*>(.*?)</pre>", pre, body, flags=re.S | re.I)
    body = re.sub(r"<img[^>]*>", "", body, flags=re.I)
    body = re.sub(r"</?(?:p|div|br|li|tr|h[1-6]|table|ul|ol|dd|dt)[^>]*>", "\n", body, flags=re.I)
    body = re.sub(r"<[^>]+>", "", body)
    body = htmllib.unescape(body).replace("\xa0", " ")
    lines = [re.sub(r"[ \t]+", " ", ln).strip() for ln in body.split("\n")]
    lines = [ln for ln in lines if ln]
    text = "\n".join(lines)
    if len(text) > TEXT_LIMIT:
        text = text[:TEXT_LIMIT] + "\n…（截断）"
    for i, c in enumerate(codes):
        text = text.replace(f"@@C{i}@@", "```\n" + c + "\n```")
    return text


def main():
    os.makedirs(OUT, exist_ok=True)
    chapters = parse_toc(fetch_text(BASE))
    pages = json.load(open(CACHE, encoding="utf-8"))
    for ci, ch in enumerate(chapters, 1):
        parts = [f"# {ch['title']}（{len(ch['items'])} 节）"]
        for ii, it in enumerate(ch["items"], 1):
            parts.append(f"\n## [{ii}] {it['title']}\n{to_text(pages.get(it['url'], ''))}")
        with open(os.path.join(OUT, f"第{ci:02d}章.txt"), "w", encoding="utf-8") as f:
            f.write("\n".join(parts))
        print(f"第{ci:02d}章 {ch['title']} {os.path.getsize(os.path.join(OUT, f'第{ci:02d}章.txt')) // 1024}KB")


if __name__ == "__main__":
    main()
