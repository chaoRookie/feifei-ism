# 文档出口

一份 Markdown，用 Pandoc 转出三样：网页、Word、PDF。颜色、字体、字号、纸张（`DocPageW`、`DocPageH`、`DocMargin`、`DocBody`、`DocLh`）和方印（`SealSize`、`SealRotate`、`SealChar`）都从 `tokens/out/tokens.flat.json` 读，不手抄。

脚本里还剩几处数，token 里没有对应项：rem 换算用的根字号 16px（浏览器默认值），方印内边距是边长的 0.09；另有排版用的倍数，比如段距是正文的 1.5 倍、标题上方空正文的 3 倍、标题行高 1.15 到 1.4、引文行高 1.7，网页纸纹的平铺尺寸 768px 和 1181px 照 `templates/page.html`。

## 重做一遍

```bash
cd feifei-ism/stacks/docs && python3 build.py
```

换签：加 `--sign Jia`（甲乙丙丁……的拼音）。换文件：`build.py 别的.md`。第一次用先 `npm install`（`PUPPETEER_SKIP_DOWNLOAD=1`，PDF 用本机的 Chrome）。要联网：网页和 PDF 的字体从 Google Fonts 拉。

## 文件

| 文件 | 干嘛的 | 能不能手改 |
|---|---|---|
| `gen_theme.py` | 从 token 生成主题 | 源文件 |
| `build.py` | 生成主题，再出三样和两张预览图 | 源文件 |
| `template.html` | Pandoc 网页模板：题记、一个字、标题、正文、页脚方印 | 源文件，里面没有数值 |
| `num.lua` | 把正文里的数字套上 JetBrains Mono | 源文件 |
| `sample.md` | 样张 | 源文件 |
| `theme/` | `web.css`、`print.css`、`reference.docx`、`meta.yaml`、`paper/` | 生成的，别手改 |
| `out/` | `sample.html`、`sample.docx`、`sample.pdf`、`sample.paged.html`、两张 PNG | 生成的，别手改 |

## 实际跑过、核过的

- `build.py` 跑通：pagedjs-cli 出了两页 A4 PDF，页边 25mm，宣纸铺满每页，第 2 页右下有页码，文末有落款和主色方印。
- PDF 里的字是嵌进去的子集（JetBrains Mono、站酷小薇看得到名字，思源宋体嵌成 Type3），文字能复制出来。
- 网页截图 `out/sample-web.png`：纸纹、标题约三倍正文、正文灰、数字等宽、表格只有表头下一条细线、方印。
- Word：解开 `sample.docx` 查过，样式字体和颜色都是 token 的值，标题不加粗，加粗的句子改成了墨色不加粗，页面背景是宣纸图，文末有方印（两行两格主色底）。用 QuickLook 看过第一页：版式对，没显示纸纹，字体是替代字。

## 没能核的

- 在真的 Word 里打开是什么样：本机没装 Word。纸纹用的是 Word 的「页面背景图片」，Word 默认只在屏幕上显示、打印不带；Pages、WPS 认不认不知道。
- Word 里的字体没嵌进去，本机也没装这三种字体，别人打开会用替代字（宋体之类）。
- Word 里的列表还是 Pandoc 自带的编号样式，没改成小号序号。
