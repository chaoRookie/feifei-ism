# 图的出口：matplotlib 样式表和拉笔图表

用 Python 出数据图走这里。两样东西：

- `feifei.mplstyle`：matplotlib 样式表，颜色、字体、字号全部由 `gen_style.py` 从 `tokens/out/tokens.flat.json` 生成，不手改。透明底、不加粗、去掉上右边框，文字墨色分三档。
- `brushbar.py`：拉笔横条图（宪法 §7.5）。条从零开始，一张图共用一个量程，准确数字用 JetBrains Mono 写在行尾，只有最大值那一条用主色，其余是墨；条是 `assets/strokes/st0~st5` 的真实刮刀笔触沿条拉长，染成墨或主色。图下配一张原始表（数字右对齐、等宽字），最后一行写单位、出处和签号。

## 重新生成

```bash
cd feifei-ism/stacks/chart && python3 sample.py
```

这一条会先跑 `gen_style.py`（写样式表，缺字体时下载），再出样图。只要样式表、不下字体：`python gen_style.py --no-fonts`。

需要装好 matplotlib、Pillow、NumPy 的 Python。第一次要联网下字体（fonts.googleapis.com、fonts.gstatic.com）；手上有字体文件时设 `FEIFEI_FONT_DIR=放 ttf 的目录`，会改成从那里拷。

## 在自己的脚本里用

```python
import sys; sys.path.insert(0, '.../stacks/chart')
from brushbar import chart, on_paper
fig = chart(标签列表, 数值列表, title='标题', unit='单位', source='出处', name='表头', mark='第乙签')
fig.savefig('图.png')
on_paper('图.png', '图_纸上.png')
```

`chart(..., strokes=False)` 出平涂条，讲解类作品要读准时用（宪法 §7.7）。只要样式不要拉笔：先 `from brushbar import use; use()`，再照常画。

## 文件

| 文件 | 手写还是生成 | 干什么 |
|---|---|---|
| `gen_style.py` | 手写 | 读 token，写样式表，取字体 |
| `brushbar.py` | 手写 | 拉笔条、原始表、贴到纸上 |
| `sample.py`、`sample.json` | 手写 | 样图和它的数据 |
| `feifei.mplstyle` | 生成 | 样式表 |
| `fonts/` | 生成，不进 git | 站酷小薇、思源宋体、Cormorant Garamond 斜体、JetBrains Mono 的 ttf |
| `out/sample.png` | 生成 | 透明底拉笔图，2560×1440 |
| `out/sample_on_paper.png` | 生成 | 同一张图叠在 `xuan_sheet.webp` 上 |
| `out/sample_flat.png`、`out/sample_flat_on_paper.png` | 生成 | 平涂对照版 |

## 跑过、验过的

- `sample.py` 跑通，四个字体从 Google Fonts 下到 `fonts/`，四张图都出来了，肉眼看过纸上那两张。
- 透明底：`sample.png` 角上像素是 alpha 0。
- 比例：平涂版逐条量了像素长度，每 KB 0.157 到 0.159 像素，一致；拉笔版按「这一列颜料盖住条高一半以上」量，三条较长的条每 KB 0.156 到 0.159 像素，和平涂版差 2% 以内。
- 颜色：平涂版取样，墨条正好是 Ink `#211c1c`，最大那条正好是主色 C `#4b1f96`。
- 样图数据是真的：`stacks/slides/out` 里四个出口文件 2026-11-14 的大小，除以 1024 取整。

## 没验到的

- 只在一台 Mac 上跑过，别的系统没试。
- 很小的值（不到最大值的 1%）笔触只剩一小条，像个括号，读数要看行尾的数字。
- 多系列图（主色加墨实心、斜线、空框三种纹理，宪法 §5.1）样式表表达不了，`brushbar` 也只做单系列。
