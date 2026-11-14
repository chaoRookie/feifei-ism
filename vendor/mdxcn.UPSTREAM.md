# mdxcn 上游快照

| 项 | 值 |
|---|---|
| 网站 | https://www.mdxcn.dev |
| 上游仓库 | https://github.com/shadcn-labs/mdxcn |
| 提交 | 884eba5356762cf49f8828db8f861dc2f33d65e4（2026-11-11） |
| 许可 | MIT，Copyright (c) 2026 Keshav Bagaade，原文在 `mdxcn/LICENSE` |
| 取法 | `git archive HEAD` 整棵导出到 `vendor/mdxcn/`，304 个文件，一字未改 |

`vendor/mdxcn/` 里的东西都是上游原样。肥肥主义的适配另起目录做，不在这里面改，方便以后对上游做 diff 和更新。

先看这几处：

- `mdxcn/skills/mdxcn/SKILL.md`、`recipes.md`：给 agent 用的技能
- `mdxcn/registry/default/`：50 个组件目录的源码（`graph-*` 37 个，另有 callout、steps、terminal 等）
- `mdxcn/registry/default/AGENTS.md`、`mdxcn/public/r/`：shadcn 注册表产物
- `mdxcn/lib/ascii/`：字符画渲染
- `mdxcn/app/`、`mdxcn/components/`：mdxcn.dev 网站本身（Next.js）
