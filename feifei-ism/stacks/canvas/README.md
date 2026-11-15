# 画布出口

肥肥主义的画布出口（宪法 §7 技术栈表「画布」一行）：一块铺满屏幕的宣纸白板，能用两种笔画线，能放、能拖、能改文字卡片。卡片是真的网页元素，浏览器支持 HTML-in-Canvas 时，用 `drawElementImage` 画进画布，纸纹从卡片底下透上来；不支持时退回普通网页，卡片叠在画布上面。

## 一条命令重做

```bash
cd feifei-ism/stacks/canvas && npm install && npm run build
```

`build.py` 把 `board.src.html` 拼成单文件 `board.html`，`test.mjs` 在无头 Chrome 里把两条路各走一遍，出预览图和 `out/test-result.json`。

`board.html` 能直接当 claude.ai Artifact 发：一个文件，素材全部内联成 data URI，脚本只从 jsdelivr 拿 Rough.js 4.6.6，没有 `fetch`。字体和 `page.html` 一样走 Google Fonts 的样式表。

## 文件

| 文件 | 干什么 |
|---|---|
| `board.src.html` | 白板源文件 |
| `board.html` | 构建出的单文件页面（0.47 MB） |
| `test.mjs` | 两条路各测一遍：画歪线、画毛笔、放卡片并打字、点卡片里的「肥肥主义」、拖卡片、读画布像素、截图；再用 390 宽测一次手机 |
| `out/preview_auto.png` | HTML-in-Canvas 这条路的预览 |
| `out/preview_fallback.png` | 退路的预览（网址带 `#fallback` 强制走退路） |
| `out/preview_auto_save.png` | HTML-in-Canvas 这条路上按「存图」后弹出的图 |
| `out/preview_fallback_save.png` | 退路上按「存图」后弹出的图 |
| `out/preview_mobile.png` | 390×844 手机宽度 |
| `out/test-result.json` | 测试结果 |

## 页面里有什么

- **底面**：画布就是整页最底下那一层。宣纸由画布自己画：用 `xuan_fiber`、`xuan_cloud` 两张贴图做 `createPattern`，正片叠底铺一次。不靠 CSS 的 `url()`。
- **笔**：歪线用 Rough.js（`curve`，每一笔有固定种子，重画不变形）；毛笔用 `motion.js` 里的 `FF.hair`（36 根笔毛，收笔散成飞白）。一屏两种质地，正好是 §3.5 的上限。线全用墨色。
- **卡片**：凹凸靠深浅，用 `--s-raised`，不加影子；边缘按种子撕成毛边。HTML-in-Canvas 这条路上，卡片画进画布后再叠一层纸纹，纸纹和底面对齐。卡片里的字能选、能改，读屏能读到。
- **「肥肥主义」按钮**：甲套 `k1 p`，是这一屏唯一的主色。点一下从十二支签里抽一支，`--c` 跟着换，题记的签号也换。所以这一屏不放方印（§7.3）。
- **工具栏**：歪线、毛笔、卡片用乙套（几个里选一个）；擦净用丁套，墨迹往右擦掉，时长 `--t-exit`；存图用己套印头，每按一次盖一次「存」。
- **存图**：Artifact 页面不许下载（data:、blob: 链接和脚本存文件都被拦），所以不走下载。按「存图」把整块白板转成一张 PNG，放进页面里的浮层：右键图片「存储图像」，手机上长按保存。浮层用 `--s-overlay` 加 `--shadow-overlay`，底下垫 `--scrim`（下面暂时不能操作），抹开时长 `--t-smear-s`；「收起」按钮、Esc、点浮层外面都能关，关了焦点回到原处。HTML-in-Canvas 这条路直接拿画布像素；退路的卡片不在画布里，存图时按卡片的位置、字体、字色把卡片和字另画进去（按钮画成主色块）。
- **检测**：`canvas.content === 'drawable'`，并且有 `drawElementImage` 和 `requestPaint`，就走新接口；有 `layoutSubtree` 和 `drawElement` 就走旧接口；都没有就退回。退路下卡片挪进画布上面的一层 `div`，用 `transform` 定位，毛边改用 `clip-path`。

## 用到的 HTML-in-Canvas 接口（2026-11-14 读的）

