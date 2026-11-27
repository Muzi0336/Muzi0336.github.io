# 朝云暮辞 · 学习档案

个人学习站点：前端教程、全栈笔记、C 语言真题、算法题库和一个统一错题本。

## 目录结构

```
/
├── index.html                 # 站点首页（GitHub Pages 入口）
├── CNAME                      # 自定义域名 git.zyyc.cc
├── _config.yml                # GitHub Pages 配置
├── README.md
├── LICENSE
├── .gitignore
├── dcfe...txt                 # 站点验证文件
│
├── frontend/                  # 前端教程
│   ├── index.html             # 教程首页
│   ├── bg.jpg                 # 教程首页背景
│   ├── HTML/                  # HTML 示例（15 个）
│   ├── CSS/                   # CSS 示例（10 个 + style.css）
│   └── JS/                    # JavaScript 示例（9 个）
│
├── boke/                      # 全栈笔记
│   ├── index.html             # 笔记目录
│   ├── book.html              # 合集阅读页
│   └── *.html                 # Git / React / Next.js / 生态笔记
│
├── C语言/                     # C 语言真题
│   ├── index.html             # 真题列表与筛选
│   ├── q.html                 # 题目详情
│   └── data.js                # 题库数据
│
├── 算法/                      # 算法题库
│   ├── index.html             # 题库列表
│   ├── q.html                 # 题目详情
│   ├── paths.html             # 学习路径
│   ├── learn.html             # 课程目录
│   ├── lesson.html            # 课程正文
│   ├── lab.html               # 动画实验室
│   └── assets/                # 拆分后的数据、样式、动画脚本
│
└── 学习工具/                  # 独立学习工具
    └── 错题本.html            # 一个页面查看总题数、已写数与分类错题
```

## 页面说明

### 前端教程（`frontend/`）

- `frontend/index.html` — HTML / CSS / JS 学习导航
- `frontend/HTML/` — HTML 基础、进阶、表单、媒体、语义化等示例
- `frontend/CSS/` — CSS 导入、选择器、单位、盒模型、Flex、Grid、动效等示例
- `frontend/JS/` — JS 基础、ES6、DOM、异步、模块化等示例

### 全栈笔记（`boke/`）

- `boke/index.html` — 笔记目录，按 Git / Node.js / React / Next.js / 生态分组
- `boke/book.html` — 合集阅读页
- `boke/*.html` — 20 篇独立笔记

### C 语言真题（`C语言/`）

2019–2025 年 C 语言客观题，共 236 题（2023 年缺失）。

- `C语言/index.html` — 关键词搜索、年份 / 类型 / 状态筛选，重复题默认折叠
- `C语言/q.html` — 单选题判分与解析、上下题导航、可折叠参考答案、带补全的本地代码编辑器
- `C语言/data.js` — 题干、选项、答案、解析与来源文件哈希

### 算法题库（`算法/`）

ARENA LAB 静态版，145 题、7 个分类、6 条学习路径、21 篇课程、17 个代码动画。全部动画由 HTML/SVG/JS 实时绘制，无截图帧。

- `算法/index.html` — 搜索、分类 / 难度 / 状态筛选、只看收藏
- `算法/q.html` — 题干、样例、推导、复杂度、多语言参考代码、草稿编辑器、自测与动画
- `算法/paths.html` — 学习路径与进度
- `算法/learn.html`、`算法/lesson.html` — 课程目录与正文
- `算法/lab.html` — 动画实验室
- `算法/assets/app_data.js` — 公共题库 / 路径 / 课程索引
- `算法/assets/search_data.js` — 搜索索引，按需加载
- `算法/assets/problems/<id>.js` — 单题文件，题目页只加载当前题
- `算法/assets/lessons/<slug>.js` — 单课文件，课程页只加载当前课

### 错题本（`学习工具/错题本.html`）

单页展示：

- 总题数、已写题数、错题总数
- C 语言真题与算法题库两个分类，各显示已写 / 总数与错题数
- 点击分类在当前页展开错题，可直接打开题目、清除 C 语言记录或移出算法错题

做题记录与错题只保存在当前浏览器的 `localStorage`，不跨设备同步。

## License

MIT License
