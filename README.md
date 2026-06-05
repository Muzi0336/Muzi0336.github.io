# Note 学习笔记

个人学习笔记仓库，涵盖 Python、FastAPI、HTML 和 CSS。

## 内容概览

### Python 笔记

文件：[python.md](<C:\Users\21371\Documents\PYTTON\note\python.md>)

- **基础语法**：变量、数据类型、字符串、列表、元组、集合、字典
- **控制流**：if/match 语句、while/for 循环、range
- **函数**：位置参数、关键字参数、缺省参数、不定长参数（*args, **kwargs）、匿名函数 lambda
- **常用模块**：json, math, os, datetime, re, random, sys, time, csv, collections, functools
- **面向对象**：类定义、继承、super()、魔术方法、属性访问控制（@property）
- **高级特性**：装饰器、生成器、迭代器、上下文管理器、闭包
- **高阶函数**：map, filter, sorted, reduce, zip, enumerate, any/all
- **类型提示**：Type Hints 各式用法
- **协程**：async/await 异步编程基础
- **其他**：海象运算符（:=）、协议类（Protocol）

子目录 `python/` 包含独立专题笔记：

| 文件 | 内容 |
|------|------|
| [装饰器.md](<C:\Users\21371\Documents\PYTTON\note\python\装饰器.md>) | 装饰器原理与实战 |
| [生成器.md](<C:\Users\21371\Documents\PYTTON\note\python\生成器.md>) | 生成器与 yield |
| [迭代器.md](<C:\Users\21371\Documents\PYTTON\note\python\迭代器.md>) | 迭代器协议 |
| [上下文管理器.md](<C:\Users\21371\Documents\PYTTON\note\python\上下文管理器.md>) | with 语句与上下文管理 |
| [文件操作.md](<C:\Users\21371\Documents\PYTTON\note\python\文件操作.md>) | 文件读写操作 |
| [数据结构/](<C:\Users\21371\Documents\PYTTON\note\python\数据结构>) | dict / list / set / str / tuple / 推导式 |
| [函数/](<C:\Users\21371\Documents\PYTTON\note\python\函数>) | 基础函数分类与 yield |
| [工作原理/](<C:\Users\21371\Documents\PYTTON\note\python\工作原理>) | 解包等底层机制 |

---

### FastAPI 笔记

文件：[fastAPI.md](<C:\Users\21371\Documents\PYTTON\note\fastAPI.md>)

- **快速入门**：项目创建、路径参数、查询参数、请求体、响应类型
- **核心概念**：HTTP 方法（CRUD）、APIRouter 模块化路由、异常处理、中间件、依赖注入
- **数据模型**：Pydantic 模型、SQLAlchemy ORM、枚举（Enum）、v2 类型语法、字段验证器
- **数据库操作**：ORM 基础、异步会话、关联查询（selectinload）、事务管理、批量操作、分页查询、自动建表
- **认证与安全**：JWT 认证、依赖注入嵌套（权限层级）
- **文件与上传**：UploadFile、静态文件服务
- **项目工程化**：配置管理（pydantic-settings）、统一响应格式、自定义异常、Lifespan、CORS、后台任务、调度器、日志、Request 对象

---

### HTML 笔记

文件：[前端\HTML.md](<C:\Users\21371\Documents\PYTTON\note\前端\HTML.md>)（完整版）

**一、HTML 基础**

- 文件结构、标签与属性、常见文本标签、列表标签、区块元素、行内块元素、表单

**二、HTML 进阶**

- 语义化标签、多媒体标签（img/audio/video/embed）、表格进阶、表单进阶
- 链接进阶、HTML5 新增标签、嵌入与代码（iframe/pre/code）
- 字符实体、link 引入 CSS 与图标、完整 HTML 模板

配套示例文件位于 `前端\HTML\`（共 15 个 `.html` 文件）和 `前端\index.html`。

---

### CSS 笔记

文件：[前端\CSS.md](<C:\Users\21371\Documents\PYTTON\note\前端\CSS.md>)

**一、CSS 基础**

- CSS 语法、三种导入方式、选择器大全（基础/组合/属性/伪类/伪元素/优先级）
- CSS 单位（px/em/rem/vw/vh）、文本与字体样式

**二、CSS 进阶**

- 盒模型（content-box vs border-box）、布局定位（relative/absolute/fixed/sticky）
- Flex 布局、Grid 布局、视觉美化（背景/阴影/透明度/滤镜）、动效与变换（transition/animation/transform）

配套示例文件位于 `前端\CSS\`（共 10 个 `.html` 文件 + 1 个 `style.css`）。

---

## 项目结构

```
note/
├── README.md               # 本文件
├── README.en.md            # English version
├── python.md               # Python 主笔记
├── fastAPI.md              # FastAPI 主笔记
├── LICENSE                 # MIT License
├── python/                 # Python 子专题笔记
│   ├── 装饰器.md
│   ├── 生成器.md
│   ├── 迭代器.md
│   ├── 上下文管理器.md
│   ├── 文件操作.md
│   ├── 数据结构/
│   ├── 函数/
│   └── 工作原理/
└── 前端/                   # 前端笔记与示例
    ├── index.html
    ├── HTML.md             # HTML 笔记（完整版）
    ├── CSS.md              # CSS 笔记
    ├── HTML/               # HTML 示例文件（15 个）
    └── CSS/                # CSS 示例文件（10 个 + style.css）
```

## 许可证

MIT License
