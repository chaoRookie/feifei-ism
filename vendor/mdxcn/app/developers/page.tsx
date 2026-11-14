import type { Metadata } from "next"

import { GraphCheck, GraphKpi, GraphSpec } from "@/components/graphs"
import { JsonLd } from "@/components/seo/json-ld"
import {
  LandingHero,
  LandingLinks,
  LandingSection,
} from "@/components/site/landing"
import { PipelineFigure } from "@/components/site/pipeline-figure"
import {
  InlineCode,
  ProseP,
  proseMutedClass,
  TextLink,
} from "@/components/site/prose"
import { DEVELOPERS_PARAS } from "@/lib/agent/copy"
import { developersJsonLd, pageMeta } from "@/lib/seo"
import { cn } from "@/lib/utils"

const description =
  "The mdxcn developer API: a read-only JSON catalog of every component, with an OpenAPI spec, rate limits and install paths."

export const metadata: Metadata = pageMeta({
  title: "mdxcn api",
  description,
  path: "/developers",
})

const endpoints = [
  {
    name: "index",
    detail: (
      <>
        Start at <TextLink href="/api/v1">/api/v1</TextLink> for the list of
        endpoints. <TextLink href="/api/v1/health">/api/v1/health</TextLink> is
        there for uptime checks.
      </>
    ),
  },
  {
    name: "catalog",
    detail: (
      <>
        Every graph, with its props and examples, is at{" "}
        <TextLink href="/api/v1/components">/api/v1/components</TextLink>. The
        OpenAPI 3.1 spec is at{" "}
        <TextLink href="/openapi.json">/openapi.json</TextLink>.
      </>
    ),
  },
  {
    name: "agents",
    detail: (
      <>
        <TextLink href="/llms.txt">/llms.txt</TextLink> has the graph guide and
        every format in one file, and{" "}
        <TextLink href="/agents.md">/agents.md</TextLink> explains how agents
        write and read the figures.
      </>
    ),
  },
]

function DevelopersPipeline() {
  return (
    <PipelineFigure
      label="read-only json catalog: fetch an endpoint, get json or a problem document"
      stages={[
        {
          id: "get",
          name: "get",
          nodes: [
            { label: "/api/v1", hint: "index" },
            { label: "/components", hint: "catalog" },
            { label: "/openapi.json", hint: "openapi 3.1" },
            { label: "/llms.txt", hint: "chooser" },
          ],
        },
        {
          id: "return",
          name: "return",
          fanIn: true,
          nodes: [
            { label: "json", hint: "no api keys" },
            { label: "problem+json", hint: "rfc 9457" },
          ],
        },
        {
          id: "use",
          name: "use",
          fanIn: true,
          nodes: [
            {
              label: "json catalog",
              hint: "agents and integrators",
              accent: true,
              wide: true,
            },
          ],
        },
      ]}
      title="api"
    />
  )
}

export default function DevelopersPage() {
  return (
    <main id="main">
      <JsonLd data={developersJsonLd()} />
      <LandingHero
        actions={[
          { href: "/openapi.json", label: "openapi" },
          { href: "/api/v1/components", label: "json catalog" },
        ]}
        figure={<DevelopersPipeline />}
        item="all"
        lead={
          <>
            A read-only JSON API for agents and integrations. Version 1 lives
            under <InlineCode>/api/v1/</InlineCode>, needs no API key, and
            allows 1,000 GET requests an hour. Errors come back as RFC 9457{" "}
            <InlineCode>application/problem+json</InlineCode>.
          </>
        }
        title="a json catalog for agents"
      />

      <LandingSection
        lead={<ProseP>{DEVELOPERS_PARAS[1]}</ProseP>}
        title="what you can fetch"
      >
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
          <GraphSpec
            rows={[
              { label: "/api/v1", value: "index", accent: true },
              { label: "/api/v1/health", value: "health" },
              { label: "/api/v1/components", value: "catalog" },
              { label: "/openapi.json", value: "openapi 3.1" },
              { label: "/llms.txt", value: "chooser + ascii" },
              { label: "/.well-known/api-catalog", value: "rfc 9727" },
            ]}
            title="fetch"
          />
          <div className="flex flex-col gap-8">
            <GraphKpi
              data={[4, 5, 6, 8, 7, 9, 11, 10, 12, 14, 13, 16]}
              hint="1000 / hr"
              label="get requests"
              title="rate"
              value="1,000"
            />
            <GraphCheck
              items={[
                { label: "no api keys", done: true },
                { label: "RateLimit-* headers", done: true },
                { label: "rfc 9457 errors", done: true },
                {
                  label: "breaking changes as /api/v2/",
                  note: "six months notice",
                },
              ]}
              title="contract"
            />
          </div>
        </div>
        <dl className="grid gap-6 sm:grid-cols-3 sm:gap-8">
          {endpoints.map((entry) => (
            <div className="flex flex-col gap-2" key={entry.name}>
              <dt className="font-medium">{entry.name}</dt>
              <dd className={cn(proseMutedClass, "max-w-[40ch]")}>
                {entry.detail}
              </dd>
            </div>
          ))}
        </dl>
      </LandingSection>

      <LandingSection
        lead={
          <ProseP>
            The API describes the components; the shadcn CLI installs them.
            There&apos;s no npm package, so the source lands in your repo.
          </ProseP>
        }
        title="copy the source"
      >
        <GraphSpec
          rows={[
            { label: "cli", value: "/r/all.json", accent: true },
            { label: "skill", value: "/skill.md" },
            { label: "deprecation", value: "/developers/deprecation" },
            { label: "comark", value: "/docs/comark" },
            { label: "knap", value: "/docs/knap" },
          ]}
          title="paths"
        />
        <LandingLinks
          items={[
            { href: "/developers/deprecation", label: "deprecation policy" },
            { href: "/agents", label: "for agents" },
            { href: "/llms.txt", label: "llms.txt" },
            { href: "/openapi.json", label: "openapi" },
          ]}
        />
      </LandingSection>
    </main>
  )
}
