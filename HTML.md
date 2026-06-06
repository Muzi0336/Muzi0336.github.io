---
cssclasses:
  - inline-list
---

作者：zyyc-0336
日期： 2026-06-04
修改日期：2026-06-05
参考来源：无
内容标签： #HTML #前端 #zyyc-0336

---


**学习路径建议**

> 1. 先学 **1.1-1.5**（HTML基础），掌握标签和文本
> 2. 再学 **1.6-1.7**（区块和表单），理解布局基础
> 3. 然后学 **2.1-2.3**（语义化、多媒体、表格），提升代码质量
> 4. 最后学 **2.4-2.10**（进阶内容），完成完整页面

**常见错误提示**

> ⚠️ 标签必须闭合：`<p>内容</p>` 不是 `<p>内容`
> ⚠️ 属性值必须加引号：`href="url"` 不是 `href=url`
> ⚠️ 嵌套要正确：`<p><strong>文字</strong></p>` 不是 `<p><strong>文字</p></strong>`

---

**目录**

- **一、HTML 基础** 
    - [1.1 什么是 HTML](#11-什么是-html) 
	-  [1.2 文件结构](#12-html-文件结构) 
	- [1.3 标签](#13-html-标签) 
	- [1.4 属性](#14-html-属性) 
	- [1.5 文本标签](#15-常见文本标签) 
		- [1.5.1 列表标签](#列表标签)
	- [1.6 区块](#16-html-区块) 
	- [1.6.1 行内块元素](#行内块元素inline-block)
	- [1.7 表单](#17-html-表单)
- **二、HTML 进阶** 
	- [2.1 语义化标签](#21-语义化标签)
	- [2.2 多媒体标签](#22-多媒体标签) 
	- [2.3 表格进阶](#23-表格进阶) 
	- [2.4 表单进阶](#24-表单进阶)
	- [2.5 链接进阶](#25-链接进阶)
	- [2.6 HTML5 新增标签](#26-html5-新增标签)
	- [2.7 嵌入与代码](#27-嵌入与代码)
	- [2.8 字符实体](#28-字符实体)
	- [2.9 link 引入 CSS 与图标](#29-link-引入-css-与图标)
	- [2.10 完整 HTML 模板](#210-完整-html-模板)

---

**一、HTML 基础** `页面的骨架，定义内容结构`

---

**1.1 什么是 HTML**

> HTML = **H**yper**T**ext **M**arkup **L**anguage（超文本标记语言）

HTML 不是编程语言，是**标记语言**——用一系列"标签"告诉浏览器页面里有什么内容。

---

**1.2 HTML 文件结构**

每个 HTML 文件都长这样，这是固定骨架：

```html
<!DOCTYPE html>          <!-- 告诉浏览器：这是 HTML5 文件 -->
<html lang="en">         <!-- 整个文档的根元素 -->
<head>
    <meta charset="UTF-8">              <!-- 字符编码，防止中文乱码 -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0">  <!-- 移动端适配 -->
    <title>页面标题</title>              <!-- 浏览器标签栏显示的文字 -->
    <link rel="stylesheet" href="style.css">  <!-- 引入外部 CSS -->
    <script src="script.js"></script>          <!-- 引入外部 JS -->
</head>
<body>
    <!-- 页面内容写在这里 -->
    <h1>你好世界</h1>
    <p>这是第一个网页</p>
</body>
</html>
```

**结构说明**：

| 标签 | 作用 | 用户可见？ |
|------|------|-----------|
| `<!DOCTYPE html>` | 声明文档类型，必须放第一行 | ❌ |
| `<head>` | 放元信息（标题、编码、引入的 CSS/JS） | ❌ |
| `<body>` | 放页面内容 | ✅ |

---

**1.3 HTML 标签**

标签是 HTML 的基本单位，用 `<>` 包裹关键字。

**双标签**（有内容）——成对出现，内容写在中间：

```html
<p>这是一个段落</p>       <!-- p = 段落 -->
<h1>这是一级标题</h1>     <!-- h1 = 最大的标题 -->
<a href="#">这是一个超链接</a>  <!-- a = 超链接 -->
```

**单标签**（无内容）——没有结束标签，用于"自闭合"元素：

```html
<input type="text">   <!-- 输入框 -->
<br>                   <!-- 换行 -->
<hr>                   <!-- 水平分割线 -->
<img src="photo.jpg">  <!-- 图片 -->
```

> 💡 **记忆口诀**：有内容用双标签，没内容用单标签。

---

**1.4 HTML 属性**

> 对应文件：`HTML属性.html`

属性给标签添加额外信息，写在开始标签里。

**基本语法**：

```html
<标签名 属性名="属性值">
```

**示例**（来自 `HTML属性.html`）：

```html
<!-- style: 内联样式，直接写 CSS -->
<h1 style="color:blue;">带有内联样式的标题</h1>

<!-- class 和 id: 通用属性 -->
<p class="text" id="paragraph1">这是一个段落，具有class和id属性。</p>

<!-- a 标签: href 指定链接地址，target 指定打开方式 -->
<a href="https://www.example.com" target="_blank">这是一个链接，点击打开新窗口</a>
<a href="https://www.example.com" target="_self">这是一个链接，点击在当前窗口打开</a>

<!-- br: 换行 -->
<!-- hr: 水平线 -->
<br>
<hr>

<!-- img 标签: src 图片地址，alt 替代文本，title 悬停提示，width/height 尺寸 -->
<img src="https://via.placeholder.com/150" alt="示例图片" title="这是一个示例图片" width="150" height="150">
```

**属性规则**：

- 属性名**不区分大小写**（`class` 和 `CLASS` 一样）
- 属性值**区分大小写**（`src="A.jpg"` 和 `src="a.jpg"` 是不同文件）

**通用属性**（大部分标签都能用）：

| 属性 | 作用 | 示例 |
|------|------|------|
| `id` | 唯一标识，一个页面里不能重复 | `<div id="header">` |
| `class` | 类名，可以多个元素共用，配合 CSS 使用 | `<p class="text">` |
| `style` | 内联样式，直接写 CSS | `<h1 style="color:red">` |

**a 标签的 target 属性**：

| 值 | 效果 |
|------|------|
| `_blank` | 在新窗口打开 |
| `_self` | 在当前窗口打开（默认） |
| `_parent` | 在父窗口打开 |
| `_top` | 在最顶层窗口打开 |

**img 标签的常用属性**：

| 属性 | 作用 |
|------|------|
| `src` | 图片地址（必填） |
| `alt` | 图片加载失败时显示的文字 |
| `title` | 鼠标悬停时的提示文字 |
| `width` | 图片宽度 |
| `height` | 图片高度 |

---

**1.5 常见文本标签**

> 对应文件：`常见文本标签.html`

**标题标签 h1 ~ h6**

```html
<h1>一级标题标签</h1>
<h2>二级标题标签</h2>
<h3>三级标题标签</h3>
<h4>四级标题标签</h4>
<h5>五级标题标签</h5>
<h6>六级标题标签</h6>
```

> ⚠️ 一个页面通常只有一个 `h1`，用于页面主标题。

**段落标签 p**

```html
<p>段落标签</p>
```

**文本格式标签**

```html
<p>文本演示，<b>加粗</b> <i>斜体</i> <u>下划线</u> <s>删除线</s></p>
```

> 💡 **面试常问**：`<b>` vs `<strong>`、`<i>` vs `<em>` 的区别？
> 答：前者只是视觉效果，后者有语义（搜索引擎和屏幕阅读器能识别"强调"）。

**strong 标签详解**

`<strong>` 用于表示**重要性、严重性或紧迫性**的内容，浏览器默认显示为加粗。

```html
<!-- 基本用法 -->
<p>请<strong>务必</strong>在截止日期前提交</p>

<!-- 嵌套使用（强调程度递增） -->
<p>这是<strong>重要</strong>的内容，这是<strong><strong>非常重要</strong></strong>的内容</p>

<!-- 配合 CSS 使用 -->
<p class="warning">警告：<strong>禁止</strong>在运行时修改配置</p>
```

**strong vs b 的区别**：

| 特性 | `<strong>` | `<b>` |
|------|-----------|-------|
| 语义 | 表示内容的重要性 | 仅视觉加粗 |
| 可访问性 | 屏幕阅读器会强调读出 | 无特殊处理 |
| SEO | 搜索引擎会给予更高权重 | 无影响 |
| 默认样式 | 加粗 | 加粗 |
| 使用场景 | 警告、重要提示、关键信息 | 仅用于视觉装饰 |

**实际应用示例**：

```html
<!-- 表单验证提示 -->
<label>密码：<input type="password"></label>
<p class="error">密码<strong>不能为空</strong>，且长度至少<strong>8位</strong></p>

<!-- 产品特性强调 -->
<div class="product">
    <h3>这款手机的三大亮点</h3>
    <ul>
        <li><strong>超长续航</strong>：5000mAh大电池</li>
        <li><strong>极速充电</strong>：30分钟充满</li>
        <li><strong>顶级性能</strong>：最新旗舰芯片</li>
    </ul>
</div>

<!-- 法律条款 -->
<p>用户<strong>必须</strong>遵守以下条款，违反者将<strong>永久封禁</strong>账号</p>
```

**1.5.1 列表标签**

> 对应文件：`列表标签.html`

**无序列表**（unordered list）——用 `<ul>` + `<li>`：

```html
<ul>
    <li>HTML</li>
    <li>CSS</li>
    <li>JavaScript</li>
</ul>
```

**有序列表**（ordered list）——用 `<ol>` + `<li>`：

```html
<ol>
    <li>第一步：打开 VSCode</li>
    <li>第二步：新建 HTML 文件</li>
    <li>第三步：写代码</li>
</ol>
```

**描述列表**（description list）——用 `<dl>` + `<dt>` + `<dd>`：

```html
<dl>
    <dt>HTML</dt>
    <dd>超文本标记语言，定义页面结构</dd>
    <dt>CSS</dt>
    <dd>层叠样式表，控制页面样式</dd>
</dl>
```

**列表属性**（有序列表 `<ol>` 专用）：

| 属性 | 说明 | 示例 |
|------|------|------|
| `type` | 编号类型 | `1`（数字）、`A`（大写）、`a`（小写）、`I`（大写罗马）、`i`（小写罗马） |
| `start` | 起始编号 | `start="5"` 从 5 开始 |
| `reversed` | 倒序排列 | `<ol reversed>` |

```html
<!-- type: 编号类型 -->
<ol type="A">
    <li>选项A</li>
    <li>选项B</li>
</ol>

<!-- start: 起始编号 -->
<ol start="5">
    <li>从5开始</li>
    <li>第6个</li>
</ol>

<!-- reversed: 倒序 -->
<ol reversed>
    <li>第3名</li>
    <li>第2名</li>
    <li>第1名</li>
</ol>
```

**列表嵌套**：在 `<li>` 里面放另一个列表，用于多级菜单、树形结构。

```html
<ul>
    <li>前端开发
        <ul>
            <li>HTML</li>
            <li>CSS</li>
            <li>JavaScript</li>
        </ul>
    </li>
    <li>后端开发
        <ul>
            <li>Python</li>
            <li>Java</li>
        </ul>
    </li>
</ul>
```

**行内元素 span**

```html
<p>这是普通文字，<span style="color:red;">这是红色文字</span>，这是普通文字。</p>
```

> 💡 `span` 是无语义的行内容器，用来包裹一小段文字，配合 CSS 做样式。

---

**1.6 HTML 区块**

> 对应文件：`语义化与结构.html`

**块级元素 vs 行内元素**

| 类型 | 特点 | 常见标签 |
|------|------|----------|
| 块级元素 | 独占一行，可以设置宽高 | `div`, `p`, `h1~h6`, `ul`, `ol`, `li`, `table`, `form` |
| 行内元素 | 在一行内排列，不能直接设置宽高 | `span`, `a`, `img`, `input`, `b`, `i`, `u`, `s` |

**div 和 span**

```html
<!-- div: 块级容器，用于布局分区 -->
<div>
    <h2>标题</h2>
    <p>内容</p>
</div>

<!-- span: 行内容器，用于包裹文字 -->
<p>这是<span style="color:red;">红色</span>文字</p>
```

**行内块元素（inline-block）**

行内块元素是介于块级元素和行内元素之间的"混合体"：

| 特性 | 块级元素 | 行内元素 | 行内块元素 |
|------|----------|----------|------------|
| 独占一行 | ✅ | ❌ | ❌ |
| 可设置宽高 | ✅ | ❌ | ✅ |
| 可设置内外边距 | ✅ | 仅水平方向 | ✅ |
| 默认宽度 | 父容器100% | 内容撑开 | 内容撑开 |

**常见行内块元素**：

```html
<!-- img 本身就是行内块 -->
<img src="photo.jpg" width="100" height="100">
<img src="photo2.jpg" width="100" height="100">

<!-- input 也是行内块 -->
<input type="text" placeholder="输入框1">
<input type="text" placeholder="输入框2">

<!-- button 默认也是行内块 -->
<button>按钮1</button>
<button>按钮2</button>
```

**将元素转换为行内块**：

```html
<!-- 方式1：display: inline-block -->
<span style="display: inline-block; width: 100px; height: 50px; background: #3498db; color: white; text-align: center; line-height: 50px;">
    行内块 span
</span>

<!-- 方式2：vertical-align 控制对齐 -->
<div style="background: #eee; height: 100px;">
    <span style="display: inline-block; width: 80px; height: 80px; background: #e74c3c; vertical-align: middle;">
        垂直居中
    </span>
    <span style="display: inline-block; width: 80px; height: 60px; background: #3498db; vertical-align: middle;">
        垂直居中
    </span>
</div>
```

**行内块的典型应用场景**：

```html
<!-- 1. 导航菜单 -->
<nav>
    <a href="#" style="display: inline-block; padding: 10px 20px; background: #2c3e50; color: white; text-decoration: none;">首页</a>
    <a href="#" style="display: inline-block; padding: 10px 20px; background: #2c3e50; color: white; text-decoration: none;">关于</a>
    <a href="#" style="display: inline-block; padding: 10px 20px; background: #2c3e50; color: white; text-decoration: none;">联系</a>
</nav>

<!-- 2. 表单按钮组 -->
<div>
    <button style="display: inline-block; padding: 8px 16px; background: #27ae60; color: white; border: none;">确定</button>
    <button style="display: inline-block; padding: 8px 16px; background: #95a5a6; color: white; border: none;">取消</button>
</div>

<!-- 3. 标签/徽章 -->
<span style="display: inline-block; padding: 4px 8px; background: #e74c3c; color: white; border-radius: 4px; font-size: 12px;">NEW</span>
<span style="display: inline-block; padding: 4px 8px; background: #3498db; color: white; border-radius: 4px; font-size: 12px;">HOT</span>
```

**行内块的常见问题**：

```html
<!-- 问题：行内块之间会有间隙 -->
<div style="background: #eee;">
    <span style="display: inline-block; width: 100px; height: 100px; background: #e74c3c;"></span>
    <span style="display: inline-block; width: 100px; height: 100px; background: #3498db;"></span>
</div>
<!-- 两个方块之间会有4px的间隙（HTML换行符产生的） -->

<!-- 解决方案1：父元素设置 font-size: 0 -->
<div style="background: #eee; font-size: 0;">
    <span style="display: inline-block; width: 100px; height: 100px; background: #e74c3c; font-size: 14px;"></span>
    <span style="display: inline-block; width: 100px; height: 100px; background: #3498db; font-size: 14px;"></span>
</div>

<!-- 解决方案2：HTML标签写在同一行 -->
<div style="background: #eee;">
    <span style="display: inline-block; width: 100px; height: 100px; background: #e74c3c;"></span><span style="display: inline-block; width: 100px; height: 100px; background: #3498db;"></span>
</div>

<!-- 解决方案3：使用 flex 布局（推荐） -->
<div style="display: flex; background: #eee;">
    <span style="width: 100px; height: 100px; background: #e74c3c;"></span>
    <span style="width: 100px; height: 100px; background: #3498db;"></span>
</div>
```

**语义化区块标签**

| 标签 | 作用 |
|------|------|
| `<header>` | 页头 |
| `<nav>` | 导航栏 |
| `<main>` | 主体内容 |
| `<section>` | 内容分区 |
| `<article>` | 独立内容（文章、博客） |
| `<aside>` | 侧边栏 |
| `<footer>` | 页脚 |

```html
<body>
    <header>
        <nav>导航栏</nav>
    </header>
    <main>
        <article>
            <section>文章内容</section>
        </article>
        <aside>侧边栏</aside>
    </main>
    <footer>页脚信息</footer>
</body>
```

---

**1.7 HTML 表单**

> 对应文件：`表单与输入.html`

**表单基本结构**

```html
<form action="/submit" method="post">
    <label for="username">用户名：</label>
    <input type="text" id="username" name="username" placeholder="请输入用户名">

    <label for="password">密码：</label>
    <input type="password" id="password" name="password" placeholder="请输入密码">

    <button type="submit">登录</button>
</form>
```

**input 的 type 类型**

| type | 说明 | 示例 |
|------|------|------|
| `text` | 文本输入框 | `<input type="text">` |
| `password` | 密码输入框（显示圆点） | `<input type="password">` |
| `email` | 邮箱输入框（自动验证格式） | `<input type="email">` |
| `number` | 数字输入框（只能输数字） | `<input type="number">` |
| `tel` | 电话号码（手机端弹数字键盘） | `<input type="tel">` |
| `url` | 网址输入框 | `<input type="url">` |
| `search` | 搜索框（带清除按钮） | `<input type="search">` |
| `date` | 日期选择器 | `<input type="date">` |
| `time` | 时间选择器 | `<input type="time">` |
| `datetime-local` | 日期时间选择器 | `<input type="datetime-local">` |
| `month` | 月份选择器 | `<input type="month">` |
| `week` | 周选择器 | `<input type="week">` |
| `color` | 颜色选择器 | `<input type="color">` |
| `range` | 滑块 | `<input type="range">` |
| `file` | 文件上传 | `<input type="file">` |
| `hidden` | 隐藏字段 | `<input type="hidden">` |
| `radio` | 单选按钮 | `<input type="radio">` |
| `checkbox` | 复选框 | `<input type="checkbox">` |
| `submit` | 提交按钮 | `<input type="submit">` |
| `reset` | 重置按钮 | `<input type="reset">` |
| `button` | 普通按钮 | `<input type="button">` |

**单选按钮和复选框**

```html
<!-- 单选按钮：name 相同实现互斥 -->
<input type="radio" name="gender" value="male" id="male">
<label for="male">男</label>

<input type="radio" name="gender" value="female" id="female">
<label for="female">女</label>

<!-- 复选框：可以多选 -->
<input type="checkbox" name="hobby" value="reading" id="reading">
<label for="reading">阅读</label>

<input type="checkbox" name="hobby" value="gaming" id="gaming">
<label for="gaming">游戏</label>
```

**下拉选择框**

```html
<select name="city" id="city">
    <option value="">请选择城市</option>
    <option value="beijing">北京</option>
    <option value="shanghai">上海</option>
    <option value="guangzhou">广州</option>
</select>
```

**多行文本框**

```html
<textarea name="message" id="message" rows="5" cols="30" placeholder="请输入留言"></textarea>
```

**表单提交方式**

| 属性 | 说明 |
|------|------|
| `action` | 提交到的 URL |
| `method` | 提交方式（`GET` 或 `POST`） |
| `enctype` | 编码类型（文件上传时用 `multipart/form-data`） |

---

**二、HTML 进阶** `语义化、多媒体、表格、表单增强`

---

**2.1 语义化标签**

> 对应文件：`语义化与结构.html`

**什么是语义化？**

语义化 = 用**有意义的标签**描述内容结构，而不是全用 `div`。

**好处**：

- 搜索引擎能更好地理解页面内容（SEO 优化）
- 屏幕阅读器能正确解读（无障碍访问）
- 代码更易读、易维护

**常用语义化标签**：

| 标签 | 语义 | 使用场景 |
|------|------|----------|
| `<header>` | 页头 | 页面顶部、文章头部 |
| `<nav>` | 导航 | 主导航栏 |
| `<main>` | 主体 | 页面主体内容（只能有一个） |
| `<section>` | 分区 | 内容分组（有标题） |
| `<article>` | 独立内容 | 文章、博客、评论 |
| `<aside>` | 侧边栏 | 辅助内容、广告 |
| `<footer>` | 页脚 | 页面底部、版权信息 |
| `<figure>` | 媒体内容 | 图片、图表、代码示例 |
| `<figcaption>` | 媒体标题 | `<figure>` 的标题 |
| `<mark>` | 高亮 | 突出显示文本 |
| `<time>` | 时间 | 日期和时间 |
| `<details>` | 折叠内容 | 可展开/收起的内容 |
| `<summary>` | 折叠标题 | `<details>` 的标题 |

**示例**：

```html
<body>
    <header>
        <nav>
            <a href="/">首页</a>
            <a href="/about">关于</a>
        </nav>
    </header>

    <main>
        <article>
            <h1>文章标题</h1>
            <time datetime="2026-06-04">2026年6月4日</time>
            <section>
                <h2>第一章</h2>
                <p>内容...</p>
            </section>
            <figure>
                <img src="photo.jpg" alt="示例图片">
                <figcaption>图片说明</figcaption>
            </figure>
        </article>

        <aside>
            <h3>相关推荐</h3>
            <ul>
                <li><a href="#">推荐1</a></li>
                <li><a href="#">推荐2</a></li>
            </ul>
        </aside>
    </main>

    <footer>
        <p>© 2026 版权所有</p>
    </footer>
</body>
```

**details 折叠内容**：

```html
<details>
    <summary>点击展开详情</summary>
    <p>这里是隐藏的内容，点击后才会显示。</p>
    <p>可以放任何内容。</p>
</details>
```

---

**2.2 多媒体标签**

> 对应文件：`多媒体与嵌入.html`

**图片标签 img**

```html
<img src="image.jpg" alt="图片描述" title="悬停提示" width="300" height="200">
```

| 属性 | 说明 |
|------|------|
| `src` | 图片地址（必填） |
| `alt` | 图片加载失败时显示的文字（必填，无障碍） |
| `title` | 鼠标悬停时的提示文字 |
| `width` | 图片宽度 |
| `height` | 图片高度 |
| `loading` | `lazy` 懒加载，`eager` 立即加载（默认） |
| `srcset` | 提供多个图片供浏览器选择（响应式） |
| `sizes` | 配合 srcset，告诉浏览器图片在不同屏幕下的显示尺寸 |

**loading 懒加载**：

```html
<!-- 懒加载：滚动到附近才加载，减少初始加载时间 -->
<img src="photo.jpg" alt="照片" loading="lazy">

<!-- 立即加载（默认）：首屏重要图片用这个 -->
<img src="logo.png" alt="Logo" loading="eager">
```

> 💡 首屏可见的图片不要用 `lazy`，会影响用户体验。

**srcset 响应式图片**：

```html
<!-- srcset: 提供多个图片供浏览器选择 -->
<!-- w 表示图片实际宽度 -->
<img 
    src="photo-800.jpg"
    srcset="photo-400.jpg 400w,
            photo-800.jpg 800w,
            photo-1200.jpg 1200w"
    sizes="(max-width: 600px) 400px,
           (max-width: 1000px) 800px,
           1200px"
    alt="风景照片"
>

<!-- 简单写法：告诉浏览器图片的像素密度 -->
<img 
    src="photo.jpg"
    srcset="photo.jpg 1x, photo@2x.jpg 2x"
    alt="照片"
>
<!-- 1x = 普通屏幕，2x = 高清屏幕（Retina） -->
```

**图片格式对比**：

| 格式 | 特点 | 适用场景 |
|------|------|----------|
| JPG | 有损压缩，体积小，不支持透明 | 照片、复杂图像 |
| PNG | 无损压缩，支持透明 | 图标、需要透明的图 |
| GIF | 支持动画，256色 | 动图 |
| WebP | 体积小，质量高，支持透明和动画 | 现代网页首选 |
| SVG | 矢量格式，无限缩放 | 图标、Logo、简单图形 |

**音频标签 audio**

```html
<audio src="music.mp3" controls autoplay loop></audio>
```

| 属性 | 说明 |
|------|------|
| `src` | 音频文件地址 |
| `controls` | 显示播放控件 |
| `autoplay` | 自动播放（浏览器通常禁止） |
| `loop` | 循环播放 |
| `muted` | 静音 |

**视频标签 video**

```html
<video src="video.mp4" controls width="640" height="360" poster="cover.jpg"></video>
```

| 属性 | 说明 |
|------|------|
| `src` | 视频文件地址 |
| `controls` | 显示播放控件 |
| `width/height` | 尺寸 |
| `poster` | 封面图（视频加载前显示） |
| `autoplay` | 自动播放 |
| `loop` | 循环播放 |
| `muted` | 静音（ autoplay 需要 muted 才能生效） |

**嵌入内容 embed 和 object**

```html
<!-- embed: 嵌入外部内容 -->
<embed src="document.pdf" type="application/pdf" width="100%" height="600px">

<!-- object: 嵌入外部内容（更灵活） -->
<object data="document.pdf" type="application/pdf" width="100%" height="600px">
    <p>你的浏览器不支持 PDF 预览，<a href="document.pdf">点击下载</a></p>
</object>
```

---

**2.3 表格进阶**

> 对应文件：`表格进阶.html`

**完整表格结构**

```html
<table>
    <caption>学生成绩表</caption>
    <thead>
        <tr>
            <th>姓名</th>
            <th>语文</th>
            <th>数学</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>张三</td>
            <td>85</td>
            <td>92</td>
        </tr>
        <tr>
            <td>李四</td>
            <td>78</td>
            <td>88</td>
        </tr>
    </tbody>
    <tfoot>
        <tr>
            <td>平均分</td>
            <td>81.5</td>
            <td>90</td>
        </tr>
    </tfoot>
</table>
```

**表格属性**：

| 属性 | 说明 | 示例 |
|------|------|------|
| `border` | 边框 | `<table border="1">` |
| `cellpadding` | 单元格内边距 | `<table cellpadding="10">` |
| `cellspacing` | 单元格间距 | `<table cellspacing="0">` |
| `colspan` | 列合并 | `<td colspan="2">` |
| `rowspan` | 行合并 | `<td rowspan="3">` |

**合并单元格示例**：

```html
<!-- 列合并：两列合并为一列 -->
<tr>
    <td colspan="2">合并两列</td>
</tr>

<!-- 行合并：三行合并为一行 -->
<tr>
    <td rowspan="3">合并三行</td>
    <td>第二行</td>
</tr>
<tr>
    <td>第三行</td>
</tr>
```

---

**2.4 表单进阶**

> 对应文件：`表单与输入.html`

**表单验证**

```html
<form>
    <!-- required: 必填 -->
    <input type="text" required>

    <!-- pattern: 正则表达式验证 -->
    <input type="text" pattern="[A-Za-z]{3,}">

    <!-- minlength / maxlength: 最小/最大长度 -->
    <input type="text" minlength="3" maxlength="10">

    <!-- min / max: 数字范围 -->
    <input type="number" min="0" max="100">

    <!-- placeholder: 占位提示文字 -->
    <input type="text" placeholder="请输入用户名">

    <!-- autofocus: 页面加载后自动聚焦 -->
    <input type="text" autofocus>

    <!-- disabled: 禁用 -->
    <input type="text" disabled>

    <!-- readonly: 只读 -->
    <input type="text" readonly>

    <!-- multiple: 允许多选（文件、邮箱） -->
    <input type="file" multiple>

    <!-- step: 步长（数字输入） -->
    <input type="number" step="5">
</form>
```

**fieldset 和 legend：表单分组**

```html
<form>
    <fieldset>
        <legend>个人信息</legend>
        <label for="name">姓名：</label>
        <input type="text" id="name" name="name">

        <label for="age">年龄：</label>
        <input type="number" id="age" name="age">
    </fieldset>

    <fieldset>
        <legend>账号信息</legend>
        <label for="email">邮箱：</label>
        <input type="email" id="email" name="email">
    </fieldset>
</form>
```

**datalist：输入建议列表**

```html
<input type="text" list="languages" placeholder="选择编程语言">
<datalist id="languages">
    <option value="Python">
    <option value="JavaScript">
    <option value="Java">
    <option value="C++">
    <option value="Go">
</datalist>
```

---

**2.5 链接进阶**

> 对应文件：`链接进阶.html`

**a 标签的 href 属性**

```html
<!-- 外部链接 -->
<a href="https://www.example.com">外部链接</a>

<!-- 内部链接 -->
<a href="about.html">关于我们</a>

<!-- 锚点链接：跳转到页面内指定位置 -->
<a href="#section2">跳转到第二章</a>
<div id="section2">第二章内容</div>

<!-- 邮件链接 -->
<a href="mailto:example@email.com">发送邮件</a>

<!-- 电话链接 -->
<a href="tel:13800138000">拨打电话</a>

<!-- 下载链接 -->
<a href="file.pdf" download>下载文件</a>
```

**base 标签：设置基础 URL**

```html
<head>
    <base href="https://www.example.com/" target="_blank">
</head>
<body>
    <!-- 这个链接会跳转到 https://www.example.com/about -->
    <a href="about">关于我们</a>
</body>
```

---

**2.6 HTML5 新增标签**

> 对应文件：`HTML5新增标签.html`

**结构标签**

| 标签 | 说明 |
|------|------|
| `<header>` | 页头 |
| `<nav>` | 导航 |
| `<main>` | 主体内容 |
| `<section>` | 内容分区 |
| `<article>` | 独立内容 |
| `<aside>` | 侧边栏 |
| `<footer>` | 页脚 |
| `<figure>` | 媒体内容 |
| `<figcaption>` | 媒体标题 |
| `<details>` | 折叠内容 |
| `<summary>` | 折叠标题 |
| `<mark>` | 高亮文本 |
| `<time>` | 时间 |
| `<progress>` | 进度条 |
| `<meter>` | 度量衡 |

**input 新增 type**

| type | 说明 |
|------|------|
| `date` | 日期选择器 |
| `time` | 时间选择器 |
| `datetime-local` | 日期时间选择器 |
| `month` | 月份选择器 |
| `week` | 周选择器 |
| `color` | 颜色选择器 |
| `range` | 滑块 |
| `search` | 搜索框 |
| `tel` | 电话号码 |
| `url` | 网址 |

**进度条和度量衡**

```html
<!-- progress: 进度条 -->
<progress value="70" max="100">70%</progress>

<!-- meter: 度量衡（如磁盘使用率） -->
<meter value="0.7" min="0" max="1" low="0.3" high="0.7" optimum="0.5">70%</meter>
```

---

**2.7 嵌入与代码**

> 对应文件：`多媒体与嵌入.html`

**嵌套网页 iframe**

```html
<iframe src="https://www.example.com" width="600" height="300" frameborder="0"></iframe>
```

| 属性 | 说明 |
|------|------|
| `src` | 嵌入的网页地址 |
| `width/height` | 尺寸 |
| `frameborder` | 边框（0或1） |
| `sandbox` | 安全限制 |

**代码展示 pre/code**

```html
<!-- 行内代码 -->
<p>使用 <code>&lt;p&gt;</code> 标签创建段落</p>

<!-- 代码块（保留空格和换行） -->
<pre><code>&lt;!DOCTYPE html&gt;
&lt;html&gt;
&lt;head&gt;
    &lt;title&gt;我的页面&lt;/title&gt;
&lt;/head&gt;
&lt;body&gt;
    &lt;h1&gt;你好世界&lt;/h1&gt;
&lt;/body&gt;
&lt;/html&gt;</code></pre>
```

**图像热区 map/area**

```html
<img src="image.jpg" usemap="#workmap">
<map name="workmap">
    <area shape="rect" coords="0,0,200,200" href="link1.html">
    <area shape="circle" coords="300,100,50" href="link2.html">
</map>
```

**SEO 相关 meta 标签**

```html
<!-- 页面描述 -->
<meta name="description" content="页面描述">

<!-- 关键词 -->
<meta name="keywords" content="HTML, 前端">

<!-- Open Graph: 社交媒体分享 -->
<meta property="og:title" content="标题">
<meta property="og:description" content="描述">
<meta property="og:image" content="preview.jpg">
```

**script 的 async/defer**

```html
<!-- 正常: 阻塞HTML解析 -->
<script src="normal.js"></script>

<!-- async: 异步加载，加载完立即执行（不保证顺序） -->
<script src="async.js" async></script>

<!-- defer: 延迟加载，HTML解析完再执行（保证顺序） -->
<script src="defer.js" defer></script>
```

| 模式 | 下载 | 执行 | 顺序 |
|------|------|------|------|
| 正常 | 阻塞 | 阻塞 | - |
| async | 不阻塞 | 加载完立即执行 | 不保证 |
| defer | 不阻塞 | HTML解析完再执行 | 保证 |

---

**2.8 字符实体**

> 对应文件：`进阶与兼容.html`

HTML 中有些字符有特殊含义（如 `<` `>`），直接写会被当成标签解析。**字符实体**用特殊代码来显示这些字符。

格式：`&实体名;` 或 `&#实体编号;`

| 实体 | 编号 | 显示 | 说明 |
|------|------|------|------|
| `&lt;` | `&#60;` | < | 小于号 |
| `&gt;` | `&#62;` | > | 大于号 |
| `&amp;` | `&#38;` | & | 和号 |
| `&nbsp;` | `&#160;` | （空格） | 不换行空格 |
| `&copy;` | `&#169;` | © | 版权符号 |
| `&reg;` | `&#174;` | ® | 注册商标 |
| `&trade;` | `&#8482;` | ™ | 商标 |
| `&euro;` | `&#8364;` | € | 欧元符号 |
| `&pound;` | `&#163;` | £ | 英镑符号 |
| `&yen;` | `&#165;` | ¥ | 人民币/日元 |
| `&times;` | `&#215;` | × | 乘号 |
| `&divide;` | `&#247;` | ÷ | 除号 |

```html
<!-- 显示 HTML 代码 -->
<p>&lt;div&gt;内容&lt;/div&gt;</p>

<!-- 多个空格（普通空格会被合并） -->
<p>第一&nbsp;&nbsp;&nbsp;第二</p>

<!-- 版权信息 -->
<p>&copy; 2026 版权所有</p>
```

---

**2.9 link 引入 CSS 与图标**

> 对应文件：`进阶与兼容.html`

`<link>` 标签用于引入**外部资源**，最常用的是引入 CSS 样式表和网页图标。

**引入 CSS 样式表**：

```html
<!-- 外部样式表（推荐） -->
<link rel="stylesheet" href="style.css">

<!-- 多个样式表 -->
<link rel="stylesheet" href="reset.css">
<link rel="stylesheet" href="main.css">
```

| 方式 | 代码 | 适用场景 |
|------|------|----------|
| 外部样式表 | `<link rel="stylesheet" href="style.css">` | 推荐，可缓存 |
| 内部样式 | `<style>...</style>` | 少量样式 |
| 内联样式 | `<div style="...">` | 特殊覆盖 |

**引入网页图标（favicon）**：

```html
<!-- ICO 格式（传统，兼容性最好） -->
<link rel="icon" href="favicon.ico">

<!-- PNG 格式（现代，支持透明） -->
<link rel="icon" type="image/png" href="icon.png">

<!-- SVG 格式（矢量，可缩放） -->
<link rel="icon" type="image/svg+xml" href="icon.svg">

<!-- Apple Touch Icon（iOS 设备图标） -->
<link rel="apple-touch-icon" href="apple-icon.png">
```

---

**2.10 完整 HTML 模板**

> 对应文件：`HTML基础结构.html`

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="页面描述，150字以内">
    <meta name="keywords" content="关键词1, 关键词2">
    <title>页面标题 - 网站名</title>
    <link rel="icon" href="favicon.ico">
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header>
        <nav>
            <a href="/">首页</a>
            <a href="/about">关于</a>
        </nav>
    </header>

    <main>
        <article>
            <h1>文章标题</h1>
            <section>
                <h2>章节标题</h2>
                <p>内容...</p>
            </section>
        </article>

        <aside>
            <h3>侧边栏</h3>
        </aside>
    </main>

    <footer>
        <p>&copy; 2026 版权所有</p>
    </footer>
</body>
</html>
```

**关键元素说明**：

| 元素 | 作用 |
|------|------|
| `<!DOCTYPE html>` | 声明 HTML5 文档，必须在第一行 |
| `lang="zh-CN"` | 设置页面语言为中文 |
| `charset="UTF-8"` | 字符编码，防止中文乱码 |
| `viewport` | 移动端适配，确保响应式布局 |
| `<link rel="icon">` | 浏览器标签页图标 |
| `<link rel="stylesheet">` | 引入外部 CSS |

---