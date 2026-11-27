# -*- coding: utf-8 -*-
"""
算法竞赛教程 · 把原文配图挂进 Markdown 笔记
================================================================
读 assets/img_index.json，在每个 ## 小节的末尾追加：

    ![图1 枚举算法的流程图](assets/d652c2b42990f392.png)

脚本是幂等的：重跑会先删掉已有的图片行，再按索引重建。
想调某张图的位置 / 顺序，直接改 md 里的这几行即可（或改 img_index.json 后重跑）。
用法：python tools/attach_images.py
"""
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "笔记")
INDEX = os.path.join(ROOT, "assets", "img_index.json")
IMG_LINE = re.compile(r"^\s*!\[.*?\]\s*\(\s*assets/[^)]*\)\s*$")


def main():
    with open(INDEX, encoding="utf-8") as f:
        index = json.load(f)

    total = 0
    for fname in sorted(os.listdir(SRC)):
        if not (fname.endswith(".md") and re.match(r"^第\d{2}章", fname)):
            continue
        num = int(re.match(r"^第(\d{2})章", fname).group(1))
        sec_imgs = index.get("第%02d章" % num, {})

        with open(os.path.join(SRC, fname), encoding="utf-8") as f:
            lines = f.read().splitlines()
        lines = [ln for ln in lines if not IMG_LINE.match(ln)]

        heads = [i for i, ln in enumerate(lines) if ln.startswith("## ")]
        prefix = lines[: heads[0]] if heads else lines
        ends = heads[1:] + [len(lines)]

        out = list(prefix)
        while out and not out[-1].strip():
            out.pop()
        out.append("")
        count = 0
        for h, end in zip(heads, ends):
            raw = lines[h][3:].strip()
            title = re.sub(r"^\d+\s*[.、]\s*", "", raw)
            body = lines[h + 1:end]
            while body and not body[-1].strip():
                body.pop()
            out.append(lines[h])
            out.append("")
            out.extend(body)
            out.append("")
            imgs = sec_imgs.get(title) or sec_imgs.get(raw) or []
            for n, im in enumerate(imgs, 1):
                alt = (im.get("alt") or ("图%d" % n)).replace("[", "").replace("]", "")
                out.append("![图%d %s](assets/%s)" % (n, alt, im["file"]))
                count += 1
            out.append("")

        text = "\n".join(out).rstrip() + "\n"
        with open(os.path.join(SRC, fname), "w", encoding="utf-8") as f:
            f.write(text)
        print("  %-24s 挂入 %3d 张" % (fname, count))
        total += count

    print("合计 %d 张（索引内 %d 张）" % (
        total, sum(len(v) for ch in index.values() for v in ch.values())))


if __name__ == "__main__":
    main()
