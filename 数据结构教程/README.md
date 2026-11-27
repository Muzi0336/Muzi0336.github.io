# 数据结构教程 · 站点说明

整理自 https://www.dotcpp.com/course/ds/ 的《数据结构与算法》教程，12 章 87 节，重排为「章 → 节 → 要点」的笔记，并做成可阅读的网页。

浏览入口：`index.html`（章目录）→ `ch01.html` ~ `ch12.html`（每章一页）。

## 目录结构

```
数据结构教程/
├─ index.html          章目录页（12 章一览）
├─ ch01.html … ch12.html   阅读页，每章一页
├─ 笔记/                ★ 唯一内容来源（12 篇 markdown）
│   第01章 数据结构入门.md
│   …
├─ assets/
│   ├─ reader.css      页面版式（左目录 / 中正文 / 右小标题）
│   ├─ reader.js       复制代码、小标题跟随滚动、图片灯箱
│   ├─ img_meta.json   图片宽高（生成时写入 width/height，防版面跳动）
│   ├─ webp/           111 张压缩后的正文配图（页面里用的就是它）
│   ├─ *.png           114 张原图，只在点开灯箱时才加载
│   └─ *.gif           3 张动图，保留原文件
└─ tools/
    ├─ build_site.py       markdown → 网页
    └─ optimize_images.py  图片 → webp + 记录宽高
```

站点运行只需要 `*.html` 与 `assets/`；`笔记/` 与 `tools/` 是改内容用的（删了就不能重新生成页面）。抓取、转换阶段的中间稿已清理。

## 改内容：只改 `笔记/*.md`

```powershell
cd 数据结构教程
python tools/build_site.py
```

- `# 第X章 标题` 会成为页面大标题与左侧目录项；
- `## N.小节标题` 会成为正文小节 + 右侧「ON THIS PAGE」条目（`N.` 自动拆成编号）；
- `- 要点` 是列表项，行首两空格的 `  - 要点` 会渲染成次级缩进；
- ```` ```cpp ```` 代码块自动变成深色代码块，带语言标签和「复制」按钮；
- `![图1](../assets/xxx.png)` 自动转成配图：一行一张、整栏宽；点击图可看原图，滚轮/按钮缩放、拖动平移、Esc 关闭；
- `| 表格 |` 会渲染成表格。

新增一章：只要把文件命名为 `第13章 xxx.md` 放进 `笔记/`，编号、目录、上一章/下一章会自动接上。

导语写在 `tools/build_site.py` 的 `LEADS` 字典里，一节一句话。

## 改呈现形式

- 配色、字号、栏宽、图片与代码块样式：`assets/reader.css`，全部集中在文件顶部注释之下；
- 页面骨架（顶栏、左右栏、页脚）：`tools/build_site.py` 里的 `PAGE` / `INDEX_PAGE` / `TOPBAR` / `FOOTER` 四个模板字符串；
- 不想要右栏：删掉 `docside` 那段模板，或让 `reader.css` 里 `.docside{display:none}`。

## 加载速度是怎么做的

- 纯静态：没有前端框架、没有运行时渲染，正文直接写在 HTML 里，JS 关闭也能读；
- 每章一页：单页 HTML 9–28 KB，只加载本章用到的图；
- 图片：PNG 转 WebP（1.7 MB → 767 KB），`loading="lazy"` 懒加载，写死 `width/height` 避免回流；点开看原图时才请求原始 PNG/GIF；
- 样式复用站点已有的 `../计挑赛/assets/style.css`，只多一个 11 KB 的 `reader.css`，浏览器可缓存；
- 脚本只有一个 7.6 KB 的 `reader.js`（复制代码 + 小标题高亮 + 图片灯箱），`defer` 放在末尾，不阻塞首屏。
