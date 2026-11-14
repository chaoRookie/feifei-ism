import { GITHUB_URL, GITHUB_REPO } from "@/lib/github"
import {
  SHADCN_LABS_GROUPS,
  SHADCN_LABS_URL,
  SHADCN_LABS_X,
  SHADCN_UI_URL,
  SHADCN_URL,
} from "@/lib/shadcn-labs"
import { SITE_AUTHOR, SITE_EMAIL, SITE_URL } from "@/lib/site"

export const HOME_WHAT =
  "mdxcn is a set of figures drawn with text, for people and agents to put in their writing. In an MDX file you write Markdown inside a component tag and get a live React component. In a README, a pull request or Linear, you paste the same figure as a code block. The shadcn CLI copies the components into your app, so there's no npm package."

export const HOME_WRITE =
  "When an agent is writing a refactor, an incident, a tradeoff, or a PR, it can put at most two graphs next to the prose. MDX gets markdown children inside the tag. A Comark app gets a ::graph-* block. A Knap template gets a graph_* filter that emits the official fence. A README, GitHub comment, Linear note, or any file that cannot run a renderer gets the official fenced ASCII from /llms.txt. It should not invent SVG, Mermaid, or homemade ASCII."

export const HOME_READ =
  "Because the figure is plain text in the file, opening the MDX later shows the labels and values, and an agent can edit it the same way it wrote it."

export const HOME_INSTALL = `pnpm dlx shadcn@latest add ${SITE_URL}/r/all.json`

export const HOME_NEXT =
  "Then copy the skill from /skill.md, or fetch /llms.txt if the skill is not installed. The catalog is /docs, Comark wiring is /docs/comark, Knap wiring is /docs/knap, and OpenAPI is /openapi.json."

export const HOME_API =
  "The JSON catalog is at /api/v1/components, OpenAPI at /openapi.json, and the developer portal at /developers. Every API response includes RateLimit-* headers (1000 GET requests per hour)."

export const HOME_CLI =
  "Install graphs with the shadcn CLI. One command copies the source into your project; there's no npm package."

export const HOME_BRAND = `${SITE_URL.replace("https://", "")} is the canonical site; the GitHub repo is ${GITHUB_REPO}. Search for mdxcn for docs, the API, and the agent skill.`

export function homeMarkdown(origin = SITE_URL) {
  const host = origin || SITE_URL

  return `# mdxcn

${HOME_WHAT}

${HOME_WRITE}

## write

Install the skill into the folder the agent already reads. Ask for a write-up. The chooser picks the graph. Copy the markdown children from the docs or a recipe, then swap the labels. Paste the fence when the host cannot render MDX.

## read

${HOME_READ}

## Install

${HOME_INSTALL}

${HOME_NEXT}

${HOME_API}

${HOME_CLI}

${HOME_BRAND}

## Links

- developer api: ${host}/developers
- OpenAPI: ${host}/openapi.json
- JSON catalog: ${host}/api/v1/components
- for agents: ${host}/agents
- Comark: ${host}/comark
- Knap: ${host}/knap
- agents.md: ${host}/agents.md
- Docs: ${host}/docs
- Examples: ${host}/docs/examples
- Skill: ${host}/docs/skill
- llms.txt: ${host}/llms.txt
- Sitemap: ${host}/sitemap.xml
`
}

export const ABOUT_PARAS = [
  `mdxcn is a set of MDX components that draw figures with text. ${SITE_AUTHOR.name} started it, and it's now part of Shadcn Labs. You install it with the shadcn CLI, which copies the source into your app, so there's no npm package to depend on. The code is on GitHub under the MIT license.`,
  "Every graph sits in a dashed frame with its title on the top edge, and uses a single accent color unless you ask for more. Most graphs also have a plain-text version for READMEs, GitHub, Linear and pull request comments. Comark apps can render the same figures from ::graph-* blocks in a plain .md file, and Knap templates can generate either format from data.",
  `${SITE_URL.replace("https://", "")} hosts the docs, the shadcn registry and the agent skill. The skill tells an agent which graph belongs next to its writing and what to write for each kind of file: Markdown inside the tag in MDX, a ::graph-* block in Comark, a graph_* filter in Knap, or the plain-text figure in a README.`,
  `The source is at ${GITHUB_URL}. Questions go to ${SITE_EMAIL}.`,
  "The Shadcn Labs announcement is at /shadcn-labs.",
] as const

export const LABS_INSTALL = `pnpm dlx shadcn@latest add ${SITE_URL}/r/all.json`

export const LABS_ANNOUNCEMENT = [
  "mdxcn is now part of Shadcn Labs.",
  "Shadcn Labs is an open-source group building registries, templates and tools for the shadcn/ui ecosystem. Nothing changes for you: mdxcn.dev and the @mdxcn registry keep working exactly as before.",
  "Shadcn Labs isn't affiliated with or endorsed by shadcn.",
] as const

