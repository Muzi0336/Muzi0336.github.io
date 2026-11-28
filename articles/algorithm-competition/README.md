# 算法竞赛教程（本地版）

dotcpp《算法竞赛教程》的本地阅读版。原文 172 篇各自独立的长页面，这里按原目录重排为 **10 章 172 节**，每章一个 HTML 页面：左侧是全部章节，右侧是本章小标题，正文是「节 → 要点」+ 代码块 + 原文配图。双击 `index.html` 即可离线阅读，断网可用，不需要服务器。

## 目录结构

```
算法竞赛教程/
├── index.html             章节目录页（生成物）
├── ch01.html … ch10.html  阅读页（生成物）
├── 笔记/                  内容源：第01…10章 *.md（唯一要改的地方）
│   ├── README.md
│   ├── 核对报告.md         与原文的素材核对结论
│   └── 核对明细.md         172 节逐条明细
├── assets/
│   ├── reader.css         版式与阅读样式（要改样子就改它）
│   ├── reader.js          复制代码 / 右栏跟随 / 图片灯箱（无外部依赖，7 KB）
│   ├── *.png|jpg|gif      原文配图（外挂存储，灯箱里看原图用）
│   ├── webp/              压缩副本（页面实际加载的就是它，21.8 MB → 5.7 MB）
│   ├── img_meta.json      每张图的宽高（写进 width/height，防版面跳动）
│   └── img_index.json     章 → 节 → 图片 的对应表（给 attach_images.py 用）
└── tools/
    ├── build_site.py          md → html
    ├── attach_images.py       把配图写进 md（幂等）
    ├── fetch_images.py        从 .cache/algorithm-competition 快照下载图片
    ├── optimize_images.py     png → webp + 写宽高表
    └── fetch_algorithm.py     抓原文（重建 .cache/algorithm-competition 用）
```

原文快照、分章素材和代码块导出统一在仓库根 `.cache/algorithm-competition/`，不进 Git，也不参与部署。

## 三条命令

```powershell
cd 算法竞赛教程
python tools\attach_images.py     # 只在增删图片后跑
python tools\optimize_images.py   # 只在增删图片后跑
python tools\build_site.py        # 改完 md 就跑这一条
```

## 怎么改

- **改内容**：只动 `笔记/第XX章 *.md`。格式沿用既有约定：`# 章名`、`## 小节名`、`- 分点`（子项两个空格缩进 + `- `），代码用三反引号加语言名，图片单独一行 `![图N 说明](assets/xxx.png)`。改完跑 `build_site.py`。
- **调某张图的位置**：直接在 md 里把那行 `![](...)` 剪到别的小节或别处，或整行删掉。注意：重跑 `attach_images.py` 会按 `img_index.json` 重建全部图片行，精调过位置就只跑 `build_site.py`。
- **改页面结构**（加阅读进度条、换侧栏宽度等）：改 `assets/reader.css` 与 `tools/build_site.py` 里的 `PAGE` / `INDEX_PAGE` 模板，不用碰已生成的 HTML。
- **改章导语**：`build_site.py` 顶部的 `LEADS` 字典。
- **换呈现形式**（单页长文、带搜索、导出 PDF 等）：`笔记/*.md` 是纯 Markdown，任何渲染器都能吃；现有 HTML 只是其中一种输出。

## 加载速度

- 纯静态 HTML，无框架、无外部 CDN；`reader.js` 7 KB 且 `defer`。
- 图片走本地 webp（约原图 1/4）+ `loading="lazy"` + `decoding="async"` + 预置 `width/height`：首屏不拉图、滚动才取、不抖动。
- 原图 png 只在点开灯箱时按需加载，不占首屏带宽。
- 右栏小标题用 `IntersectionObserver` 跟随，不监听滚动事件。

## 说明

- 原文目录共 172 个链接，地址互不相同（同主题常拆成两篇独立文章），笔记按原目录全部保留。
- 内容版权归 Dotcpp 编程及原作者所有，本地版仅用于个人学习。
- 在线运行代码属于站内服务，本地版没有，需要跑代码请对照原网页。
