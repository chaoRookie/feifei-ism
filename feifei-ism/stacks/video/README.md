# 视频出口

肥肥主义的视频出口（宪法 §7 技术栈表「动态」一行）：页面照常用 `motion.js` 写动作，在无头 Chrome 里按虚拟时钟一帧一帧截图，再用 FFmpeg 拼成 MP4。时间由脚本掌握，不跟着电脑快慢走，同一个页面录几遍都一样。

## 一条命令重做

```bash
cd feifei-ism/stacks/video && npm install && npm run build
```

`npm run build` 按顺序做三件事：`build.py` 把 `scene.src.html` 拼成单文件 `scene.html`；`record.mjs` 录 4 秒、30 帧每秒，出 MP4 和三张静帧；`check.mjs` 再录两遍，逐帧比哈希。

录别的页面：

```bash
node record.mjs 页面.html --duration 4 --fps 30 --out out/片名.mp4 --stills 0.5,3.0,3.9
```

可选参数：`--width 1920 --height 1080 --scale 2`（页面按 960×540 排版、两倍像素出 1920×1080，token 里的字号原样用）、`--frames 目录`（留下逐帧 PNG）。环境变量 `CHROME`、`FFMPEG` 可以换路径。

## 文件

| 文件 | 干什么 |
|---|---|
| `scene.src.html` | 样片源文件：宣纸底、一排人里戴帽子的那个走开（`sign_leave` 的分层母版，第庚签），标题「走开」，最后盖「肥肥主义」印 |
| `clock.js` | 注进页面的虚拟时钟：接管 `performance.now`、`Date.now`、`setTimeout`、`setInterval`、`requestAnimationFrame`；`el.animate()` 和 CSS 动画一出生就暂停，每帧按虚拟时间设 `currentTime`，到头了调 `finish()` |
| `record.mjs` | 录制：Playwright 开本机 Google Chrome，先把页面上所有字体的字都加载完，再逐帧推时钟、截图，FFmpeg 出 H.264 MP4（yuv420p、bt709） |
| `check.mjs` | 确定性检查：录两遍，和 `out/sample.frames.json` 一起比逐帧 SHA-256，有一帧不同就退出码 1 |
| `package.json` | 只依赖 `playwright-core`；`node_modules/` 不进 git |

生成的文件：

| 文件 | 是什么 |
|---|---|
| `scene.html` | 构建出的单文件页面（0.48 MB，素材已内联） |
| `out/sample.mp4` | 样片，1920×1080，30 帧每秒，120 帧，4.0 秒，无声 |
| `out/sample_0.5s.png` | 抹开进行到一半 |
| `out/sample_3.0s.png` | 印正压在纸上 |
| `out/sample_3.9s.png` | 最后一帧：字、标题、印都在 |
| `out/sample.frames.json` | 每帧哈希、Chrome 版本、字体加载情况 |

时间线全从 token 取：开头空 `--t-hover`，字抹开 `--t-smear`，标题晚 140ms（§8.3 的错开），停 `--t-limp-hold`，再盖印（980ms，`motion.js` 里的专用时长）。

## 和宪法、原计划不一样的地方

- 原计划写的是 `sign_leave.webp`。这里用的是从它拆出的分层母版（`sign_leave_ink` 加 `sign_leave_relief`）：§9.4 要求带主色的字用分层母版，这样主色跟着 `--c` 走。
- §7 说片头片尾垫一整张 `xuan_sheet.webp`，这里照做了（`background-size: cover`），没有用网页的两张贴图。
- 标题字号用 `--fs-h1` 原值，在两倍像素下是 99px，比 HTML 幻灯片规定的 56px 大。这里是片头，按 §6.1「标题放大」处理。
- 140ms 的错开和 980ms 的盖印不在 token 里，分别照 §8.3 和 `motion.js` 的专用时长。

## 跑过验证的

- Chrome 157.0.8103.52，无头模式。`ffprobe` 看过：h264、1920×1080、30/1、120 帧、4.000 秒。
- 确定性：同一个 `scene.html` 一共录了五遍（`npm run build` 里的一遍加两遍，又单独跑了一次 `check.mjs` 两遍），120 帧哈希全部相同；其中 81 帧互不相同，画面确实在动，不是静止画面碰巧一样。
- 踩到的坑已修：第一次检查碰巧通过，再跑时 120 帧全不一样。原因是 Google Fonts 的中文字体按字分包、用到才下载，截图时站酷小薇和思源宋体还没到。现在录制前按页面上的每个字把每种字体都加载一遍，四种字体的 `document.fonts.check` 都是 true。
- 盖印动画结束后会被重新认领、从头播一遍的问题已修（用 WeakSet 记住见过的动画）。
- 三张静帧都看过：抹开有真笔触的前沿，印先是印石压下、再抬起留下主色的「肥肥主义」。

## 没能验证的

- 没有放声音：片子本来就没有音轨。
- 只在一台 Mac 的 Chrome 157 上试过。换机器、换 Chrome 版本或换字体版本，像素可能不同；确定性指的是同一环境里重录不变。
- 字体走网络。断网时会退回宋体，那一遍和有网时的哈希不同。
- 宪法 §7 对视频的要求（伙伴出镜、藏彩蛋、字幕）这个 4 秒样片没做，它只是证明录制这条路走得通。
- `FF.wet` 这类改 SVG 滤镜属性的动作没在样片里录过；`FF.gsap` 的时间线走的是自己的 ticker（同样用被接管的 `requestAnimationFrame`），也没录过。
