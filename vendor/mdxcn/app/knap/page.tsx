import type { Metadata } from "next"

import { SourcePreview } from "@/components/comark/source-preview"
import {
  GraphCheck,
  GraphCompare,
  GraphTimeline,
  GraphUptime,
} from "@/components/graphs"
import { JsonLd } from "@/components/seo/json-ld"
import {
  LandingHero,
  LandingLinks,
  LandingSection,
} from "@/components/site/landing"
import { PipelineFigure } from "@/components/site/pipeline-figure"
import {
  InlineCode,
  ProseMuted,
  ProseP,
  proseMutedClass,
  TextLink,
} from "@/components/site/prose"
import {
  KNAP_API_URL,
  KNAP_DEMO_DATA,
  KNAP_DEMO_TEMPLATE,
  KNAP_DESCRIPTION,
  KNAP_REPO,
  KNAP_URL,
} from "@/lib/docs/knap"
import { pageMeta, webPageJsonLd } from "@/lib/seo"
import { cn } from "@/lib/utils"

export const metadata: Metadata = pageMeta({
  title: "knap",
  description: KNAP_DESCRIPTION,
  path: "/knap",
})

const steps = [
  {
    name: "data",
    detail: (
      <>
        Pass plain JSON, or any variables{" "}
        <TextLink href={KNAP_API_URL}>Knap</TextLink> can resolve. The filter
        reads the value with its types intact, so there&apos;s no special schema
        to learn.
      </>
    ),
  },
  {
    name: "filter",
    detail: (
      <>
        Pipe the data through <InlineCode>graph_timeline</InlineCode>,{" "}
        <InlineCode>graph_meter</InlineCode> or any other graph filter. A string
        argument sets the title, and <InlineCode>comark</InlineCode> switches
        the output to a <InlineCode>::graph-*</InlineCode> block.
      </>
    ),
  },
  {
    name: "markdown",
    detail: (
      <>
        You get the plain-text figure, identical to the .md tab in the docs,
        which reads fine in Obsidian, GitHub and READMEs. Graphs without a text
        version print Comark YAML instead.
      </>
    ),
  },
]

function KnapPipeline() {
  return (
    <PipelineFigure
      label="knap filter: props in, official fence or a ::graph-* block out"
      stages={[
        {
          id: "data",
          name: "data",
          nodes: [
            { label: "json", hint: "props object" },
            { label: "events[]", hint: "timeline" },
            { label: "days[]", hint: "uptime" },
            { label: "title", hint: "string param" },
          ],
        },
        {
          id: "filter",
          name: "filter",
          fanIn: true,
          nodes: [
            { label: "graph_timeline", hint: "createEngine" },
            { label: "graph_uptime", hint: "same api as react" },
          ],
        },
        {
          id: "emit",
          name: "emit",
          fanIn: true,
          nodes: [
            {
              label: "fenced ascii",
              hint: "readme / github / linear",
              accent: true,
            },
            {
              label: "::graph-*",
              hint: "pass comark · no ascii",
            },
          ],
        },
      ]}
      title="filter"
    />
  )
}

export default function KnapPage() {
  return (
    <main id="main">
      <JsonLd
        data={webPageJsonLd({
          name: "Knap",
          description: KNAP_DESCRIPTION,
          path: "/knap",
        })}
      />
      <LandingHero
        actions={[
          { href: "/docs/knap", label: "read the wiring" },
          { href: KNAP_URL, label: "knap.md" },
        ]}
        figure={<KnapPipeline />}
        item="graph-knap"
        lead={
          <>
            Pipe your data through a <InlineCode>graph_*</InlineCode> filter in
            a <TextLink href={KNAP_URL}>Knap</TextLink> template and the output
            Markdown contains a framed figure. The Knap CLI doesn&apos;t load
            custom filters, so you register them in your own code.
          </>
        }
        title="graphs from a knap template"
      />

      <LandingSection
        lead={
          <ProseP>
            The same incident as on the Comark page, this time written as a{" "}
            <TextLink href={KNAP_URL}>Knap</TextLink> template. Switch to Source
            to see the template that produced these figures.
          </ProseP>
        }
        title="template and the frames it produces"
      >
        <SourcePreview source={KNAP_DEMO_TEMPLATE}>
          <ProseMuted>
            Latency crossed 800ms at {KNAP_DEMO_DATA.start}, and we rolled back
            at {KNAP_DEMO_DATA.rollback}.
          </ProseMuted>
          <GraphTimeline events={[...KNAP_DEMO_DATA.events]} title="NIGHT" />
          <ProseMuted>Users noticed it on two days that week.</ProseMuted>
          <GraphUptime
            days={[...KNAP_DEMO_DATA.uptime.days]}
            from={KNAP_DEMO_DATA.uptime.from}
            title={KNAP_DEMO_DATA.uptime.title}
            to={KNAP_DEMO_DATA.uptime.to}
          />
        </SourcePreview>
      </LandingSection>

      <LandingSection
        lead={
          <ProseP>
            Templating is <TextLink href={KNAP_URL}>Knap</TextLink>&apos;s job,
            and the graphs are the ones you copied with shadcn if you also
            render React. The filters are the only new code.
          </ProseP>
        }
        title="how the pieces fit"
      >
        <dl className="grid gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
          {steps.map((entry) => (
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
            Knap generates text. It writes the plain-text figure for a README,
            or the <InlineCode>::graph-*</InlineCode> block a{" "}
            <TextLink href="/comark">Comark</TextLink> app renders. Drawing the
            live React frame is still the component&apos;s job.
          </ProseP>
        }
        title="where each format belongs"
      >
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
          <GraphCompare
            columns={["JSX", "ASCII", "Comark", "Knap"]}
            rows={[
              { label: "MDX / React", values: [true, false, true, false] },
              { label: "App .md file", values: [false, false, true, true] },
              {
                label: "README / GitHub",
                values: [false, true, false, true],
              },
              {
                label: "Data in, Markdown out",
                values: [false, false, false, true],
              },
            ]}
            title="host"
          />
          <GraphCheck
            items={[
              { label: "same props as react", done: true },
              { label: "official fence, not homemade", done: true },
              { label: "comark param → ::graph-*", done: true },
              {
                label: "cli loads graph filters",
                note: "wire createEngine",
              },
            ]}
            title="filter"
          />
        </div>
        <LandingLinks
          items={[
            { href: "/docs/knap", label: "wiring" },
            { href: "/docs/skill", label: "skill" },
            { href: KNAP_URL, label: "knap.md" },
            { href: KNAP_API_URL, label: "api" },
            { href: KNAP_REPO, label: "obsidianmd/knap" },
          ]}
        />
      </LandingSection>
    </main>
  )
}
