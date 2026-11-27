# -*- coding: utf-8 -*-
"""核对笔记与原文素材：章节覆盖、代码片段一致度、图片资源可用性。"""
import html as htmllib
import json
import os
import re
import sys
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
from fetch_algorithm import parse_toc, fetch_text, abs_url, BASE  # noqa: E402

NOTES = os.path.join(ROOT, "笔记")
CACHE = os.path.join(ROOT, "cache", "pages.json")
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0",
      "Referer": "https://www.dotcpp.com/course/algorithm/"}


def note_sections(path):
    txt = open(path, encoding="utf-8").read()
    parts = re.split(r"(?m)^## ", txt)
    head = parts[0]
    secs = []
    for p in parts[1:]:
        lines = p.split("\n")
        secs.append({"title": lines[0].strip(), "body": "\n".join(lines[1:])})
    return head, secs


def code_blocks(md):
    out = []
    for m in re.finditer(r"```[a-zA-Z0-9+-]*\n(.*?)```", md, re.S):
        out.append(m.group(1))
    return out


def norm_lines(code):
    s = code.replace("\xa0", " ")
    out = []
    for ln in s.split("\n"):
        ln = re.sub(r"[ \t]+", " ", ln).strip()
        if ln and ln not in ("...", "…"):
            out.append(ln)
    return out


def src_blocks(body):
    blocks = []
    for m in re.finditer(r"<pre[^>]*>(.*?)</pre>", body, re.S | re.I):
        code = htmllib.unescape(re.sub(r"<[^>]+>", "", m.group(1))).replace("\xa0", " ")
        blocks.append(norm_lines(code))
    return blocks


def match_ratio(note_block, srcs):
    nl = norm_lines(note_block)
    if not nl:
        return 1.0, []
    allsrc = set()
    for b in srcs:
        allsrc.update(b)
    hit = sum(1 for ln in nl if ln in allsrc)
    miss = [ln for ln in nl if ln not in allsrc]
    return hit / len(nl), miss


def img_check(url):
    try:
        req = urllib.request.Request(url, headers=UA, method="HEAD")
        with urllib.request.urlopen(req, timeout=15) as r:
            return r.status, r.headers.get("Content-Type", ""), r.headers.get("Content-Length", "")
    except Exception as exc:  # noqa: BLE001
        return "ERR", str(exc), ""


def main():
    chapters = parse_toc(fetch_text(BASE))
    pages = json.load(open(CACHE, encoding="utf-8"))
    note_files = sorted(f for f in os.listdir(NOTES) if f.startswith("第") and f.endswith(".md"))

    report = []
    code_flags = []
    img_stats = {}
    miss_sections = []
    total_sec = 0

    for ci, ch in enumerate(chapters, 1):
        if ci - 1 >= len(note_files):
            break
        path = os.path.join(NOTES, note_files[ci - 1])
        head, secs = note_sections(path)
        items = ch["items"]
        report.append(f"\n## 第{ci:02d}章 {ch['title']}（原文 {len(items)} 节 / 笔记 {len(secs)} 节）")
        for ii, it in enumerate(items, 1):
            if ii > len(secs):
                miss_sections.append((ci, ii, it["title"]))
                continue
            total_sec += 1
            sec = secs[ii - 1]
            body = pages.get(it["url"], "")
            srcs = src_blocks(body)
            n_note_codes = 0
            for cb in code_blocks(sec["body"]):
                n_note_codes += 1
                ratio, miss = match_ratio(cb, srcs)
                if ratio < 0.6:
                    code_flags.append({
                        "ch": ci, "sec": sec["title"], "ratio": round(ratio, 2),
                        "miss": miss[:6], "code": cb.strip()[:300],
                    })
            imgs = [abs_url(u) for u in re.findall(r"<img[^>]*?src=['\"]([^'\"]+)['\"]", body, re.I)]
            for u in imgs:
                if u.startswith("data:"):
                    continue
                img_stats.setdefault(u, None)
            report.append(
                f"  - [{ii}] {sec['title']} | 原文代码块 {len(srcs)} / 笔记代码块 {n_note_codes} | 图片 {len(imgs)}")

    print("\n".join(report))
    print(f"\n覆盖：原文 {sum(len(c['items']) for c in chapters)} 节，核对 {total_sec} 节，缺失 {len(miss_sections)} 节")
    for m in miss_sections:
        print("  缺失:", m)

    print(f"\n代码块：共 {sum(1 for _ in [])} —— 待比对项 {len(code_flags)} 个（笔记代码与原文差异较大）")
    for f in code_flags:
        print(f"  [{f['ch']}-{f['sec']}] 一致度 {f['ratio']} 未命中行: {f['miss']}")

    print(f"\n图片：共 {len(img_stats)} 个不同 URL，开始抽检 ...")
    bad = []
    sizes = 0
    if "--no-img" in sys.argv:
        print("  （本次跳过图片检查）")
    else:
        for i, u in enumerate(img_stats):
            st, ctype, clen = img_check(u)
            if st != 200 or not ctype.startswith("image"):
                bad.append((u, st, ctype))
            else:
                try:
                    sizes += int(clen or 0)
                except ValueError:
                    pass
            if (i + 1) % 100 == 0:
                print(f"  ... 已检查 {i + 1}")
        print(f"图片检查完成：正常 {len(img_stats) - len(bad)} / 异常 {len(bad)}，累计约 {sizes // 1024} KB")
    for b in bad[:20]:
        print("  异常:", b)

    with open(os.path.join(NOTES, "核对明细.md"), "w", encoding="utf-8") as f:
        f.write("# 逐节核对明细（自动生成，供抽查用）\n\n")
        f.write("\n".join(report))
        f.write(f"\n\n覆盖：原文 {sum(len(c['items']) for c in chapters)} 节，核对 {total_sec} 节，缺失 {len(miss_sections)} 节。\n")
        f.write(f"\n图片：{len(img_stats)} 个 URL，异常 {len(bad)} 个。\n")
        f.write("\n## 笔记代码与原文差异较大的片段\n")
        for fc in code_flags:
            f.write(f"\n### 第{fc['ch']}章 {fc['sec']}（一致度 {fc['ratio']}）\n")
            f.write("未在原文出现的行：" + " / ".join(fc["miss"]) + "\n")
            f.write("```\n" + fc["code"] + "\n```\n")
    print("\n报告已写入 笔记/核对明细.md")


if __name__ == "__main__":
    main()
