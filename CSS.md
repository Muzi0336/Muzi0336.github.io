---
cssclasses:
  - inline-list
---

作者：zyyc-0336
日期： 2026-06-05
修改日期：
参考来源：无
内容标签： #CSS #前端 #zyyc-0336

---

**学习路径建议**

> 1. 先学 **1.1-1.4**（CSS 基础），掌握选择器和常用属性
> 2. 再学 **1.5-1.6**（单位、文本与字体），理解样式细节
> 3. 然后学 **2.1-2.3**（盒模型、定位、Flex），掌握页面布局
> 4. 最后学 **2.4-2.6**（Grid、视觉美化、动效），完成精美页面

**常见错误提示**

> ⚠️ 属性值后必须加分号：`color: red;` 不是 `color: red`
> ⚠️ 选择器大括号必须配对：`p { }` 不是 `p {`
> ⚠️ 属性和值之间用冒号：`font-size: 16px` 不是 `font-size 16px`
> ⚠️ 注释用 `/* */` 不是 `//`

---

**目录**

- **一、CSS 基础**
    - [1.1 什么是 CSS](#11-什么是-css)
    - [1.2 CSS 语法](#12-css-语法)
    - [1.3 CSS 导入方式](#13-css-导入方式)
    - [1.4 CSS 选择器](#14-css-选择器)
        - [1.4.1 基础选择器](#基础选择器)
        - [1.4.2 组合选择器](#组合选择器)
        - [1.4.3 属性选择器](#属性选择器)
        - [1.4.4 伪类选择器](#伪类选择器)
        - [1.4.5 伪元素选择器](#伪元素选择器)
        - [1.4.6 选择器优先级](#选择器优先级)
    - [1.5 CSS 单位](#15-css-单位)
    - [1.6 CSS 文本与字体](#16-css-文本与字体)
- **二、CSS 进阶**
    - [2.1 CSS 盒模型](#21-css-盒模型)
    - [2.2 CSS 布局定位](#22-css-布局定位)
    - [2.3 CSS Flex 布局](#23-css-flex-布局)
    - [2.4 CSS Grid 布局](#24-css-grid-布局)
    - [2.5 CSS 视觉美化](#25-css-视觉美化)
    - [2.6 CSS 动效与变换](#26-css-动效与变换)

---

**一、CSS 基础** `样式之魂，定义页面外观`

---

**1.1 什么是 CSS**

> CSS = **C**ascading **S**tyle **S**heets（层叠样式表）

CSS 不是编程语言，是**样式表语言**——用一系列规则告诉浏览器页面元素长什么样。

三个核心概念：

| 概念 | 说明 |
|------|------|
| 层叠（Cascading） | 多个样式规则可以叠加，按优先级最终决定元素外观 |
| 样式（Style） | 颜色、字体、大小、间距、边框、背景等视觉属性 |
| 表（Sheets） | 样式集中写在一个或多个文件中，便于管理 |

---

**1.2 CSS 语法**

> 对应文件：`CSS导入方式.html`

CSS 由**选择器**和**声明块**组成，声明块内是若干条属性-值对。

**基本语法**：

```css
选择器 {
    属性名: 属性值;
    属性名: 属性值;
}
```

**规则**：

| 规则 | 正确 | 错误 |
|------|------|------|
| 属性与值用冒号分隔 | `color: red;` | `color red;` |
| 每条声明以分号结尾 | `font-size: 16px;` | `font-size: 16px` |
| 声明块用花括号包裹 | `p { color: red; }` | `p ( color: red; )` |
| 注释用 `/* */` | `/* 这是注释 */` | `// 这是注释` |

**完整示例**：

```css
/* 选择器 */
p {
    color: blue;          /* 字体颜色 */
    font-size: 16px;      /* 字体大小 */
    line-height: 1.5;     /* 行高 */
    text-align: center;   /* 文本居中 */
}
```

> 💡 选择器决定"给谁加样式"，属性和值决定"加什么样式"。

---

**1.3 CSS 导入方式**

> 对应文件：`CSS导入方式.html`

CSS 有三种引入方式，核心区别在于**作用范围**和**优先级**。

| 方式 | 写法位置 | 作用范围 | 优先级 | 适用场景 |
|------|----------|----------|--------|----------|
| 内联样式 | HTML 标签的 `style` 属性 | 单个元素 | 最高 | 临时覆盖、动态样式 |
| 内部样式表 | HTML 的 `<style>` 标签内 | 当前页面 | 中 | 单页应用、演示页面 |
| 外部样式表 | 独立的 `.css` 文件 | 所有引用页面 | 最低 | 多页面共享（推荐） |

**优先级**：`内联样式 > 内部样式表 > 外部样式表`

**三种方式示例**：

```html
<!DOCTYPE html>
<html>
<head>
    <!-- 方式三：外部样式表（推荐） -->
    <link rel="stylesheet" href="style.css">

    <!-- 方式二：内部样式表 -->
    <style>
        p {
            color: green;
            font-size: 18px;
        }
        .highlight {
            background-color: yellow;
        }
    </style>
</head>
<body>
    <!-- 方式一：内联样式 -->
    <h1 style="color: red; text-align: center;">标题</h1>
    <p>普通段落（内部样式生效）</p>
    <p style="color: blue;">这个段落被内联样式覆盖</p>
</body>
</html>
```

**外部样式表（style.css）**：

```css
/* 外部样式文件 */
h1 {
    color: #333;
    font-family: "Microsoft YaHei", sans-serif;
}

p {
    line-height: 1.8;
    margin-bottom: 16px;
}

.highlight {
    background-color: #fff3cd;
    padding: 4px 8px;
    border-radius: 4px;
}
```

> 💡 **记忆口诀**：内联最优先，内部管单页，外部最常用。

---

**1.4 CSS 选择器**

> 对应文件：`CSS选择器.html`

选择器是 CSS 的核心——它决定了**对哪些元素**应用样式。

**1.4.1 基础选择器**

| 选择器 | 语法 | 示例 | 说明 |
|--------|------|------|------|
| 元素选择器 | `元素名` | `p { }` | 选中所有该类型元素 |
| 类选择器 | `.类名` | `.box { }` | 选中所有带该 class 的元素 |
| ID 选择器 | `#id名` | `#header { }` | 选中唯一带该 id 的元素 |
| 通配选择器 | `*` | `* { }` | 选中所有元素 |

**基础选择器示例**：

```css
/* 元素选择器：选中所有 p 标签 */
p {
    color: #333;
    font-size: 16px;
}

/* 类选择器：选中所有 class="box" 的元素 */
.box {
    width: 200px;
    height: 200px;
    background-color: #3498db;
}

/* ID 选择器：选中 id="header" 的元素 */
#header {
    height: 60px;
    background-color: #2c3e50;
}
```

```html
<p>这是普通段落</p>
<div class="box">带 box 类的 div</div>
<div id="header">页面头部</div>
```

> 💡 类选择器最常用，一个类可以用在多个元素上；ID 选择器一个页面只能用一次。

**1.4.2 组合选择器**

| 选择器 | 语法 | 示例 | 说明 |
|--------|------|------|------|
| 后代选择器 | `A B` | `div p { }` | A 内部的所有 B（无论层级） |
| 子代选择器 | `A > B` | `div > p { }` | A 的直接子元素 B |
| 相邻兄弟 | `A + B` | `h1 + p { }` | A 后面紧挨着的第一个 B |
| 通用兄弟 | `A ~ B` | `h1 ~ p { }` | A 后面所有的兄弟 B |
| 并集选择器 | `A, B` | `h1, h2 { }` | 同时选中 A 和 B |
| 交集选择器 | `A.B` | `p.highlight { }` | 同时满足 A 和 B |

**后代 vs 子代**：

```html
<div class="container">
    <p>直接子元素（后代也是）</p>
    <div>
        <p>嵌套段落（后代，但不是子代）</p>
    </div>
</div>
```

```css
/* 后代选择器：所有 div 里面的 p（不分层级） */
div p {
    color: red;  /* 两个 p 都变红 */
}

/* 子代选择器：只选中直接子元素 */
div > p {
    color: blue;  /* 只有直接子元素变蓝 */
}
```

**兄弟选择器**：

```css
/* 相邻兄弟：h1 后面紧挨着的 p */
h1 + p {
    font-size: 18px;
    color: #666;
}

/* 通用兄弟：h1 后面所有的 p */
h1 ~ p {
    margin-left: 20px;
}
```

> 💡 **记忆口诀**：空格后代全拿下，大于号只认亲儿子，加号紧挨第一个，波浪线后面全拿下。

**1.4.3 属性选择器**

属性选择器根据元素的**属性及其值**来选中元素。

| 选择器 | 语法 | 说明 |
|--------|------|------|
| `[attr]` | `[disabled]` | 有该属性即可 |
| `[attr=val]` | `[type="text"]` | 属性值完全匹配 |
| `[attr^=val]` | `[href^="https"]` | 属性值以 val 开头 |
| `[attr$=val]` | `[href$=".pdf"]` | 属性值以 val 结尾 |
| `[attr*=val]` | `[title*="CSS"]` | 属性值包含 val |
| `[attr~=val]` | `[class~="box"]` | 属性值包含完整单词 |
| `[attr\|=val]` | `[lang\|="zh"]` | 属性值以 val- 开头或等于 val |

```css
/* 选中所有有 title 属性的元素 */
[title] {
    border-bottom: 1px dotted #999;
}

/* 选中 type="text" 的 input */
input[type="text"] {
    border: 2px solid #3498db;
    padding: 8px 12px;
}

/* 选中 href 以 https 开头的链接 */
a[href^="https"] {
    color: #27ae60;
}

/* 选中 src 以 .png 结尾的图片 */
img[src$=".png"] {
    border: 2px solid #e74c3c;
}

/* 选中 class 包含 "card" 的元素 */
[class*="card"] {
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
```

**1.4.4 伪类选择器**

伪类用于定义元素的**特殊状态**。

**动态伪类**（用户交互）：

| 伪类 | 说明 | 示例 |
|------|------|------|
| `:hover` | 鼠标悬停 | `a:hover` |
| `:active` | 被激活（点击时） | `button:active` |
| `:focus` | 获得焦点 | `input:focus` |
| `:visited` | 已访问的链接 | `a:visited` |

```css
/* 链接的四种状态（LVHA 顺序） */
a:link { color: #3498db; }       /* 未访问 */
a:visited { color: #9b59b6; }    /* 已访问 */
a:hover { color: #e74c3c; }      /* 悬停 */
a:active { color: #c0392b; }     /* 点击 */

/* 输入框聚焦效果 */
input:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52,152,219,0.3);
}
```

> 💡 **LVHA 法则**：`:link` → `:visited` → `:hover` → `:active`，顺序不能乱，否则可能不生效。

**结构伪类**（元素位置）：

| 伪类 | 说明 |
|------|------|
| `:first-child` | 第一个子元素 |
| `:last-child` | 最后一个子元素 |
| `:nth-child(n)` | 第 n 个子元素 |
| `:nth-child(odd)` | 奇数子元素 |
| `:nth-child(even)` | 偶数子元素 |
| `:first-of-type` | 该类型第一个 |
| `:last-of-type` | 该类型最后一个 |
| `:nth-of-type(n)` | 该类型第 n 个 |
| `:only-child` | 唯一的子元素 |
| `:empty` | 没有子元素的元素 |

```css
/* 列表隔行变色（斑马纹） */
li:nth-child(odd) {
    background-color: #f9f9f9;
}
li:nth-child(even) {
    background-color: #fff;
}

/* 第一个和最后一个特殊处理 */
li:first-child {
    border-top: none;
}
li:last-child {
    border-bottom: none;
}

/* 选中表格第三行 */
tr:nth-child(3) {
    background-color: #eaf2f8;
}
```

**其他常用伪类**：

| 伪类 | 说明 |
|------|------|
| `:not(selector)` | 排除匹配的元素 |
| `:nth-last-child(n)` | 倒数第 n 个子元素 |
| `:root` | 文档根元素（html） |
| `:target` | URL 锚点指向的元素 |
| `:enabled` / `:disabled` | 启用/禁用的表单元素 |
| `:checked` | 选中的复选框/单选框 |
| `:required` | 带 required 属性的表单元素 |
| `:valid` / `:invalid` | 验证通过/失败的输入框 |

```css
/* 排除最后一个子元素 */
.item:not(:last-child) {
    margin-bottom: 16px;
}

/* 自定义复选框样式 */
input[type="checkbox"]:checked + label {
    color: #27ae60;
    font-weight: bold;
}

/* 禁用状态的按钮 */
button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
```

**1.4.5 伪元素选择器**

伪元素用于创建**虚拟元素**，它们不在 HTML 中实际存在。

| 伪元素 | 语法 | 说明 |
|--------|------|------|
| `::before` | `div::before` | 在元素内容前插入 |
| `::after` | `div::after` | 在元素内容后插入 |
| `::first-letter` | `p::first-letter` | 第一个字符 |
| `::first-line` | `p::first-line` | 第一行 |
| `::selection` | `::selection` | 用户选中的文本 |
| `::placeholder` | `input::placeholder` | 输入框占位文字 |

```css
/* ::before / ::after 必须配合 content 使用 */
.box::before {
    content: "「";
    color: #e74c3c;
    font-size: 24px;
}

.box::after {
    content: "」";
    color: #e74c3c;
    font-size: 24px;
}

/* 清除浮动（经典用法） */
.clearfix::after {
    content: "";
    display: block;
    clear: both;
}

/* 首字下沉 */
p::first-letter {
    font-size: 3em;
    font-weight: bold;
    color: #e74c3c;
    float: left;
    margin-right: 8px;
}

/* 选中文本样式 */
::selection {
    background-color: #3498db;
    color: #fff;
}

/* 输入框占位文字 */
input::placeholder {
    color: #bbb;
    font-style: italic;
}
```

> 💡 `::before` 和 `::after` 是最常用的伪元素，可以做图标、装饰线、清除浮动等。双冒号 `::` 是 CSS3 标准写法。

**1.4.6 选择器优先级**

当多个选择器作用于同一个元素时，按以下规则决定谁生效：

**优先级计算（特异性 Specificity）**：

| 选择器类型 | 权重值 | 示例 |
|-----------|--------|------|
| 内联样式 | 1000 | `style="color:red"` |
| ID 选择器 | 100 | `#header` |
| 类/属性/伪类 | 10 | `.box`, `[type]`, `:hover` |
| 元素/伪元素 | 1 | `div`, `::before` |
| 通配选择器 | 0 | `*` |

**规则**：权重值相加，大的胜出；相同权重时，后面的覆盖前面的。

```css
/* 权重: 1 */
p { color: black; }

/* 权重: 10 */
.text { color: blue; }

/* 权重: 11 */
p.text { color: green; }

/* 权重: 110 */
#main p.text { color: orange; }
```

**`!important` 强制提升（不推荐滥用）**：

```css
p {
    color: red !important;   /* 权重 > 一切普通声明 */
}
```

> ⚠️ `!important` 会破坏优先级规则，只在覆盖第三方样式时使用。日常开发中尽量避免。

---

**1.5 CSS 单位**

> 对应文件：`CSS单位.html`

CSS 中的数值通常需要带单位，不同单位适用于不同场景。

**绝对单位**：

| 单位 | 说明 | 换算 |
|------|------|------|
| `px` | 像素（最常用） | 1px = 屏幕一个物理像素点 |
| `pt` | 磅（打印常用） | 1pt ≈ 1.333px |
| `cm` / `mm` | 厘米 / 毫米 | 1cm = 37.8px（屏幕） |
| `in` | 英寸 | 1in = 96px |

**相对单位**：

| 单位 | 说明 | 相对于 |
|------|------|--------|
| `em` | 相对当前字体大小 | 自身或父元素的 `font-size` |
| `rem` | 相对根元素字体大小 | `<html>` 的 `font-size` |
| `%` | 百分比 | 父元素的对应属性 |
| `vw` | 视口宽度的 1% | 浏览器窗口宽度 |
| `vh` | 视口高度的 1% | 浏览器窗口高度 |
| `vmin` | vw 和 vh 中较小的 | 视口较小边 |
| `vmax` | vw 和 vh 中较大的 | 视口较大边 |

**em vs rem**：

```css
html {
    font-size: 16px;   /* 根字体（rem 的基准） */
}

.parent {
    font-size: 20px;
}

.parent .child-em {
    font-size: 1.5em;   /* 20px × 1.5 = 30px（相对于父元素） */
}

.parent .child-rem {
    font-size: 1.5rem;  /* 16px × 1.5 = 24px（相对于根元素） */
}
```

**视口单位示例**：

```css
/* 全屏英雄区 */
.hero {
    width: 100vw;          /* 占满屏幕宽度 */
    height: 100vh;         /* 占满屏幕高度 */
    background: linear-gradient(135deg, #667eea, #764ba2);
}

/* 响应式字体大小 */
h1 {
    font-size: clamp(24px, 5vw, 48px);  /* 24px ~ 48px 之间，按视口缩放 */
}

/* 等比例方块 */
.square {
    width: 20vmin;
    height: 20vmin;       /* 屏幕窄边决定，保证正方形 */
}
```

> 💡 日常开发建议：字体用 `rem`，宽度用 `%` 或 `vw`，固定尺寸用 `px`。`em` 容易产生嵌套叠加问题，谨慎使用。

---

**1.6 CSS 文本与字体**

> 对应文件：`CSS文本与字体.html`

**字体属性**：

| 属性 | 说明 | 示例 |
|------|------|------|
| `font-family` | 字体族 | `"Microsoft YaHei", sans-serif` |
| `font-size` | 字体大小 | `16px`, `1.2rem` |
| `font-weight` | 字重（粗细） | `normal`, `bold`, `700` |
| `font-style` | 字体风格 | `normal`, `italic` |
| `font-variant` | 小型大写 | `small-caps` |
| `font` | 简写属性 | `bold 16px/1.5 "Microsoft YaHei"` |

```css
body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI",
                 "Microsoft YaHei", sans-serif;
    font-size: 16px;
    line-height: 1.6;
}

h1 {
    font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
    font-size: 2rem;
    font-weight: 700;
}

/* font 简写（顺序：style weight size/line-height family） */
p {
    font: italic 700 18px/1.5 "Microsoft YaHei", sans-serif;
}
```

**文本样式属性**：

| 属性 | 说明 | 常用值 |
|------|------|--------|
| `color` | 文字颜色 | `#333`, `rgb(51,51,51)`, `red` |
| `text-align` | 水平对齐 | `left`, `center`, `right`, `justify` |
| `text-decoration` | 文本修饰 | `none`, `underline`, `line-through` |
| `text-transform` | 大小写转换 | `uppercase`, `lowercase`, `capitalize` |
| `text-indent` | 首行缩进 | `2em` |
| `letter-spacing` | 字间距 | `1px`, `0.05em` |
| `word-spacing` | 词间距 | `2px` |
| `line-height` | 行高 | `1.5`, `24px` |
| `white-space` | 空白处理 | `normal`, `nowrap`, `pre` |
| `word-break` | 换行规则 | `break-all`, `break-word` |
| `overflow-wrap` | 溢出换行 | `break-word` |
| `text-overflow` | 溢出省略 | `ellipsis` |
| `vertical-align` | 垂直对齐 | `middle`, `top`, `bottom` |

**文本溢出省略（经典三件套）**：

```css
.ellipsis {
    white-space: nowrap;        /* 强制不换行 */
    overflow: hidden;           /* 隐藏溢出内容 */
    text-overflow: ellipsis;    /* 显示省略号 */
}
```

**多行省略**：

```css
.multiline-ellipsis {
    display: -webkit-box;
    -webkit-line-clamp: 3;         /* 最多显示 3 行 */
    -webkit-box-orient: vertical;
    overflow: hidden;
}
```

**文本对齐示例**：

```css
/* 单行文本垂直居中 */
.single-center {
    height: 60px;
    line-height: 60px;  /* line-height = height */
    text-align: center;
}

/* 两端对齐（最后一行左对齐） */
.justify {
    text-align: justify;
    text-align-last: left;
}
```

---

**二、CSS 进阶** `布局与动效，打造精美页面`

---

**2.1 CSS 盒模型**

> 对应文件：`CSS盒模型.html`

盒子模型是 CSS 布局的基石——每个 HTML 元素都是一个矩形盒子。

**盒模型四层结构**（由内向外）：

| 层次 | 属性 | 说明 |
|------|------|------|
| 内容 | `width` / `height` | 文本或子元素区域 |
| 内边距 | `padding` | 内容到边框的距离 |
| 边框 | `border` | 元素的边界线 |
| 外边距 | `margin` | 元素到其他元素的距离 |

```
┌──────────────────────────────┐
│            margin            │
│   ┌──────────────────────┐   │
│   │       border         │   │
│   │   ┌──────────────┐   │   │
│   │   │   padding     │   │   │
│   │   │  ┌────────┐   │   │   │
│   │   │  │ content │   │   │   │
│   │   │  └────────┘   │   │   │
│   │   └──────────────┘   │   │
│   └──────────────────────┘   │
└──────────────────────────────┘
```

**两种盒模型**：

```css
/* 标准盒模型（默认）：width = 内容宽度 */
.content-box {
    box-sizing: content-box;
    width: 200px;
    padding: 20px;
    border: 5px solid #333;
    /* 实际宽度 = 200 + 20×2 + 5×2 = 250px */
}

/* 边框盒模型（推荐）：width = 内容 + padding + border */
.border-box {
    box-sizing: border-box;
    width: 200px;
    padding: 20px;
    border: 5px solid #333;
    /* 实际宽度 = 200px（内容自动缩减） */
}
```

> 💡 全局设置 `border-box` 是行业惯例，避免宽度计算麻烦：
> ```css
> *, *::before, *::after {
>     box-sizing: border-box;
> }
> ```

**padding 和 margin**：

```css
/* 四种写法 */
padding: 10px;                    /* 四边相同 */
padding: 10px 20px;               /* 上下 左右 */
padding: 10px 20px 30px;          /* 上 左右 下 */
padding: 10px 20px 30px 40px;     /* 上 右 下 左（顺时针） */
```

**外边距合并（margin collapse）**：

```css
/* 上下相邻的块级元素，margin 会合并取较大值 */
.box1 { margin-bottom: 30px; }
.box2 { margin-top: 20px; }
/* 间距 = 30px（不是 50px） */
```

**border**：

```css
/* 完整写法 */
border: 2px solid #3498db;

/* 分开写 */
border-width: 2px;
border-style: solid;
border-color: #3498db;

/* 单边 */
border-top: 3px dashed #e74c3c;

/* 圆角 */
border-radius: 8px;           /* 全部 8px */
border-radius: 50%;           /* 圆形 */
border-radius: 8px 16px 24px 32px;  /* 左上 右上 右下 左下 */
```

**display 属性**：

| 值 | 说明 |
|------|------|
| `block` | 块级元素（独占一行） |
| `inline` | 行内元素 |
| `inline-block` | 行内块（同行排列但可设宽高） |
| `none` | 隐藏且不占位 |

---

**2.2 CSS 布局定位**

> 对应文件：`CSS布局定位.html`

**position 属性**：

| 值 | 说明 | 定位参照物 |
|------|------|-----------|
| `static` | 默认值，正常文档流 | 无 |
| `relative` | 相对定位，占位不移 | 自身原位置 |
| `absolute` | 绝对定位，脱离文档流 | 最近的非 static 祖先 |
| `fixed` | 固定定位，脱离文档流 | 浏览器视口 |
| `sticky` | 粘性定位 | 滚动容器 |

```css
/* relative：相对自身偏移，原位置保留 */
.relative-box {
    position: relative;
    top: 10px;
    left: 20px;
}

/* absolute：相对于最近的定位祖先 */
.parent {
    position: relative;   /* 作为定位参考 */
}
.absolute-box {
    position: absolute;
    top: 0;
    right: 0;
    /* 贴到父元素右上角 */
}

/* fixed：固定在视口 */
.fixed-nav {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 1000;
}

/* sticky：滚动到某位置后固定 */
.sticky-header {
    position: sticky;
    top: 0;
    background: #fff;
}
```

> 💡 **口诀**：`relative` 人不走坑还在，`absolute` 人走坑也走，`fixed` 视口为家纹丝不动，`sticky` 滚着滚着就粘住了。

**z-index 层叠顺序**：

```css
/* z-index 只在定位元素（非 static）上生效 */
.back {
    position: relative;
    z-index: 1;
}

.front {
    position: relative;
    z-index: 10;   /* 值越大越靠前 */
}
```

**浮动 float**：

```css
.float-left { float: left; }
.float-right { float: right; }
```

**清除浮动的方法**：

```css
/* 方式一：clearfix（推荐） */
.clearfix::after {
    content: "";
    display: block;
    clear: both;
}

/* 方式二：overflow */
.container {
    overflow: hidden;
}

/* 方式三：现代布局替代（推荐） */
.container {
    display: flex;  /* 用 Flex 布局就不需要浮动 */
}
```

> 💡 现代布局中 Flex 和 Grid 已基本取代浮动，但理解浮动对阅读旧代码仍有必要。

---

**2.3 CSS Flex 布局**

> 对应文件：`CSS Flex布局.html`

Flex 布局是一种**一维**布局模型，擅长在一个方向上（行或列）排列元素。

**核心概念**：

```
┌────────────────────────────────────┐
│  Flex Container（父容器）          │
│                                    │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐        │
│  │ 1 │ │ 2 │ │ 3 │ │ 4 │  主轴   │
│  └───┘ └───┘ └───┘ └───┘   →    │
│                                    │
└────────────────────────────────────┘
```

两个核心角色：
- **Flex 容器**（父元素）：设置 `display: flex`
- **Flex 项目**（子元素）：容器内的直接子元素

两条轴线：
- **主轴**（main axis）：由 `flex-direction` 决定
- **交叉轴**（cross axis）：垂直于主轴

**容器属性**：

| 属性 | 说明 | 常用值 |
|------|------|--------|
| `display` | 启用 Flex | `flex`, `inline-flex` |
| `flex-direction` | 主轴方向 | `row`（默认）, `column`, `row-reverse`, `column-reverse` |
| `flex-wrap` | 是否换行 | `nowrap`（默认）, `wrap`, `wrap-reverse` |
| `flex-flow` | 上面两个的简写 | `row wrap` |
| `justify-content` | 主轴对齐方式 | `flex-start`, `flex-end`, `center`, `space-between`, `space-around`, `space-evenly` |
| `align-items` | 交叉轴对齐 | `stretch`（默认）, `flex-start`, `flex-end`, `center`, `baseline` |
| `align-content` | 多行交叉轴对齐 | `stretch`, `flex-start`, `flex-end`, `center`, `space-between`, `space-around` |
| `gap` | 行列间距 | `20px`, `10px 20px`（行 列） |

**justify-content 效果**：

```
flex-start:  |■ ■ ■            |
center:      |    ■ ■ ■        |
flex-end:    |            ■ ■ ■|
space-between:|■       ■       ■|
space-around: |  ■    ■    ■  |
space-evenly: |  ■   ■   ■   |
```

**项目属性**：

| 属性 | 说明 | 默认值 |
|------|------|--------|
| `flex-grow` | 放大比例 | `0`（不放大） |
| `flex-shrink` | 缩小比例 | `1`（允许缩小） |
| `flex-basis` | 初始尺寸 | `auto` |
| `flex` | 简写：grow shrink basis | `0 1 auto` |
| `align-self` | 单个项目的交叉轴对齐 | `auto` |
| `order` | 排列顺序 | `0` |

```css
.container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
}

/* flex: 1 等于 flex: 1 1 0（等分剩余空间） */
.item {
    flex: 1;
}

/* 固定宽度 + 弹性宽度混用 */
.sidebar {
    flex: 0 0 200px;  /* 不放大不缩小，固定 200px */
}
.main {
    flex: 1;           /* 占据剩余所有空间 */
}
```

**常见布局模式**：

```css
/* 水平居中 */
.center {
    display: flex;
    justify-content: center;
    align-items: center;
}

/* 两端对齐导航 */
nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

/* 等宽三列 */
.columns {
    display: flex;
    gap: 20px;
}
.columns > * {
    flex: 1;
}
```

> 💡 Flex 是一维布局之王，适合导航栏、卡片列表、表单排列等场景。

---

**2.4 CSS Grid 布局**

> 对应文件：`CSS Grid布局.html`

Grid 是一种**二维**布局模型，同时控制行和列，适合复杂的页面格局。

**核心概念**：

```
┌───────────────────────────────────┐
│  Grid Container                   │
│  ┌─────┬─────┬─────┐            │
│  │  1  │  2  │  3  │  行轨道    │
│  ├─────┼─────┼─────┤            │
│  │  4  │  5  │  6  │            │
│  └─────┴─────┴─────┘            │
│        列轨道                      │
└───────────────────────────────────┘
```

**容器属性**：

| 属性 | 说明 | 示例 |
|------|------|------|
| `display` | 启用 Grid | `grid`, `inline-grid` |
| `grid-template-columns` | 列定义 | `repeat(3, 1fr)` |
| `grid-template-rows` | 行定义 | `100px auto 100px` |
| `grid-template-areas` | 区域命名 | `"header header"` |
| `gap` | 行列间距 | `20px` |
| `column-gap` | 列间距 | `20px` |
| `row-gap` | 行间距 | `20px` |
| `justify-items` | 单元格水平对齐 | `center`, `start`, `end`, `stretch` |
| `align-items` | 单元格垂直对齐 | `center`, `start`, `end`, `stretch` |
| `place-items` | 上面两个的简写 | `center` |
| `justify-content` | 整个网格水平对齐 | `center`, `space-between` |
| `align-content` | 整个网格垂直对齐 | `center` |
| `grid-auto-flow` | 自动放置方向 | `row`（默认）, `column` |

**fr 单位**：

```css
/* 1fr = 一份剩余空间 */
.grid {
    display: grid;
    grid-template-columns: 1fr 2fr 1fr;   /* 1:2:1 比例 */
    gap: 20px;
}

/* repeat() 简化重复 */
.grid {
    grid-template-columns: repeat(3, 1fr);      /* 三等分 */
    grid-template-columns: repeat(4, 200px);    /* 4列各200px */
}

/* auto-fill：自动填充尽可能多的列 */
.grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    /* 每列最小 250px，空间够就多填列 */
}
```

**项目属性**：

| 属性 | 说明 |
|------|------|
| `grid-column` | 列起始/结束（简写） |
| `grid-row` | 行起始/结束（简写） |
| `grid-area` | 放置在命名区域 |
| `justify-self` | 单元格水平对齐 |
| `align-self` | 单元格垂直对齐 |

```css
/* 占据 2 列 */
.item {
    grid-column: span 2;
}

/* 从第 2 条线到第 4 条线 */
.item {
    grid-column: 2 / 4;
    grid-row: 1 / 3;
}
```

**经典页面布局**：

```css
.page {
    display: grid;
    grid-template-areas:
        "header  header  header"
        "sidebar main    aside"
        "footer  footer  footer";
    grid-template-columns: 200px 1fr 200px;
    grid-template-rows: 60px 1fr 60px;
    min-height: 100vh;
}

.header  { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main    { grid-area: main; }
.aside   { grid-area: aside; }
.footer  { grid-area: footer; }
```

> 💡 Flex vs Grid：一维排列用 Flex（导航栏、卡片列表），二维布局用 Grid（整体页面、仪表盘）。

---

**2.5 CSS 视觉美化**

> 对应文件：`CSS视觉美化.html`

**背景 background**：

| 属性 | 说明 | 示例 |
|------|------|------|
| `background-color` | 背景颜色 | `#f0f0f0` |
| `background-image` | 背景图片 | `url("bg.jpg")` |
| `background-repeat` | 重复方式 | `no-repeat`, `repeat-x` |
| `background-position` | 位置 | `center`, `top right` |
| `background-size` | 尺寸 | `cover`, `contain`, `100% auto` |
| `background-attachment` | 滚动行为 | `fixed`, `scroll` |
| `background` | 简写 | `#333 url(bg.jpg) no-repeat center/cover` |

```css
/* 全屏背景图 */
.hero {
    background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)),
                url("hero.jpg") center/cover no-repeat;
    height: 100vh;
}

/* 渐变背景 */
.gradient {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 径向渐变 */
.radial {
    background: radial-gradient(circle, #fff 0%, #3498db 100%);
}
```

**阴影 shadow**：

```css
/* 盒子阴影：x偏移 y偏移 模糊 扩散 颜色 */
.box {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 文字阴影 */
.text {
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

/* 多层阴影 */
.card {
    box-shadow:
        0 1px 3px rgba(0,0,0,0.12),
        0 5px 15px rgba(0,0,0,0.08);
}

/* 内阴影（inset）*/
.inset {
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
}
```

**透明度 opacity**：

```css
.transparent {
    opacity: 0.5;  /* 0 = 完全透明，1 = 完全不透明 */
}

/* 仅背景透明（文字不透明） */
.bg-transparent {
    background-color: rgba(0, 0, 0, 0.3);
}
```

**鼠标样式 cursor**：

| 值 | 效果 |
|------|------|
| `default` | 默认箭头 |
| `pointer` | 手指（可点击） |
| `text` | 文本 I 形 |
| `move` | 移动十字 |
| `not-allowed` | 禁止 |
| `grab` / `grabbing` | 抓手 |
| `zoom-in` / `zoom-out` | 缩放 |

**滤镜 filter**：

| 函数 | 说明 | 示例 |
|------|------|------|
| `blur()` | 模糊 | `blur(5px)` |
| `brightness()` | 亮度 | `brightness(1.2)` |
| `contrast()` | 对比度 | `contrast(1.5)` |
| `grayscale()` | 灰度 | `grayscale(1)` |
| `sepia()` | 怀旧 | `sepia(0.8)` |
| `hue-rotate()` | 色相旋转 | `hue-rotate(90deg)` |
| `drop-shadow()` | 投影 | `drop-shadow(4px 4px 8px black)` |

```css
/* 图片悬停变亮 */
img:hover {
    filter: brightness(1.1);
}

/* 禁用状态变灰 */
.disabled {
    filter: grayscale(1);
    opacity: 0.6;
}
```

---

**2.6 CSS 动效与变换**

> 对应文件：`CSS动效与变换.html`

**变换 transform**：

| 函数 | 说明 | 示例 |
|------|------|------|
| `translate()` | 位移 | `translate(100px, 50px)` |
| `scale()` | 缩放 | `scale(1.2)` |
| `rotate()` | 旋转 | `rotate(45deg)` |
| `skew()` | 倾斜 | `skew(10deg, 5deg)` |

```css
/* 悬停放大 */
.card:hover {
    transform: scale(1.05);
}

/* 元素居中（经典用法） */
.center {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

/* 组合变换 */
.combined {
    transform: translate(100px, 0) rotate(45deg) scale(1.2);
    /* 从右往左执行：先 scale，再 rotate，最后 translate */
}
```

> ⚠️ `transform` 多个函数写在一个属性里，空格分隔，执行顺序从右往左。

**过渡 transition**：

```css
/* 完整写法：属性 时长 缓动 延迟 */
.element {
    transition: all 0.3s ease 0s;
}

/* 分开写 */
.element {
    transition-property: width, height, background-color;
    transition-duration: 0.3s;
    transition-timing-function: ease-in-out;
    transition-delay: 0.1s;
}

/* hover 触发过渡 */
.button {
    background-color: #3498db;
    transition: background-color 0.2s, transform 0.2s;
}
.button:hover {
    background-color: #2980b9;
    transform: translateY(-2px);
}
```

**缓动函数**：

| 值 | 效果 |
|------|------|
| `ease` | 慢→快→慢（默认） |
| `linear` | 匀速 |
| `ease-in` | 慢→快 |
| `ease-out` | 快→慢 |
| `ease-in-out` | 慢→快→慢（更平滑） |
| `cubic-bezier()` | 自定义贝塞尔曲线 |

**动画 animation**：

```css
/* 1. 定义关键帧 */
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* 带中间节点的关键帧 */
@keyframes pulse {
    0%   { transform: scale(1); }
    50%  { transform: scale(1.1); }
    100% { transform: scale(1); }
}

/* 2. 应用动画 */
.fade-in {
    animation: fadeIn 0.6s ease-out;
}

/* 完整写法：名称 时长 缓动 延迟 次数 方向 填充模式 */
.element {
    animation: pulse 2s ease-in-out infinite;
}
```

**动画属性**：

| 属性 | 说明 | 示例 |
|------|------|------|
| `animation-name` | 动画名称 | `fadeIn` |
| `animation-duration` | 持续时间 | `0.5s`, `2s` |
| `animation-timing-function` | 缓动函数 | `ease` |
| `animation-delay` | 延迟 | `0.2s` |
| `animation-iteration-count` | 播放次数 | `1`, `3`, `infinite` |
| `animation-direction` | 播放方向 | `normal`, `reverse`, `alternate` |
| `animation-fill-mode` | 结束后状态 | `forwards`（保持）, `backwards` |
| `animation-play-state` | 播放状态 | `running`, `paused` |

```css
/* 加载动画（持续旋转） */
@keyframes spin {
    to { transform: rotate(360deg); }
}
.spinner {
    animation: spin 1s linear infinite;
}

/* 弹入效果 */
@keyframes bounceIn {
    0%   { transform: scale(0); opacity: 0; }
    60%  { transform: scale(1.1); }
    100% { transform: scale(1); opacity: 1; }
}
.bounce {
    animation: bounceIn 0.5s ease-out;
}

/* 暂停动画 */
.card:hover {
    animation-play-state: paused;
}
```

> 💡 与 `transition` 的区别：`transition` 需要触发（如 `:hover`），只能从 A 到 B；`animation` 自动播放，可以定义多个关键帧，循环播放。

---
