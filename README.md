# 朝云暮辞 · 学习档案

静态学习站点，按“文章 / 真题 / 学习工具”三类组织内容。根目录只保留入口页、共享资源和站点技术文件，具体内容全部进入分类目录。

## 目录结构

```text
/
├── index.html                     # 站点首页
├── 404.html                       # 旧地址跳转 + 新入口
├── CNAME                          # 自定义域名 git.zyyc.cc
├── _config.yml                    # GitHub Pages 配置
├── README.md
├── LICENSE
├── .gitignore
├── dcfe...txt                     # 站点验证文件
│
├── articles/                      # 文章：教程、笔记、课程正文
│   ├── frontend/                  # HTML / CSS / JS 教程
│   ├── fullstack/                 # Git / React / Next.js 全栈笔记
│   ├── data-structures/           # 数据结构教程（12 章）
│   └── algorithm-competition/     # 算法竞赛教程（10 章）
│
├── problems/                      # 真题：题库、卷面、题目详情
│   ├── contest/                   # 计挑赛 C / C++ / Java / Python
│   └── algorithm/                 # 算法题库、学习路径、课程、动画实验室
│
├── tools/                         # 学习工具
│   └── mistakes.html              # 错题本
│
├── assets/                        # 全站共享资源
│   ├── css/
│   │   ├── site.css               # 全站顶栏、排版、卡片
│   │   ├── detail.css             # 题目/详情页通用组件
│   │   └── tutorial.css           # 两套教程共用的阅读版式
│   └── js/
│       ├── tutorial.js            # 教程阅读器：目录、代码复制、图片放大
│       └── quiz-ai.js             # 计挑赛 AI 助教与核对模块
│
└── 蓝桥杯真题/                    # 例外：当前保持原目录，不参与本次迁移
```

## 分类规则

- **articles/**：以“读”为主的内容，包括教程、课程正文和笔记。每一套内容保留自己的 `index.html` 作为栏目入口。
- **problems/**：以“做题”为主的内容，包括真题列表、卷面、题目详情和题库数据。公共题目页样式进入 `assets/css`，题库数据留在各自的 `assets/`。
- **tools/**：不依附于某套题或某篇文章的独立工具页。
- **assets/**：至少被两个栏目共用的样式和脚本。只被单个栏目使用的资源，继续放在该栏目的 `assets/` 内，避免把专属资源堆到根目录。
- **根目录页面文件**：只允许首页、404 等站点级入口；栏目页和正文页一律进入对应分类目录。
- **命名**：根目录及分类目录使用英文；历史文章文件名保持不变，避免破坏已有引用。新增文件优先使用小写英文和连字符。

## 路径迁移对照

| 旧路径 | 新路径 |
| --- | --- |
| `/计挑赛/` | `/problems/contest/` |
| `/算法/` | `/problems/algorithm/` |
| `/数据结构教程/` | `/articles/data-structures/` |
| `/算法竞赛教程/` | `/articles/algorithm-competition/` |
| `/frontend/` | `/articles/frontend/` |
| `/boke/` | `/articles/fullstack/` |
| `/学习工具/错题本.html` | `/tools/mistakes.html` |
| `/计挑赛/assets/style.css` | `/assets/css/site.css` |
| `/计挑赛/assets/detail.css` | `/assets/css/detail.css` |
| `/计挑赛/assets/quiz-ai.js` | `/assets/js/quiz-ai.js` |
| 两套教程各自的 `assets/reader.css` | `/assets/css/tutorial.css` |
| 两套教程各自的 `assets/reader.js` | `/assets/js/tutorial.js` |

旧地址由根目录 `404.html` 做客户端跳转；站内链接已全部改为新路径。

## 复用约定

- 顶栏、按钮、卡片等全站外观统一使用 `assets/css/site.css`，详情页组件使用 `assets/css/detail.css`。
- 数据结构教程和算法竞赛教程共用 `assets/css/tutorial.css` 与 `assets/js/tutorial.js`；新增教程页直接引用这两个文件，不再复制 `reader.css` / `reader.js`。
- 全栈笔记的 18 篇正文共用 `articles/fullstack/assets/book.css`，页面只保留 `<link>`，不再逐页内联同一份主题样式。
- 计挑赛 AI 模块统一放在 `assets/js/quiz-ai.js`；其他题库如需接入，复用该模块并在页面初始化时传入自己的题目上下文。

## 页面说明

### 计挑赛（`problems/contest/`）

C、C++、Java、Python 四套题库，按语言和题型归档。单选题可作答、判分与查看解析；编程题附参考代码、解析、AI 核对和本地代码练习区。

### 算法题库（`problems/algorithm/`）

145 道题、7 个分类、6 条学习路径、21 篇课程、17 个代码动画。`index.html` 是统一分类入口，顶栏只保留“算法题库”；选择分类或路径后进入 `bank.html` 的题库列表排版。路径总览仍保留在 `paths.html`，题目页只加载当前题的数据文件。

### 教程与笔记（`articles/`）

- `articles/frontend/` — HTML / CSS / JavaScript 教程与示例
- `articles/fullstack/` — Git / React / Next.js 笔记与合集阅读页
- `articles/data-structures/` — 12 章数据结构教程
- `articles/algorithm-competition/` — 10 章算法竞赛教程

### 错题本（`tools/mistakes.html`）

汇总计挑赛与算法题库的做题记录，按分类展示错题；记录只保存在当前浏览器的 `localStorage`。

## License

MIT License
