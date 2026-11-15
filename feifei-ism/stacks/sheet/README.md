# 表格出口

用 openpyxl 从 `tokens/out/tokens.flat.json` 生成一套命名样式，存进 Excel 底板，再用底板填一张样表。正文字号读 `DocBody`，标题等字号按 token 比例从它推出，方印边长和字读 `SealSize`、`SealChar`。

token 里没有、留在脚本里的数：根字号 16px，纸色铺的范围 26 列和 120 行，各行行高、列宽的倍数。Excel 的单元格不能旋转方印，`SealRotate` 没用上。

## 重做一遍

```bash
cd feifei-ism/stacks/sheet && python3 gen_sheet.py
```

换签：加 `--sign Jia`。

## 文件

| 文件 | 干嘛的 | 能不能手改 |
|---|---|---|
| `gen_sheet.py` | 生成样式、底板和样表 | 源文件 |
| `out/feifei-template.xlsx` | 底板 | 生成的，别手改 |
| `out/feifei-template.xltx` | 同一份底板，存成 Excel 模板格式 | 生成的，别手改 |
| `out/sample.xlsx` | 用底板填好的样表 | 生成的，别手改 |

命名样式都以 `ff_` 开头，在 Excel「单元格样式」里能选：`ff_title` 大标题、`ff_tiji` 题记、`ff_header` 表头、`ff_body` 正文、`ff_number` 数字（等宽、靠右）、`ff_percent`、`ff_accent` 一张表唯一的主色数、`ff_group` 合计行、`ff_note` 小注、`ff_seal` 方印。

## 打开是什么样

整张表铺米黄的纸色，没有网格线。左上一行小号等宽的题记，写着第几签；下面一个很大的站酷小薇标题，再一行灰色副标题。表头是灰色小字，下面一条细线；正文是灰色宋体，数字是等宽字靠右。整张表只有童书「在架 9」是主色，下面还压一笔主色粗线，不看颜色也认得出。合计行底色深一级。右下角是落款和两行两格的主色方印。工作簿主题色和主题字体也换成了这一套。

## 实际跑过、核过的

- `gen_sheet.py` 跑通，三个文件都能用 openpyxl 读回，命名样式 21 个都在，单元格的字体、颜色、数字格式核过。
- `.xltx` 的内容类型确实是模板。
- 用 QuickLook 看过样表：纸色、标题、细线、主色那一格、方印都对。

## 没能核的

- 在真的 Excel 里打开：本机没装 Excel。公式没有缓存值，QuickLook 里合计和归还率显示成 0；已设打开时重算，Excel 打开应该算出来，没实测。
- 字体没嵌进去，本机也没装这三种字体，打开会用替代字。
- 纸色铺在前 26 列（整列的列格式，前 120 行每格也填了），再往右是 Excel 的白底。宣纸纹理图没铺：Excel 的工作表背景图 openpyxl 写不了，打印也不带。
