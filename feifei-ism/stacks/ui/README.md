# stacks/ui：界面出口

肥肥主义的 React 界面（宪法 §7 技术栈表「界面」一行），两件事：

1. **自己的 shadcn registry**：`registry.json` 里两项。
   - `feifei-ism`（`registry:style`）：`cssVars` 由 `tokens/out/tokens.flat.json` 生成，纸 → `background`，墨 → `foreground`，主色 C → `primary`，凹下面 → `secondary`/`muted`/`accent`，抬起 → `card`，浮层 → `popover`，细线 → `border`/`input`，墨 → `ring`，圆角 0；字体 `font-sans`/`font-serif` 是思源宋体，`font-heading` 站酷小薇，`font-mono` JetBrains Mono；`css` 里定标题不加粗、正文字号行高。深色和浅色一样（只做浅色）。
   - `button`（`registry:ui`）：`registry/feifei/ui/button.tsx`，`variant` 取 `k1`–`k6` 六套，另有 `primary`、`pressed`、`toggle`、`seal`、`disabled`。样子直接用 `templates/buttons.css`（加戊的彩铅圈、禁用斜杠）；按下 `ffdown` 至少压满 `--t-press-min`，戊进屏和每次点击重画圈，己盖印，禁用进屏时划一笔斜杠、按它再划。这些都是把 `motion.js` 的按钮部分改写成 React，不靠 `motion.js` 改 DOM。随附 `styles/feifei-buttons.css`（token 加按钮样式，贴图内联）。
2. **mdxcn 换皮，不改它的源码**：`mdxcn/feifei-mdxcn.css`，接在 mdxcn 的 `globals.css` 后面引入即可。

## 重建（一条命令）

```bash
npm install && npm run build
```

依次：`build:registry`（生成按钮 CSS、`registry.json`，再跑 `shadcn build`）→ `build:mdxcn`（生成覆盖 CSS）→ `build:demo`（三张样板页，各打成单个 HTML）→ `verify`（无头 Chrome 检查并截图）。

## 生成的文件

| 文件 | 是什么 |
|---|---|
| `registry.json` | 源 registry，脚本生成，别手改 |
| `registry/feifei/styles/feifei-buttons.css` | token + 按钮样式 + 内联贴图，约 1 MB |
| `public/r/feifei-ism.json`、`public/r/button.json`、`public/r/registry.json` | `shadcn build` 的产物，放到任何静态地址即可 `npx shadcn add <地址>/button.json` |
| `mdxcn/feifei-mdxcn.css` | mdxcn 的覆盖层，约 50 KB（含两张宣纸贴图） |
| `demo/dist/buttons.html` | 六套按钮样板，单文件 |
| `demo/dist/mdxcn-before.html`、`mdxcn-after.html` | 同一个 GraphTimeline 加 Callout，原样和换皮后 |
| `previews/*.png`、`previews/verify.txt` | 截图和检查结果；前后对比看 `mdxcn-before.png`、`mdxcn-after.png` |
| `demo/.gen/mdxcn-globals.css` | 构建中间文件（mdxcn 的 globals.css 去掉三行 `@import`），不进 git |

## 覆盖了 mdxcn 的哪些变量

在 `vendor/mdxcn/app/globals.css` 里找到的：

- 自己的图形变量（`:root` 和 `.dark` 各一份，`html[data-accent=…]` 还有 10 套配色会改前三个）：`--graph-accent`、`--graph-accent-2`、`--graph-accent-3`、`--graph-frame`、`--graph-muted`、`--graph-faint`、`--stage`、`--site-rail`、`--contrast-14/23/45/70`。
- `--graph-surface` 不在 `globals.css`，只在 `registry/default/graph-frame/graph-frame.tsx` 里用 `var(--graph-surface,var(--background))` 读，给角上的 `+` 和边上的标题垫底。
- 工具类（`@utility`）：`graph-frame`（四边虚线框）、`graph-rule`、`graph-rule-y`、`scrollbar-graph`、`graph-scroll-x`、`site-rail`、`site-rule`、`site-rule-y`；`@theme inline` 把 `--color-graph-*` 接到上面的变量，所以 `text-graph-accent` 这类类名会跟着变。
- shadcn 的变量：`--background`、`--foreground`、`--card`、`--popover`、`--primary`、`--secondary`、`--muted`、`--accent`、`--destructive`、`--border`、`--input`、`--ring`、`--chart-1~5`、`--sidebar-*`、`--radius`。
- 字体：`--font-sans`、`--font-mono`、`--font-heading` 写在 `@theme inline` 里，Tailwind 把字体名直接写进 `.font-mono` 等类，**光改变量不生效**，所以覆盖层另写了 `.font-sans`、`.font-mono`、`.font-heading`（不在 layer 里，压得过 Tailwind 的 utilities 层）。

时间线点与点之间的竖线是 `graph-timeline.tsx` 里的一个「│」字，颜色取 `text-graph-frame`，也就是 `--graph-frame`。它若用细线色（`--line`），在纸上只有 1.3:1 左右，几乎看不见，所以覆盖层把 `--graph-frame` 设成 `--ink-3`：在 `--paper` 上 4.95:1，过了 WCAG 1.4.11 非文字 3:1 的线。同一个变量还给虚线框、角上的「+」、箭头、空格子上色；虚线框已经去掉，角上的「+」也藏了（`figure[data-frame="box"]>span[aria-hidden="true"]`），免得变深后又把框的样子勾回来。

覆盖层的选择器是 `:root,:root.dark,:root[data-accent],:root.dark[data-accent]`，权重高过 mdxcn 的 `.dark` 和 `html.dark[data-accent="…"]`，所以切深色、切配色都还是肥肥主义。

## 跑过、确认了的

本机 Chrome 无头打开 `file://`，13 项全过（见 `previews/verify.txt`）：

- `shadcn build` 4.23.0 本机跑通（只需 npm 装包，不联网取别的东西），产出三份 JSON。
- 按钮样板：无报错；乙成组选择设 `aria-pressed`；戊开合翻转并重画圈；甲按下加 `ffdown`、松开后撤；己有 4 个印头；6 个禁用按钮都有斜杠。
- mdxcn 原样和换皮两页都无报错；换皮后 `--graph-accent` 等于 `--c`，虚线框没了，`.font-mono` 变成 JetBrains Mono 接思源宋体（中文走宋体）；时间线竖线实测颜色 rgb(111,105,97)，对纸 4.95:1；角上 8 个「+」全部不显示。

## 没能确认的

- 没有在一个真的 shadcn 项目里跑 `npx shadcn add public/r/button.json` 看它把 `cssVars` 写进 `globals.css` 的样子（试了，临时目录里的这条命令没被放行）。
- mdxcn 的动效（`motion` 库的淡入上移、0.22 秒 easeOutCubic）写在它的 JS 里，CSS 改不了；它不弹，但不是肥肥主义的「抹开」。
- mdxcn 依赖装的是新版（`motion` 14、`cn` 0.5），它自己锁的是 `motion` 13、`cn` 0.2；这两个组件能跑，别的组件没逐个试。
- 只渲染了 GraphTimeline 和 Callout 两个组件；其余 40 多个 graph 组件换皮后的样子没看。
- 按钮 CSS 约 1 MB、`button.json` 约 1 MB，因为颜料贴图都内联了；没做按需裁剪。
- 没发布成 Artifact 实测；样板页都是单个 HTML，外链只有 Google Fonts 样式表。
