export const SITE_HOST = "mdxcn.dev"
export const SITE_URL = `https://${SITE_HOST}`
export const REGISTRY_SCOPE = "@mdxcn"

export function scopedRegistryInstall(name: string) {
  return `pnpm dlx shadcn@latest add ${REGISTRY_SCOPE}/${name}`
}
export const SITE_NAME = "mdxcn"
export const SITE_NAME_SHORT = "mdxcn"
/** Browser / OG homepage title — what people search for. */
export const SITE_TITLE = "mdxcn: markdown-friendly components"
export const SITE_OG_IMAGE = {
  url: "/og.png",
  width: 1200,
  height: 630,
  alt: "mdxcn: markdown-friendly components for MDX",
}
export const SITE_KEYWORDS = [
  "mdxcn",
  "markdown-friendly components",
  "mdx components",
  "markdown components",
  "react mdx components",
  "markdown-friendly react components",
  "mdx callout",
  "mdx steps",
  "mdx charts",
  "ascii charts",
  "ascii diagrams",
  "markdown charts",
  "shadcn registry",
  "shadcn mdx",
  "comark",
  "knap",
  "mdxcn api",
] as const
export const SITE_DESCRIPTION =
  "React components for MDX docs, drawn with text: callouts, steps, terminals, timelines, tables and charts. Write them as plain Markdown, paste them into a README as text, and install them with the shadcn CLI."
export const SITE_ALTERNATE_NAMES = [
  "mdxcn.dev",
  "mdxcn",
  "mdx",
  "markdown-friendly components",
  "mdx components",
] as const
export const AGENTS_DESCRIPTION =
  "An agent skill that tells your agent when a figure helps, which mdxcn graph to use, and how to write it for the file at hand: MDX, a Comark block, a Knap filter or a plain-text figure it can edit later."
export const DOCS_DESCRIPTION =
  "Every mdxcn component, with live examples. Each one works in MDX as a React component and in READMEs and Notion as a plain-text figure."
export const SITE_NAV = [
  { href: "/docs", label: "components" },
  { href: "/docs/examples", label: "examples" },
  { href: "/agents", label: "agents" },
  { href: "/comark", label: "comark" },
  { href: "/knap", label: "knap" },
] as const
export const SITE_TWITTER = "@kshvbgde"
export const SITE_EMAIL = "hi@kshv.me"
export const SITE_AUTHOR = {
  name: "Keshav Bagaade",
  url: "https://github.com/keshav-exe",
  x: "https://x.com/kshvbgde",
  jobTitle: "Engineer",
}

export const UTM_PARAMS = {
  utm_source: SITE_HOST,
}
