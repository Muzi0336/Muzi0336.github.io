# -*- coding: utf-8 -*-
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
from fetch_algorithm import parse_toc, fetch_text, BASE  # noqa: E402

ch = parse_toc(fetch_text(BASE))
files = sorted(x for x in os.listdir(os.path.join(ROOT, "笔记")) if x.startswith("第") and x.endswith(".md"))
tot_src = 0
tot_note = 0
for i, c in enumerate(ch):
    txt = open(os.path.join(ROOT, "笔记", files[i]), encoding="utf-8").read()
    n = len(re.findall(r"(?m)^## ", txt))
    tot_src += len(c["items"])
    tot_note += n
    flag = "OK" if n == len(c["items"]) else "DIFF"
    print("第%02d章 原文 %2d 节 / 笔记 %2d 节  %s" % (i + 1, len(c["items"]), n, flag))
print("合计：原文 %d 节，笔记 %d 节" % (tot_src, tot_note))
