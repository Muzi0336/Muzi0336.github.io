# -*- coding: utf-8 -*-
"""把笔记里所有代码块导出成 JSON，便于在别的机器上做编译体检。"""
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NOTES = os.path.join(ROOT, "笔记")
out = []
for fn in sorted(os.listdir(NOTES)):
    if not fn.startswith("第") or not fn.endswith(".md"):
        continue
    txt = open(os.path.join(NOTES, fn), encoding="utf-8").read()
    for m in re.finditer(r"(?m)^## (.+)$", txt):
        title = m.group(1).strip()
        start = m.end()
        nxt = re.search(r"(?m)^## ", txt[start:])
        body = txt[start:start + (nxt.start() if nxt else len(txt))]
        for cb in re.finditer(r"```(?:cpp|c\+\+|c)?\n(.*?)```", body, re.S):
            out.append({"file": fn, "sec": title, "code": cb.group(1)})

path = os.path.join(ROOT, "cache", "codeblocks.json")
with open(path, "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, indent=1)
print("代码块", len(out), "->", path)
