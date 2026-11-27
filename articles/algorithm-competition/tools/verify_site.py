# -*- coding: utf-8 -*-
"""站点自检：小节数、图片标签数、图片文件是否都在、体积。"""
import glob
import io
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def main():
    secs = imgs = miss = 0
    for f in sorted(glob.glob(os.path.join(ROOT, "ch*.html"))):
        t = io.open(f, encoding="utf-8").read()
        s = len(re.findall(r'<section class="dsec"', t))
        fig = re.findall(r'<figure class="figure">(.+?)</figure>', t, re.S)
        secs += s
        imgs += len(fig)
        for tag in fig:
            for attr in ("src", "data-full"):
                m = re.search(attr + r'="(assets/[^"]+)"', tag)
                if m and not os.path.exists(os.path.join(ROOT, m.group(1))):
                    miss += 1
                    print("  缺图", os.path.basename(f), m.group(1))
        print("%-12s  %2d 节 %3d 图  %5.1f KB" % (os.path.basename(f), s, len(fig),
                                                 os.path.getsize(f) / 1024))
    print("\n合计 %d 节 / %d 图 / 缺图 %d" % (secs, imgs, miss))

    webp = sum(os.path.getsize(p) for p in glob.glob(os.path.join(ROOT, "assets", "webp", "*")))
    raw = 0
    for p in glob.glob(os.path.join(ROOT, "assets", "*")):
        if os.path.isfile(p) and os.path.splitext(p)[1] in (".png", ".jpg", ".jpeg", ".gif", ".webp"):
            raw += os.path.getsize(p)
    print("首屏要加载的 webp 合计 %.1f MB（原图备份 %.1f MB）" % (webp / 1048576, raw / 1048576))


if __name__ == "__main__":
    main()
