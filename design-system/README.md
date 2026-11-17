# design-system：同步到 claude.ai 的设计系统

把本仓库的肥肥主义（`feifei-ism/`）转成 claude.ai「Design System」类型要的文件，同步到 https://claude.ai/artifact/CmTs216XhqD38QTtgKPxbu 。

| 文件 | 做什么 |
|---|---|
| `build.py` | 读 `feifei-ism/tokens/feifei.tokens.json`、`references/DESIGN.md`、`templates/` 的样式和脚本，生成 `out/project/`：`tokens.json`、`tokens.css`、`README.md`、`DESIGN.md`、`components/`（bundle 和 11 个组件）、素材组说明、`design-system.json` |
| `system-readme.md` | 设计系统页面上的品牌手册正文 |
| `cover.html` | 封面 |
| `blobs.txt` | 已上传素材的对照：仓库路径、blob 编号、字节数 |
| `verify.js` | 用 Playwright 在本地渲染每个预览，截图到 `out/shots/`，报页面错误 |

## 重新同步

```bash
python3 design-system/build.py
```

```bash
node design-system/verify.js
```

然后让 agent 把 `out/project/` 下改过的文件发布到上面那个链接（Artifact 工具 `publish`，`url` 填链接，`root` 填 `design-system/out`）。`design-system.json` 放在最后一次发布里，发之前先读一遍线上的索引，保留页面上别人加的键。

- 宪法、token、按钮样式改了：重跑上面两步再发布。
- `assets/` 加了新图：先把图作为素材上传到那个链接，把返回的 blob 编号按 `路径 编号 字节数` 记进 `blobs.txt`，再重跑。
- 改品牌手册正文改 `system-readme.md`，改封面改 `cover.html`。
