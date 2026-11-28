# 站点字体

- **Maple Mono**：代码、快捷键、代码编辑器。
- **LXGW WenKai / 霞鹜文楷**：正文、标题和界面文字。

## 来源

- Maple Mono v7.9：https://github.com/subframe7536/maple-font
- LXGW WenKai v1.530：https://github.com/lxgw/LxgwWenKai

两个字体都使用 SIL Open Font License 1.1；许可证文件已放在本目录。
`lxgw/files/` 中是霞鹜文楷官方 webfont 的按 Unicode 范围拆分子集，只保留了 Regular 字重。

## 加载策略

- `assets/css/fonts.css` 直接声明正文和代码 face，不再通过 `@import` 引入字体 CSS。
- 正文、代码均使用 `font-display: optional`，避免字体晚到后再切换字形；冷缓存慢网可能保持系统回退。
- `lxgw/lxgwwenkai-portal-keys.woff2` 仅含四个门户品牌、导航和首屏通知/标题所需字符，由 fontTools 从上面的官方子集合并生成，只在这些门户预载。
