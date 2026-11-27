# -*- coding: utf-8 -*-
import re
import urllib.request

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"}


def get(u):
    return urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=30).read().decode("utf-8", "replace")


idx = get("https://www.dotcpp.com/course/algorithm/")
blocks = re.findall(r"<dl[^>]*>.*?</dl>", idx, re.S)
print("dl blocks:", len(blocks), "dd total:", len(re.findall(r"<dd", idx)))

art = get("https://www.dotcpp.com/course/924")
s = art.find("<!-- S 正文 -->")
e = art.find("<!-- E 正文 -->")
body = art[s:e]
print("page len", len(art), "body len", len(body))
print("pre count", body.count("<pre"), "img count", body.count("<img"))
print(body[:1500])
print("......TAIL......")
print(body[-2000:])