- 画布写 `content="drawable"`，子元素写 `drawable`。
- 用 `canvas.onpaint` 重画，用 `canvas.requestPaint()` 要下一帧；`ctx.drawElementImage(元素, dx, dy, dw, dh)` 的目标坐标是画布网格像素；2D 画布画的时候自动更新元素的位置，点击落在画出来的地方。
- 检测：设 `content` 为 `drawable`，再看 `canvas.content` 读回来是不是 `'drawable'`。
- 出处：WICG 说明 <https://github.com/WICG/html-in-canvas>；Chrome 文档 <https://developer.chrome.com/docs/web-platform/html-in-canvas/concepts>（写明 Chrome 157 起正式提供）。旧名 `layoutsubtree` 和 `drawElement` 这两份文档都没提，代码里只按「方法在不在」认。

## 跑过验证的

| 项 | HTML-in-Canvas（自动） | 退路（`#fallback`） |
|---|---|---|
| Chrome 版本 | 157.0.8103.52，无头 | 同左 |
| 检测结果 | `canvas.content` 是 `drawable`，`drawElementImage`、`requestPaint` 都有，没有旧接口 | 同一个浏览器，强制退路 |
| 画歪线、画毛笔 | 成 | 成 |
| 放卡片再打字 | 成，字进了新卡片 | 成 |
| 点「肥肥主义」 | 点在画进画布的按钮上，主色从丁签换成别的签 | 成 |
| 拖卡片 | 从 (179,368) 拖到 (259,418) | 同左 |
| 画布像素里有卡片 | 正文区深色像素 6558 个，按钮区主色像素 17418 个 | 0 和 0（卡片是网页，不在画布像素里） |
| 导出 PNG（`toDataURL`） | 不报安全错误 | 不报 |
| 按「存图」 | 浮层出现，图 2560×1600，卡 1 正文区深色像素 6558 个，焦点在「收起」，收起后浮层隐藏 | 浮层出现，图 2560×1600，卡 1 正文区深色像素 6409 个（卡片另画进图里），收起正常 |
| 报错 | 无 | 无 |

手机 390 宽：走 HTML-in-Canvas，没有横向滚动。

另外两个实测发现：

- **`url()` 图片**：在 Chrome 157 上，`data:` 开头的 `url()` 背景、`mask` 和 `<img>` 都画进了画布；用 `file://` 引的外部图片（相对路径的 `url(g.png)`）画不出来。跨源的 `url()` 不画，符合 WICG 的说明。所以甲套按钮的颜料块（`build.py` 已经内联成 data URI）在画布里是完整的。纸纹仍然由画布自己画，因为宪法 §5.5 要求材质只铺最底一层。
- **无头 Chrome 的像素比**：两倍像素时，`devicePixelContentBoxSize` 报的仍是 CSS 像素，画布只有一倍清晰度，卡片字发虚。现在取它和 `clientWidth × devicePixelRatio` 里大的那个。

## 没能验证的

- 没在 claude.ai 里真发成 Artifact 试过。Artifact 页面的源是不是会让 data URI 的画法有变化，没测。
- 只测了 Chrome 157。Safari、Firefox 应该走退路，没实际打开过；旧接口 `layoutsubtree` 加 `drawElement` 那一段没有能跑它的浏览器，没测过。
- 真触屏和手写笔没试，只用鼠标事件模拟过。
- 读屏软件没开过，只确认了卡片是真的 DOM、有 `aria-label` 和 `aria-live`。
- 存图浮层没在 claude.ai 的 Artifact 里真点过，右键「存储图像」和手机长按保存也没实际操作过，只验证了浮层里的 `<img>` 是一张非空的 PNG。
- 退路存出来的图里，卡片是重画的：换行按字宽自己算，和网页上的折行可能差一两个字；按钮是平涂的主色块，没有颜料笔触。
- p5.brush 没用，原因见下一节。

## 和宪法不一样的地方

- §5.1 说画布透明、放在纸上。这里画布就是纸，因为整页只有这一块白板，宣纸由画布画一次，body 只用 `--paper` 平涂当退路。
- §5.5 说材质不贴在卡片上，§7 又说画布里的卡片要「加纸纹」。这里的做法是：卡片画进最底那一层以后，叠的是和底面同一张、对齐的纸纹，算同一层材质透上来，不是另贴一张。退路上的卡片不加纸纹。
- §7 说笔用 Rough.js、p5.brush。这里只用了 Rough.js，毛笔用的是 `motion.js` 自带的 `FF.hair`：p5.brush 要先加载整个 p5（约 1 MB）和 WebGL，在单文件 Artifact 里太重；`FF.hair` 本来就是宪法 §8.1「写」的那支笔。
- 宣纸贴图的尺寸（768、1181）照抄 `page.html` 的 `background-size`，它们不是 token。
