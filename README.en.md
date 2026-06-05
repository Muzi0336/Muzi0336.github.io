# Note — Study Notes

A personal study notes repository covering Python, FastAPI, HTML, and CSS.

## Contents Overview

### Python Notes

File: [python.md](<C:\Users\21371\Documents\PYTTON\note\python.md>)

- **Fundamentals**: Variables, data types, strings, lists, tuples, sets, dictionaries
- **Control Flow**: if/match statements, while/for loops, range
- **Functions**: Positional arguments, keyword arguments, default arguments, variable-length arguments (*args, **kwargs), lambda
- **Common Modules**: json, math, os, datetime, re, random, sys, time, csv, collections, functools
- **OOP**: Class definitions, inheritance, super(), magic methods, property access control (@property)
- **Advanced Features**: Decorators, generators, iterators, context managers, closures
- **Higher-Order Functions**: map, filter, sorted, reduce, zip, enumerate, any/all
- **Type Hints**: Various usage patterns
- **Coroutines**: async/await basics
- **Others**: Walrus operator (:=), Protocol classes

The `python/` subdirectory contains focused topic notes:

| File | Content |
|------|---------|
| [装饰器.md](<C:\Users\21371\Documents\PYTTON\note\python\装饰器.md>) | Decorators: principles & practice |
| [生成器.md](<C:\Users\21371\Documents\PYTTON\note\python\生成器.md>) | Generators & yield |
| [迭代器.md](<C:\Users\21371\Documents\PYTTON\note\python\迭代器.md>) | Iterator protocol |
| [上下文管理器.md](<C:\Users\21371\Documents\PYTTON\note\python\上下文管理器.md>) | with statement & context management |
| [文件操作.md](<C:\Users\21371\Documents\PYTTON\note\python\文件操作.md>) | File I/O operations |
| [数据结构/](<C:\Users\21371\Documents\PYTTON\note\python\数据结构>) | dict / list / set / str / tuple / comprehensions |
| [函数/](<C:\Users\21371\Documents\PYTTON\note\python\函数>) | Function basics & yield |
| [工作原理/](<C:\Users\21371\Documents\PYTTON\note\python\工作原理>) | Unpacking & internal mechanisms |

---

### FastAPI Notes

File: [fastAPI.md](<C:\Users\21371\Documents\PYTTON\note\fastAPI.md>)

- **Quick Start**: Project creation, path parameters, query parameters, request body, response types
- **Core Concepts**: HTTP methods (CRUD), APIRouter modular routing, exception handling, middleware, dependency injection
- **Data Models**: Pydantic models, SQLAlchemy ORM, Enum, v2 type syntax, field validators
- **Database Operations**: ORM basics, async sessions, relationship queries (selectinload), transactions, batch operations, pagination, auto-migration
- **Authentication & Security**: JWT auth, dependency injection nesting (permission levels)
- **Files & Upload**: UploadFile, static file serving
- **Project Engineering**: Config management (pydantic-settings), unified response format, custom exceptions, Lifespan, CORS, background tasks, scheduler, logging, Request object

---

### HTML Notes


File: [前端\HTML.md](<C:\Users\21371\Documents\PYTTON\note\前端\HTML.md>) (full version)

**1. HTML Basics**

- Document structure, tags & attributes, common text tags, list tags, block elements, inline-block elements, forms

**2. Advanced HTML**

- Semantic tags, media tags (img/audio/video/embed), advanced tables, advanced forms
- Advanced links, HTML5 new tags, embedding & code (iframe/pre/code)
- Character entities, link for CSS & icons, complete HTML template

Example files in `前端\HTML\` (15 `.html` files) and `前端\index.html`.

---

### CSS Notes

File: [前端\CSS.md](<C:\Users\21371\Documents\PYTTON\note\前端\CSS.md>)

**1. CSS Basics**

- CSS syntax, three import methods, selectors (basic/combinator/attribute/pseudo-class/pseudo-element/specificity)
- CSS units (px/em/rem/vw/vh), text & font styling

**2. Advanced CSS**

- Box model (content-box vs border-box), layout & positioning (relative/absolute/fixed/sticky)
- Flex layout, Grid layout, visual styling (background/shadow/opacity/filter), effects & transforms (transition/animation/transform)

Example files in `前端\CSS\` (10 `.html` files + 1 `style.css`).

---

## Project Structure

```
note/
├── README.md               # This file (Chinese)
├── README.en.md            # This file (English)
├── python.md               # Python notes
├── fastAPI.md              # FastAPI notes
├── LICENSE                 # MIT License
├── python/                 # Python topic notes
│   ├── 装饰器.md
│   ├── 生成器.md
│   ├── 迭代器.md
│   ├── 上下文管理器.md
│   ├── 文件操作.md
│   ├── 数据结构/
│   ├── 函数/
│   └── 工作原理/
└── 前端/                   # Frontend notes & examples
    ├── index.html
    ├── HTML.md             # HTML notes (full)
    ├── CSS.md              # CSS notes
    ├── HTML/               # HTML examples (15 files)
    └── CSS/                # CSS examples (10 files + style.css)
```

## License

MIT License
