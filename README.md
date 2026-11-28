# 朝云暮辞 · 学习档案

静态学习站点，用“首页 / 竞赛志 / 研习录 / 温故集 / AI问学”五个门户入口组织内容。根目录保留门户页、共享资源和站点技术文件，具体题解与教程进入分类目录。

## 目录结构

```text
/
├── index.html                     # 站点首页
├── contests.html                  # 竞赛志：比赛日程与真题入口
├── knowledge.html                 # 研习录：教程与知识内容入口
├── ai.html                        # AI问学：AI 助教说明与题目入口
├── 404.html                       # 旧地址跳转 + 新入口
├── settings.html                  # 独立设置页（AI 配置、数据与隐私）
├── sw.js                          # Service Worker：离线缓存与更新策略
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
│   ├── algorithm/                 # 算法题库、学习路径、课程、动画实验室
│   └── lanqiao/                   # 蓝桥杯真题
│       ├── index.html             # 年份归档
│       ├── bank.html              # 全部题目
│       ├── paper.html             # 卷面
│       ├── problem.html           # 题目详情
│       ├── assets/                # 蓝桥专属 exam.css / exam.js
│       ├── data/                  # 运行时题库数据
│       ├── images/                # 题干插图
│       ├── vendor/                # KaTeX
│       └── source/                # 原始题面、总表、JSON 与抓取脚本
│
├── tools/                         # 学习工具
│   └── mistakes.html              # 错题本
│
├── assets/                        # 全站共享资源
│   ├── css/
│   │   ├── site.css               # 全站顶栏、排版、卡片
│   │   ├── portal.css             # 首页与门户汇总页布局
│   │   ├── detail.css             # 题目/详情页通用组件
│   │   ├── tutorial.css           # 两套教程共用的阅读版式
│   │   └── settings.css           # 独立设置页
│   ├── js/
│   │   ├── site.js                # 门户导航与服务注册
│   │   ├── portal.js              # 首页与门户汇总页渲染
│   │   ├── contest-schedule.js    # 竞赛日程状态、排序与日期格式化
│   │   ├── tutorial.js            # 教程阅读器：目录、代码复制、图片放大
│   │   └── quiz-ai.js             # 题库 AI 助教与代码核对模块
│   └── data/
│       └── contest-catalog.js     # 竞赛目录与日程字段的唯一登记处
```

## 分类规则

