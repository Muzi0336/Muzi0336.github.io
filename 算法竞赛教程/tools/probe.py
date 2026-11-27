# -*- coding: utf-8 -*-
import re
import urllib.request

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"}
u = "https://www.dotcpp.com/course/algorithm/"
h = urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=30).read().decode("utf-8", "replace")
print("len", len(h))
print("S正文", "S 正文" in h, "E正文", "E 正文" in h)
print(re.findall(r"<dl[^>]*>", h)[:3])
print(re.findall(r'<dt[^>]*>.*?</dt>', h, re.S)[:1])
print(re.findall(r'href="([^"]*)"', h)[:40])
print("--- sample dd ---")
print(re.findall(r"<dd[^>]*>.*?</dd>", h, re.S)[:2])