export const CONTACT_PARAS = [
  `The best way to reach ${SITE_AUTHOR.name} is email: ${SITE_EMAIL}. Write about the library, the site, the registry, or anything else to do with mdxcn.`,
  `Bugs and pull requests go to ${GITHUB_URL}/issues. The repository is public and MIT licensed.`,
  `${SITE_AUTHOR.name} is also on X at ${SITE_AUTHOR.x}.`,
  "This is a one-person project, so there's no support desk and no guaranteed response time. If a graph renders wrong, open an issue with the component name and the props you passed. Questions about the skill or the registry are often answered on /docs/skill or in /openapi.json. Please don't send secrets by email.",
] as const

export const DEVELOPERS_PARAS = [
  "mdxcn has a read-only JSON API for agents and integrations. Version 1 lives under /api/v1/ and needs no API key. Every response includes RateLimit-* headers, and the limit is 1,000 GET requests an hour. Errors come back as RFC 9457 application/problem+json, with a code, a description and links to recover.",
  "Start at /api/v1 for the list of endpoints. /api/v1/health is there for uptime checks, and /api/v1/components returns every graph with its props. The OpenAPI 3.1 spec is at /openapi.json, and an RFC 9727 API catalog is at /.well-known/api-catalog.",
  `The API describes the components; the shadcn CLI installs them: pnpm dlx shadcn@latest add ${SITE_URL}/r/all.json. There's no npm package.`,
  "For agents, /agents and /agents.md explain how agents write and read the figures, /skill.md is the skill file, and /llms.txt has the graph guide with every format. Comark setup is at /docs/comark, Knap setup at /docs/knap, and the deprecation policy at /developers/deprecation.",
] as const

export const DEPRECATION_PARAS = [
  "Version 1 of the mdxcn API is stable under /api/v1/. Breaking changes will ship as /api/v2/, announced at least six months ahead on this page and in the OpenAPI description.",
  "When an endpoint or field is deprecated, its responses may include Deprecation: true and Sunset: <HTTP-date> headers. After the sunset date, the route returns 410 Gone with an application/problem+json body.",
  "The shadcn registry files under /r/ are versioned with the site. A registry item is never removed without a documented replacement in the OpenAPI changelog.",
  `To hear about API and registry changes, watch releases on ${GITHUB_REPO}. If you run a private integration that depends on the API, email ${SITE_EMAIL} so you get a heads-up.`,
] as const

export const PRIVACY_PARAS = [
  "mdxcn has no accounts, logins or user profiles. Copying a graph into your repo doesn't send anything to us.",
  "The site runs on Vercel, and Vercel Analytics counts page views. There are no ads, and visitor data isn't sold.",
  `The header shows the public GitHub star count for ${GITHUB_REPO}. The server fetches it from api.github.com, so your browser never contacts GitHub for it.`,
  `Email to ${SITE_EMAIL} is regular email, so please don't send secrets. The registry files under /r/ and the skill files are public.`,
  "If this policy changes, this page is updated. There's no company behind mdxcn beyond the author named on /about.",
] as const

export function developersMarkdown(origin = SITE_URL) {
  const host = origin || SITE_URL

  return `# mdxcn developer api

${DEVELOPERS_PARAS.join("\n\n")}

## Endpoints

- API index: ${host}/api/v1
- Health: ${host}/api/v1/health
- Catalog: ${host}/api/v1/components
- OpenAPI: ${host}/openapi.json
- Deprecation: ${host}/developers/deprecation
`
}

export function deprecationMarkdown(origin = SITE_URL) {
  return `# mdxcn API deprecation

${DEPRECATION_PARAS.join("\n\n")}

- developer api: ${origin}/developers
- OpenAPI: ${origin}/openapi.json
`
}

export function aboutMarkdown(origin = SITE_URL) {
  return `# about mdxcn

${ABOUT_PARAS.join("\n\n")}

## Also

- contact: ${origin}/contact
- privacy: ${origin}/privacy
- Source: ${GITHUB_URL}
`
}

export function contactMarkdown(origin = SITE_URL) {
  return `# contact mdxcn

${CONTACT_PARAS.join("\n\n")}

- about: ${origin}/about
- privacy: ${origin}/privacy
`
}

export function labsMarkdown(origin = SITE_URL) {
  const projects = SHADCN_LABS_GROUPS.map((group) => {
    const lines = group.projects
      .map((project) => `- [${project.name}](${project.href})`)
      .join("\n")

    return `### ${group.label}\n\n${lines}`
  }).join("\n\n")

  return `# shadcn labs

${LABS_ANNOUNCEMENT.join("\n\n")}

${LABS_INSTALL}

- Shadcn Labs: ${SHADCN_LABS_URL}
- X: ${SHADCN_LABS_X}
- shadcn/ui: ${SHADCN_UI_URL}
- shadcn: ${SHADCN_URL}
- About: ${origin}/about
- Source: ${GITHUB_URL}

## projects

${projects}
`
}

export function privacyMarkdown(origin = SITE_URL) {
  return `# privacy · mdxcn

${PRIVACY_PARAS.join("\n\n")}

- about: ${origin}/about
- contact: ${origin}/contact
`
}

export function copyLength(paras: readonly string[]) {
  return paras.join(" ").length
}
