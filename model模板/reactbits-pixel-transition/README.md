# Pixel Transition

- 真实来源：https://www.reactbits.dev/animations/pixel-transition
- 官方源码目录：https://github.com/DavidHDev/react-bits/tree/main/src/content/Animations/PixelTransition
- 作者：David Haz / React Bits。
- 类型：`component`。
- 许可状态：MIT + Commons Clause License Condition v1.0。允许作为网站或产品的一部分使用，但禁止单独销售、再许可或独立再分发组件本身。本目录未归档 `jsx/css` 源码，`source/LICENSE.md` 仅为许可证文本副本。
- 已保存：`preview.png`，为官方组件演示页的实际预览截图。

## 用途

方块像素溶解后切换内容，可做课程卡翻转、题目状态切换或 AI 演示模式切换。黑白块与纸张纹理能贴合 Riso、Bauhaus 方向。

## 静态适配

原生可用 CSS Grid 方块遮罩加 `clip-path`/透明度实现；移动端减少网格数量。`prefers-reduced-motion: reduce` 下改成直接切换内容。改造成本中等，需自行实现键盘操作与状态同步。
