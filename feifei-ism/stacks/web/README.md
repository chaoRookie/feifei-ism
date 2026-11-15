# stacks/web：网页出口

肥肥主义的两种网页做法（宪法 §7 技术栈表「网页」一行）：

- **单个 React 交互页**：Vite 加 vite-plugin-singlefile，打成一个 HTML 文件。样板是「抽一支签」：一个肥肥主义按钮（甲 刮字块，主要），按下去换主色。
- **多页静态站**：Astro，两页，其中一页用 MDX 写。按钮原样用 `templates/buttons.css` 和 `motion.js`。

颜色、字号、时长一律从生成好的 token 来（`templates/tokens.css`、`tokens-motion.css`、`tokens/out/tokens.mjs`），这里不抄任何数值。`ff-vite.mjs` 是一个小 Vite 插件：引进 `templates/` 的 CSS 时，展开里面的 `/*@include:…*/`，把 `__ASSET:…__` 换成 `assets/` 的相对路径，构建时贴图被内联成 data URI。React 页的按钮直接用 `stacks/ui/registry/feifei/ui/button.tsx`，不另写一份。

## 重建（一条命令）

```bash
npm install && npm run build
```

`npm run build` 依次：打 React 单页、打 Astro 站、用无头 Chrome 从硬盘打开检查并截图。

## 生成的文件

| 文件 | 是什么 |
|---|---|
| `react/dist/index.html` | React 单页，一个文件，约 655 KB（贴图都内联了） |
| `astro/dist/index.html`、`astro/dist/notes.html` | Astro 两页，各约 455 KB，样式和贴图内联，页间相对链接 |
| `previews/*.png` | 截图：`react.png`、`react-after-click.png`、`react-390.png`、`astro-index.png`、`astro-notes.png` |
| `previews/verify.txt` | 最近一次检查的结果 |

## 跑过、确认了的

用本机 Chrome（`/Applications/Google Chrome.app`）无头打开 `file://`，8 项全过：

- React 页：没有控制台报错；按下按钮时加上 `ffdown`（压进纸里）；点一下 `--c` 换了签、计数变 1；390px 宽没有横向滚动。
- Astro：两页都没有控制台报错；在首页点「第二篇」，从硬盘跳到 `notes.html` 成功；`motion.js` 接管了己套按钮（印头出来了）。
- **Astro 从硬盘打开能用相对路径**：设置 `build.format: 'file'`（出 `notes.html` 而不是 `notes/index.html`）、`build.inlineStylesheets: 'always'`、`vite.build.assetsInlineLimit: () => true`，再在页面里自己写 `./notes.html` 这样的相对链接。产物里没有 `/_astro/` 这类绝对路径，也没有外部脚本。

## 没能确认的

- 没有真的发布成 claude.ai Artifact 看一遍。按约束：React 页是单个 HTML；Astro 是两个静态文件、相对路径、无服务器。外链只有 Google Fonts 样式表（和 `templates/page.html` 一样）；它不是脚本，但 Artifact 的内容安全策略是否放行没实测。
- 截图时 Google Fonts 能联网加载；断网时会退回宋体和系统等宽字，没测断网的样子。
- Astro 多页作为 Artifact 时，页与页之间的跳转在 Artifact 里能不能走通，没测。
- 「减少动态」模式下的样子没截图。
