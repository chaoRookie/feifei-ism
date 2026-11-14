export const MDX_DESCRIPTION =
  "Wrap your MDX components in withMdxcn. Graphs keep working when your docs framework replaces standard tags, GitHub alerts become Callouts, a quote with a byline becomes a Quote, console code blocks become Terminals, and footnotes get a frame."

export const MDX_WIRE = `// mdx-components.tsx
import type { MDXComponents } from "mdx/types"
import { withMdxcn } from "@/registry/default/mdx/mdx"
import { GraphTimeline } from "@/registry/default/graph-timeline/graph-timeline"

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return withMdxcn({ ...components, GraphTimeline })
}`

export const MDX_OPTIONS = `withMdxcn(components, {
  alerts: true, // > [!WARNING] → Callout
  quotes: true, // > … — Name → Quote
  terminals: true, // \`\`\`console → Terminal
  footnotes: true, // [^1] → Footnotes
})`

export const MDX_OVERRIDE = `// Fumadocs, Nextra, or your own map
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return withMdxcn({
    ...defaultMdxComponents, // swaps table, pre, h1–h6
    li: ListItem,
    ...components,
    GraphTimeline,
  })
}`

export const MDX_BEFORE = `> [!WARNING]
> The CLI copies files. Edit the source.

> Less, but better.
> — Dieter Rams

\`\`\`console
$ pnpm dlx shadcn@latest add @mdxcn/mdx
✓ 7 files written
\`\`\`

Glyphs, not SVG.[^1]

[^1]: SVG does not survive a README.`

export const MDX_WHY = `Most docs frameworks replace standard tags with their own components, like li with ListItem or table with Table. Graphs read their content by tag name, so a replaced li looks like an unknown component and the list comes out empty. withMdxcn labels each replacement so graphs still recognize the original tag. It also works with React Server Components, because the label is passed as a data-graph-host prop.`
