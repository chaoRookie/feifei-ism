# 演示的出口：Marp 和 PPTX

用 Markdown 写幻灯片，或者要交 PPTX，走这里。HTML 幻灯片照旧用 `templates/` 的模板，不在这里。

- **Marp**：`build.mjs` 从 token 生成主题 `out/theme-feifei.css`，用它把 `deck.md` 转成网页、PDF 和每页一张 PNG。
- **PPTX 两种做法，各出一页同样的样张，比一比**：
  - PptxGenJS：按 token 定一个母版「FEIFEI」：宣纸做背景，标题和正文两个占位符，右上角页码。
  - dom-to-pptx（钉死 2.1.2）：先按 token 写一页 HTML（`out/dom-slide.html`），在无头 Chrome 里把它转成 PPTX。

画布 1920×1080，安全边距 96px，标题 56px，正文 28px，最小 22px，行高 1.6，每页一个字，最后一页右下角是「你的名字 记」和主色方印。这些尺寸都从 token 读（`SlideW`、`SlideH`、`SlideSafe`、`SlideTitle`、`SlideBody`、`SlideMin`、`SlideLh`），方印读 `SealSize`、`SealChar`、`SealRotate`。

方印的边长不直接用 `SealSize`：2.3rem 是按网页正文 16.5px 定的，放到 1920 宽的幻灯片上只有 37px，太小。这里按正文放大的倍数一起放大：2.3rem × 28 ÷ 16.5 ≈ 62px，印上的字正好 22px，等于最小字号。

token 里没有、只属于这个出口的两个数留在 `slide.json`：

- `SignW` 0.62：字的图占版心宽度的比例。这是排版上的选择，别的栈用不上。
- `SealPad` 0.087：方印内边距占边长的比例，照 `templates/page.html` 里 `.seal` 的 0.2rem ÷ 2.3rem 算的。token 里加上它以后就可以删。

## 重新生成

```bash
cd feifei-ism/stacks/slides && npm install && node build.mjs
```

`npm install` 只在第一次要。需要本机装着 Google Chrome（路径不一样时设 `CHROME_PATH`），和一个带 Pillow、NumPy 的 Python（默认找 `~/.feifei-ism-venv/bin/python`，别的位置设 `FEIFEI_PY`）。字体从 Google Fonts 在线取，所以要联网。

## 写自己的幻灯片

复制 `deck.md` 改内容。每页一个 `![字的意思](assets/字.png)`，图会被放到右下角；封面加 `<!-- _class: cover -->`，图居中；最后一页加 `<!-- _class: end -->` 和样张里那段方印。列表写 `1.`，出来是小号等宽的 01、02。`{{qian}}` 和 `{{date}}` 会被换成签号和日期。新的字照 `prep.py` 的写法用 `sprite.py` 的 `tint` 按签上色，存成 PNG。

## 文件

| 文件 | 手写还是生成 | 干什么 |
|---|---|---|
| `build.mjs` | 手写 | 全部流程：备图、写主题、跑 Marp、出两份 PPTX、出预览 |
| `prep.py` | 手写 | 宣纸转 JPEG；用 `scripts/sprite.py` 的 `tint` 把字按主色和墨色上色，存成透明 PNG |
| `slide.json` | 手写 | token 里没有的两个比例：字宽、方印内边距 |
| `deck.md` | 手写 | 样板 Marp 稿，四页 |
| `out/theme-feifei.css` | 生成 | Marp 主题 |
| `out/deck.md`、`deck.html`、`deck.pdf` | 生成 | 填好签号日期的稿子、网页、PDF |
| `out/pptxgenjs.pptx` | 生成 | PptxGenJS 样张 |
| `out/dom-slide.html`、`out/dom-to-pptx.pptx` | 生成 | dom-to-pptx 的来源网页和样张 |
| `out/assets/` | 生成 | 宣纸 JPEG、三张上好色的字 |
| `out/preview/` | 生成 | `deck.00N.png` 每页预览；`dom-slide-html.png` 来源网页截图；`*.pptx.png` 两份 PPTX 的预览 |

## 两种 PPTX 比一比

| | PptxGenJS 母版 | dom-to-pptx 转网页 |
|---|---|---|
| 能不能接着改 | 好改。有真母版：新建一页就带宣纸、标题和正文占位符、页码字段 | 能改字，但每样东西都是绝对定位的独立文本框和图片；没有母版和占位符，新加的页是白的；页码是写死的「1」 |
| 宣纸 | 放在母版背景里，选不中，挪不动；130 KB JPEG | 是这页上的一张图片，能被误选误挪；被重新编码成 2.7 MB 的 PNG |
| 字（笔触图） | 透明 PNG 原样放进去 | 一样保留，也被重新编码 |
| 字体 | 只写字体名，不嵌入；对方电脑没装站酷小薇、思源宋体、JetBrains Mono 就会换成别的字体。PPTX 也没有回退栈，只能写第一个字体 | 自动把三种字体嵌进文件，但文件因此有 9.2 MB |
| 文件大小 | 572 KB | 9,239 KB |
| 版式准不准 | 坐标照 token 算，和网页版逐项对上 | 按浏览器量出的位置摆，和来源网页几乎一样；字距、行距也带过去了 |

结论：要给人接着改、要做很多页，用 PptxGenJS 母版；只是把一页现成的网页原样搬进 PPTX、对方可能没装字体时，用 dom-to-pptx。两种都只能保留贴图做的质感（宣纸、笔触字），标题仍是平的字，不是厚颜料字。

## 跑过、验过的

- `node build.mjs` 在一台 Mac 上跑通，所有文件都生成了。
- Marp 四页预览 PNG 逐页看过：宣纸铺满，标题是站酷小薇、正文是思源宋体、题记和页码是 JetBrains Mono，每页一个字、只有一处主色，最后一页的字是墨色，主色给了方印。
- 改成从 token 读尺寸以后重跑，七张预览和改之前逐像素比过：前三页、来源网页、两份 PPTX 完全一样；只有第四页的方印由 96px 变成 62px。
- PDF 有 4 页，里面嵌了 JetBrains Mono、站酷小薇、思源宋体的子集。
- 两份 PPTX 拆开查了：PptxGenJS 的版式里有宣纸背景、title 和 body 占位符、页码字段；dom-to-pptx 的是五个独立对象，嵌了三种字体。
- 两份 PPTX 用 macOS 自带的快速查看（`qlmanage`）渲染成了 PNG，在 `out/preview/`。本机没装 LibreOffice。

## 没验到的

- 没在 PowerPoint 和 Keynote 里打开过。快速查看不读嵌入字体，也没有装这几种字体，所以两张 PPTX 预览里的字都是系统宋体，不是真实效果。
- dom-to-pptx 嵌入的字体在 PowerPoint 里能不能用上，没验。
- `deck.html` 的字体从 Google Fonts 在线取，断网打开会换成系统字体，没试。
- 只在一台 Mac 上跑过；别的系统没试。
- 跑了四次，有一次卡在 Marp 出网页那一步四分钟不动，停掉重跑就好了，原因没查到。卡住时先停掉再跑一遍。
- PDF 里思源宋体的名字写的是 ExtraLight，这是可变字体默认那一档的名字；预览图上看是常规粗细，没有逐字量过。
