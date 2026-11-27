# -*- coding: utf-8 -*-
"""
图片优化：assets/*.png|jpg -> assets/webp/*.webp（质量 80，约减半）
同时把每张图的宽高写进 assets/img_meta.json，供 build_site.py 加 width/height，
避免图片加载时页面跳动。GIF（动图）保留原文件不转换。

用法：python tools/optimize_images.py
"""
import glob
import json
import os

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_DIR = os.path.join(ROOT, "assets")
WEBP_DIR = os.path.join(SRC_DIR, "webp")
META = os.path.join(SRC_DIR, "img_meta.json")
QUALITY = 80


def main():
    os.makedirs(WEBP_DIR, exist_ok=True)
    meta = {}
    before = after = 0

    for path in sorted(glob.glob(os.path.join(SRC_DIR, "*"))):
        if os.path.isdir(path) or not os.path.isfile(path):
            continue
        name = os.path.basename(path)
        ext = os.path.splitext(name)[1].lower()
        if ext == ".json":
            continue
        size = os.path.getsize(path)
        try:
            im = Image.open(path)
        except Exception:
            continue

        meta[name] = {"w": im.width, "h": im.height}

        if ext == ".gif":
            before += size
            meta[name]["out"] = name
            continue

        out_name = os.path.splitext(name)[0] + ".webp"
        out_path = os.path.join(WEBP_DIR, out_name)
        im.convert("RGBA" if im.mode in ("RGBA", "LA", "P") else "RGB").save(
            out_path, "WEBP", quality=QUALITY, method=6)
        before += size
        after += os.path.getsize(out_path)
        meta[name]["out"] = "webp/" + out_name

    with open(META, "w", encoding="utf-8") as f:
        json.dump(meta, f, ensure_ascii=False)
    print("原始 %d KB -> webp %d KB，共 %d 张" % (before // 1024, after // 1024, len(meta)))


if __name__ == "__main__":
    main()