- **articles/**：以“读”为主的内容，包括教程、课程正文和笔记。每一套内容保留自己的 `index.html` 作为栏目入口。
- **problems/**：以“做题”为主的内容，包括真题列表、卷面、题目详情和题库数据。公共题目页样式进入 `assets/css`，题库数据留在各自的 `assets/`。
- **tools/**：不依附于某套题或某篇文章的独立工具页。
- **assets/**：至少被两个栏目共用的样式和脚本。只被单个栏目使用的资源，继续放在该栏目的 `assets/` 内，避免把专属资源堆到根目录。
- **根目录页面文件**：只允许首页、404 等站点级入口；栏目页和正文页一律进入对应分类目录。
- **命名**：根目录及分类目录使用英文；历史文章文件名保持不变，避免破坏已有引用。新增文件优先使用小写英文和连字符。
- **导航**：门户统一为“首页 / 竞赛志 / 研习录 / 温故集 / AI问学”五项；设置是顶栏末尾的次要入口。

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
| `/蓝桥杯真题/exam/` | `/problems/lanqiao/` |
| `/蓝桥杯真题/` | `/problems/lanqiao/` |
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
- 门户页与首页共用 `assets/css/site.css`、`assets/css/portal.css`、`assets/js/site.js` 和 `assets/js/portal.js`；竞赛日程统一从 `assets/data/contest-catalog.js` 读取，不把日期复制进多个页面。

## 门户结构

- `index.html` 是首页，集中展示当前入口、近期事项和站点概览。
- `contests.html` 是竞赛志，从 `assets/data/contest-catalog.js` 生成比赛日程与真题入口；具体的蓝桥杯、计算机挑战赛题库仍分别位于 `problems/` 下。
- `knowledge.html` 是研习录，汇总算法、数据结构、前端与全栈等阅读内容。
- `ai.html` 是 AI问学，说明 AI 助教能力、配置前提和使用入口；实际配置仍在 `settings.html`。
- `tools/mistakes.html` 是温故集，继续汇总本机做题记录与错题。

这是纯静态部署，没有登录、数据库或后端 API。报名、在线评测、账户同步等功能不能由本站自身处理；未来入口可以使用静态占位或链接到独立服务，真正上线时替换页面中的 `href` 或接入单独的后端，不应把服务端密钥写进静态文件。

## 竞赛目录与日期

`assets/data/contest-catalog.js` 把 `window.ZYYC_CONTESTS` 暴露为共享竞赛列表。每一项除名称、简介、入口和模块外，可带 `schedule` 字段：

- `registrationStart` / `registrationEnd`：报名开始与截止，可写带时区的时间或纯日期。
- `examStart` / `examEnd`：比赛开始与结束，可写带时区的时间或纯日期。
- `examDate`：通知只给出比赛日期、没有具体时刻时使用。
- `verifiedAt`：原仓库整理该条信息的日期，不代表已经向官网实时核验。
- `season`：赛季或年份标签。
- `note`：面向读者的日程补充说明。
- `override`：人工覆盖状态，可留空或使用 `postponed`、`cancelled`、`pending`，并优先于日期判断。
- `placeholder: true`：目录预留项，没有赛程和可跳转内容，不代表官方日期。

`assets/js/contest-schedule.js` 公开 `window.ContestSchedule.getState(contest, now)`、`window.ContestSchedule.sortContests(contests, now)` 和 `window.ContestSchedule.formatDate(value)`，页面不应另写一套日程判断。

站内日期统一按北京时间（UTC+8）理解和展示，纯日期的开始与截止边界由 `Asia/Shanghai` 计算。页面把当前设备时间作为判断时刻，自动切换报名中、备赛中、比赛日、已结束等展示状态；官方临时改期、延期或取消仍必须更新 `contest-catalog.js` 中的 `schedule`，并在重新核对后同步 `verifiedAt`。

## 页面说明

### 首页（`index.html`）

站点总入口，展示五项门户导航、近期竞赛事项和内容概览。

### 竞赛志（`contests.html`）

按共享竞赛目录汇总比赛状态、报名与考试日期、官网或通知来源及已上线真题入口。具体题库页仍在 `problems/contest/` 与 `problems/lanqiao/`。

### 研习录（`knowledge.html`）

按主题汇总算法、数据结构、前端与全栈教程；具体章节继续放在 `articles/` 和 `problems/algorithm/`。

### AI问学（`ai.html`）

说明 AI 助教适用场景、本机配置前提与题目入口。Key 只保存在当前浏览器，打开页面或保存配置不会自动发起 AI 请求；主动测试或使用题目 AI 功能时，请求会直接发送给所选供应商并可能计费。

### 计挑赛（`problems/contest/`）

C、C++、Java、Python 四套题库，按语言和题型归档。单选题可作答、判分与查看解析；编程题附参考代码、解析、AI 核对和本地代码练习区。

### 算法题库（`problems/algorithm/`）

145 道题、7 个分类、6 条学习路径、21 篇课程、17 个代码动画。从顶栏“竞赛志”进入算法题库，`problems/algorithm/index.html` 是统一分类入口；选择分类或路径后进入 `bank.html` 的题库列表排版。路径总览仍保留在 `paths.html`，题目页只加载当前题的数据文件。

### 蓝桥真题（`problems/lanqiao/`）

2012–2026 年蓝桥杯省赛、国赛真题 757 道。`index.html` 按年份归档，`bank.html` 是全部题目列表，`paper.html` 是卷面，`problem.html` 是题目详情。题目页已接入 AI 助教，原始抓取数据与构建脚本统一收在 `source/`。

### 教程与笔记（`articles/`）

- `articles/frontend/` — HTML / CSS / JavaScript 教程与示例
- `articles/fullstack/` — Git / React / Next.js 笔记与合集阅读页
- `articles/data-structures/` — 12 章数据结构教程
- `articles/algorithm-competition/` — 10 章算法竞赛教程

### 设置（`settings.html`）

独立设置页，由顶栏末尾的次要“设置”入口进入。当前提供 AI 助教的 OpenAI 兼容接口配置、连接测试与清除 Key；配置只保存在当前浏览器。页面按分区组织，后续设置项继续追加。AI 助教已接入计挑赛、算法题库和蓝桥真题的题目页。

### 错题本（`tools/mistakes.html`）

从顶栏“温故集”进入，汇总计挑赛、算法题库与蓝桥真题的做题记录，按分类展示错题；记录只保存在当前浏览器的 `localStorage`。

## License

MIT License
