# 第 0 层 · 统一数据层

蓝桥杯真题站点共用的单一题源。上层（试卷大厅 / 卷面 / 题目页）只读这里的文件，不再解析年度 md。

## 文件

| 文件 | 体积 | 作用 |
|---|---|---|
| `catalog.js` | 167 KB | 轻量索引：15 个年份、97 张卷、757 道题的摘要行 |
| `p-<年份届>.js` | 19–245 KB | 按年份分片的题目全文，按需懒加载 |
| `sol-<年份届>.js` | 19–412 KB | 按年份分片的题解（Dotcpp 博客），仅题目页按年懒加载 |
| `README.md` | — | 本说明 |

全量 JSON 不在站点目录保留；需要离线备份时跑 `source/build/build_layer0.py`，它会把 `problems.json` 写到 `source/` 下。

## 题解分片

`source/build/crawl_solutions.py` 抓 `blog.dotcpp.com/tijie/p<题号>/` 的题解列表，再逐篇读 `blog.dotcpp.com/a/<文章 id>` 的正文，按年份写成 `sol-<年份届>.js`：

```js
window.LQ_SOL["2026年第十七届"] = { "3351": [ { aid, title, date, likes, views, md } ] }
```

- 每题最多收前 5 篇（列表第一页前 5），单篇正文超过 4000 字截断。
- 450 道 Dotcpp 题里 345 道有题解，共 1222 篇、约 158 万字；没题解的题在页面上显示「本题暂无收录题解」并给原站题解页链接。
- 洛谷题不抓题解（洛谷讨论区要登录、内容由前端渲染）。
- 题解正文是纯文本 + 轻量 markdown（围栏代码转 `<pre>`、`#` 行转标题、链接与行内代码保留），版权归原作者，页面附原文链接。

## 加载方式

```html
<script src="data/catalog.js"></script>            <!-- window.LQ_CATALOG -->
<script src="data/p-2026年第十七届.js"></script>     <!-- window.LQ_PAGES["2026年第十七届"] -->
<script src="data/sol-2026年第十七届.js"></script>   <!-- window.LQ_SOL["2026年第十七届"] -->
```

`catalog.js` 里的 `problems` 是摘要行（`id/title/diff/pct/year/src/tracks`），点开某题时再加载对应年份分片取全文。

## 题目字段

```
id          唯一键：dotcpp 用题号（如 3351），洛谷用 P 号（如 P16224）
src         dotcpp | luogu
num         题号（洛谷为 P 号，Dotcpp 为站点题号）
year        年份届，如 "2026年第十七届"
title       短标题，已去掉站点前缀（如 "循环右移"）
rawTitle    原始标题（Dotcpp 站点原样 "蓝桥杯2026年第十七届省赛真题-循环右移"）
diff        归一难度：入门 / 简单 / 中等 / 困难 / 未评定
diffRaw     原始档位：Dotcpp 同 diff；洛谷为洛谷原档，如 "普及+/提高−"
pct         通过率百分数（数字，无 % 号）
pctFrom     口径来源：dotcpp（站内历史累计正确率）| luogu（通过数/提交数）
timeLimit   时间限制字符串，如 "1s" / "1.00s"
memLimit    内存限制字符串，如 "128MB" / "512M"
url         原题链接
tracks      规范后的科目+组别，如 ["C/C++ 大学B组"]，AB 组已拆成两条
stages      赛段：省赛 / 国赛 / 决赛
papers      所属卷 id 数组
sections    [{h:"题目描述", md:"..."}]，正文为原 md（含 $公式$、<sub> 等）
samples     [{in,out}]，空样例已剔除；无样例时为 []
images      图片相对路径 images/xxx.png
note        洛谷"测试数据为洛谷自造"一类声明，无则空串
```

## 口径说明（页面上应体现）

1. `pct` 有两套口径，Dotcpp 与洛谷的数字不能横向比较，洛谷题需标注"洛谷站内口径"。
2. 93 道洛谷填空题本身没有样例（洛谷页面样例块为空），页面应显示"本题无样例"，不要留空表格。
3. Dotcpp 页面把多组用例塞进同一个 `<pre>`，因此 `samples` 恒为 1 组，其 `in`/`out` 内部可能含多组，页面原样展示并提示"样例可能含多组"。
4. `diff` 中"入门"是 Dotcpp 原有档位，未并入"简单"。
5. 3 道题站点未给难度，标"未评定"。

## 页面（建在这层数据之上的三层）

| 页面 | 作用 |
|---|---|
| `index.html` | 年份入口：15 个年份块（2026 → 2012），块内是该年关键词、赛段分布、题数；点进去进入该年的题库列表 |
| `bank.html?y=<年份>` | 年份题库列表：某一年全部题目按题号排开，Dotcpp 与洛谷混排，搜索 + 难度筛选；不带参数为全部 757 题 |
| `paper.html?p=<卷 id>` | 卷面：卷头（年份/赛段/科目/组别/题数/难度分布）、题号进度格、本卷题目、上一卷/下一卷 |
| `problem.html?id=<题 id>&p=<卷 id>` | 题目页：题面分节 + 左大纲、INPUT/OUTPUT 双栏卡、样例 tab、配图、手敲代码区、上一题/下一题、右侧 Info 卡 |

样式复用站点 `assets/css/site.css` + `assets/css/detail.css`；公式由 `vendor/` 下的 KaTeX 本地渲染 `$...$` 与 `$$...$$`。手敲代码按计挑赛形态（语言切换、关键词补全、Tab 缩进、括号配对、自动保存），存放在 localStorage 的 `lq.code.<题 id>.<语言>`，不运行、不判题。已读痕迹存在 `lq.seen`。

## 生成

`source/build/build_layer0.py` → 读 `source/蓝桥杯真题数据.json` + `source/<年份>/` 的 15 个年度 md + `source/cache/problems/<pid>.html`（可选，补 Dotcpp 样例输出）→ 输出 `data/`，并把全量 `problems.json` 写到 `source/build/`。
`source/build/check_layer0.py` 校验：题数、卷 count、孤儿题、年份覆盖、字段空值、图片引用、分片体积。
