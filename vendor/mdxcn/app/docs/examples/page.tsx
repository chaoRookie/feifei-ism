import type { Metadata } from "next"

import { RecipeList } from "@/components/docs/recipe-card"
import { DocsPageHeader } from "@/components/docs/page-header"
import { JsonLd } from "@/components/seo/json-ld"
import { Callout } from "@/components/graphs"
import { ProseLead, TextLink } from "@/components/site/prose"
import { recipes, recipeCopy } from "@/lib/docs/recipes"
import { pageMeta } from "@/lib/seo"
import { SITE_AUTHOR, SITE_NAME_SHORT, SITE_URL } from "@/lib/site"

const description =
  "Six realistic write-ups, each with two figures: a refactor plan, an incident, a tradeoff, a pull request, a weekly update and a migration."

export const metadata: Metadata = pageMeta({
  title: "examples",
  description,
  path: "/docs/examples",
})

const extra = [
  "## examples",
  "",
  ...recipes.flatMap((item) => [
    `### ${item.title}`,
    "",
    item.story,
    "",
    recipeCopy(item),
    "",
  ]),
].join("\n")

export default function ExamplesPage() {
  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "mdxcn examples",
          description,
          url: `${SITE_URL}/docs/examples`,
          author: {
            "@type": "Person",
            name: SITE_AUTHOR.name,
            url: SITE_AUTHOR.url,
          },
          isPartOf: {
            "@type": "SoftwareSourceCode",
            name: SITE_NAME_SHORT,
            url: SITE_URL,
          },
        }}
      />
      <DocsPageHeader
        copy={{
          description,
          extra,
          title: "examples",
        }}
        lead={
          <ProseLead>
            Six short write-ups, each with two figures, the way you&apos;d use
            them in a real doc. Copy any of them as MDX, or open a graph&apos;s
            own page to see all of its props.
          </ProseLead>
        }
        title="examples"
      >
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-muted-foreground">
          {recipes.map((item) => (
            <li key={item.slug}>
              <a
                className="hover:text-foreground hover:underline"
                href={`#${item.slug}`}
              >
                {item.title}
              </a>
            </li>
          ))}
        </ul>
      </DocsPageHeader>

      <Callout type="tip">
        Each figure also has a plain-text version on its .md tab. Paste that
        into Notion or a README and the drawing comes along intact.
      </Callout>

      <RecipeList />

      <p className="max-w-[56ch] text-pretty text-muted-foreground">
        Want an agent to write figures like these? Read{" "}
        <TextLink href="/agents">for agents</TextLink>, then install the{" "}
        <TextLink href="/docs/skill">skill</TextLink>. Every graph, including
        its plain-text version, is also in a single file at{" "}
        <TextLink href="/llms.txt">/llms.txt</TextLink>.
      </p>
    </div>
  )
}
