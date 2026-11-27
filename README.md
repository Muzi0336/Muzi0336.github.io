# Note — Study Notes

A personal study notes repository covering HTML, and CSS.

## Contents Overview



### HTML Notes


File: [前端\HTML.md]() (full version)

**1. HTML Basics**

- Document structure, tags & attributes, common text tags, list tags, block elements, inline-block elements, forms

**2. Advanced HTML**

- Semantic tags, media tags (img/audio/video/embed), advanced tables, advanced forms
- Advanced links, HTML5 new tags, embedding & code (iframe/pre/code)
- Character entities, link for CSS & icons, complete HTML template

Example files in `前端\HTML\` (15 `.html` files) and `前端\index.html`.

---

### CSS Notes

File: [前端\CSS.md]()

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
├── README.md           # This file (English)
├── LICENSE             # MIT License
├── index.html
├── HTML.md             # HTML notes (full)
├── CSS.md              # CSS notes
├── HTML/               # HTML examples (15 files)
└── CSS/                # CSS examples (10 files + style.css)
```

### C Language Past Papers (`C语言/`)

Collection of C language exam papers, 2019–2025 (2023 not available), 236 questions in total.

- `C语言/index.html` — paper index with keyword search, year/type/status filters; 21 duplicate questions folded by default
- `C语言/q.html` — question detail: answer checking for single-choice, per-question explanation, prev/next navigation within the same year, collapsible and copyable reference solutions, and an in-browser code editor with keyword autocomplete
- `C语言/data.js` — extracted and cleaned question data (stems, options, answers, explanations, source file hashes)

### Algorithm Library (`算法/`)

Static edition of ARENA LAB, rebuilt in the site's paper-and-ink style with the author's permission. 145 problems across 7 tracks, 6 learning paths, 21 lessons, and 17 step-by-step algorithm demos. No backend: bookmarks, quiz choices and code drafts stay in `localStorage` (`arena.v1`).

- `算法/index.html` — problem list with search, track/difficulty/status filters and bookmark-only view
- `算法/q.html` — problem detail: statement, samples, derivation, complexity, collapsible C++/C/Python solutions with copy, scratch editor with keyword completion, self-check quiz, demo player, and prev/next navigation within the same track
- `算法/paths.html` — six learning paths with per-path progress
- `算法/learn.html`, `算法/lesson.html` — course index and lesson pages
- `算法/lab.html` — 17 algorithm animations, drawn live with HTML/SVG code (no screenshot frames) with play/step/reset controls
- `算法/assets/lab.js` — demo renderers and player; `算法/assets/demo_captions.js` — step captions
- `算法/assets/app_data.js` — lightweight shared index (42 KB); `算法/assets/search_data.js` — full-text search index loaded on demand
- `算法/assets/problems/<id>.js` — one problem per file, fetched only by `q.html`
- `算法/assets/lessons/<slug>.js` — one lesson per file, fetched only by `lesson.html`
- `错题本.html` — single wrong-book page: total/written counts, C and algorithm categories, expandable wrong lists

## License

MIT License
