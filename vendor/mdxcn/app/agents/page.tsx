import type { Metadata } from "next"

import { CopyBlock } from "@/components/docs/install"
import { SkillInstall } from "@/components/docs/skill-install"
import {
  GraphCheck,
  GraphCompare,
  GraphFlow,
  GraphTree,
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
  ProseP,
  proseMutedClass,
  TextLink,
} from "@/components/site/prose"
import { components } from "@/lib/docs/catalog"
import { COMARK_URL } from "@/lib/docs/comark"
import { KNAP_URL } from "@/lib/docs/knap"
import { skillExamples } from "@/lib/docs/skill"
import { agentsJsonLd, pageMeta } from "@/lib/seo"
import { AGENTS_DESCRIPTION } from "@/lib/site"
import { cn } from "@/lib/utils"

const tries = skillExamples.filter((item) =>
  ["Refactor", "Comark", "Knap", "README"].includes(item.label)
)

const kit = [
  {
    name: "skill",
    detail:
      "Tells the agent when a figure helps, which graph fits, and which format the file needs: JSX, a ::graph-* block, a graph_* filter or the plain-text figure. The same two files work in Cursor, Claude Code, Codex and OpenCode.",
  },
  {
    name: "recipes",
    detail:
      "Complete write-ups with real data. The agent copies one, swaps in its own labels, and keeps to two graphs with prose in between.",
  },
  {
    name: "comark",
    detail:
      "::graph-* blocks with YAML props, for apps that render plain Markdown with Comark instead of MDX.",
  },
  {
    name: "knap",
    detail:
      "graph_* filters that turn data into the plain-text figure inside a Knap template, or into a ::graph-* block for Comark.",
  },
  {
    name: "text figures",
    detail:
      "Code blocks that look the same in GitHub, Linear and pull request comments. The agent edits the labels and leaves the frame alone.",
  },
  {
    name: "llms.txt",
    detail:
      "The graph guide and every format in a single file, for agents that don't have the skill installed.",
  },
]

export const metadata: Metadata = pageMeta({
  title: "for agents",
  description: AGENTS_DESCRIPTION,
  path: "/agents",
})

function AgentsPipeline() {
  return (
    <PipelineFigure
      label="agent loop: pick a graph for the write-up, emit it, then edit the labels in the file"
      stages={[
        {
          id: "write",
          name: "write",
          nodes: [
            { label: "refactor", hint: "path" },
            { label: "incident", hint: "night" },
            { label: "pr", hint: "diff" },
            { label: "readme", hint: "fence" },
          ],
        },
        {
          id: "choose",
          name: "choose",
          fanIn: true,
          nodes: [
            { label: "skill.md", hint: "chooser" },
            { label: "llms.txt", hint: "ascii + yaml" },
          ],
        },
        {
          id: "emit",
          name: "emit",
          nodes: [
            { label: "jsx", hint: "mdx" },
            { label: "::graph-*", hint: "comark" },
            { label: "graph_*", hint: "knap" },
            { label: "ascii", hint: "github" },
          ],
        },
        {
          id: "read",
          name: "read",
          fanIn: true,
          nodes: [
            {
              label: "edit the labels",
              hint: "the figure is still characters in the file",
              accent: true,
              wide: true,
            },
          ],
        },
      ]}
      title="loop"
    />
  )
}

export default function AgentsPage() {
  return (
    <main id="main">
      <JsonLd data={agentsJsonLd()} />
      <LandingHero
        actions={[
          { href: "#install", label: "install the skill" },
          { href: "/llms.txt", label: "fetch llms.txt" },
        ]}
        figure={<AgentsPipeline />}
        item="all"
        lead={
          <>
            When a write-up needs a figure, the skill tells your agent which
            graph to use and how to write it for the file at hand: JSX in MDX, a{" "}
            <InlineCode>::graph-*</InlineCode> block in a{" "}
            <TextLink href={COMARK_URL}>Comark</TextLink> app, a{" "}
            <InlineCode>graph_*</InlineCode> filter in{" "}
            <TextLink href={KNAP_URL}>Knap</TextLink>, or a plain-text figure in
            a README, pull request or Linear note.
          </>
        }
        title="write a figure your agent can edit"
      />

      <LandingSection
        lead={
          <ProseP>
            When writing, the agent adds at most two graphs, each next to the
            point it supports. When it comes back later, the figure is still
            plain text in the file, so it can read the labels and values
            directly instead of squinting at a screenshot.
          </ProseP>
        }
        muted="GitHub, Linear and READMEs don't run Comark, so they get the plain-text figure."
        title="writing and reading the same figure"
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
              { label: "Edit the labels", values: [true, true, true, true] },
            ]}
            title="host"
          />
          <GraphFlow
            rows={[
              {
                nodes: [
                  { label: "write-up" },
                  { label: "chooser" },
                  { label: "JSX / YAML / filter", tone: "accent" },
                ],
              },
              {
                nodes: [
                  { label: "open the file" },
                  { label: "read the frame" },
                  { label: "edit labels", tone: "accent" },
                ],
              },
            ]}
            title="loop"
          />
        </div>
      </LandingSection>

      <LandingSection
        lead={
          <ProseP>
            There are {components.length} graphs, and most have a plain-text
            version for places that can&apos;t run React. Here&apos;s what the
            agent gets to work with.
          </ProseP>
        }
        title="what goes in the agent's folder"
      >
        <dl className="grid gap-6 sm:grid-cols-2 sm:gap-8">
          {kit.map((entry) => (
            <div className="flex flex-col gap-2" key={entry.name}>
              <dt className="font-medium">{entry.name}</dt>
              <dd className={cn(proseMutedClass, "max-w-[40ch]")}>
                {entry.detail}
              </dd>
            </div>
          ))}
        </dl>
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
          <GraphTree
            nodes={[
              {
                label: "skills/mdxcn",
                accent: true,
                children: [
                  { label: "SKILL.md", meta: "chooser" },
                  { label: "recipes.md", meta: "jsx" },
                ],
              },
              {
                label: "fetch",
                children: [
                  { label: "/llms.txt", meta: "ascii + yaml" },
                  { label: "/docs/examples", meta: "write-ups" },
                ],
              },
            ]}
            title="kit"
          />
          <GraphCheck
            items={[
              { label: "at most two graphs", done: true },
              { label: "prose between them", done: true },
              { label: "official fence, not homemade", done: true },
              { label: "no svg", done: true },
            ]}
            title="rules"
          />
        </div>
      </LandingSection>

      <LandingSection
        id="install"
        lead={
          <ProseP>
            A project copy is committed with the repo; a personal copy stays on
            your machine. If your site runs React,{" "}
            <TextLink href="/docs/installation">
              install the components
            </TextLink>{" "}
            first, since the graphs have to be in the project to render.
          </ProseP>
        }
        muted={
          <>
            The full skill file and the graph guide are on the{" "}
            <TextLink href="/docs/skill">skill</TextLink> page.
          </>
        }
        title="install the skill"
      >
        <SkillInstall />
      </LandingSection>

      <LandingSection
        lead={
          <ProseP>
            After installing, paste one of these prompts. A good result uses two
            graphs, with prose in between.
          </ProseP>
        }
        title="try a prompt"
      >
        <div className="flex flex-col gap-6">
          {tries.map((item) => (
            <CopyBlock
              key={item.label}
              label={`${item.label} · ${item.hint}`}
              value={item.prompt}
            />
          ))}
        </div>
        <LandingLinks
          items={[
            { href: "/docs/skill", label: "all prompts" },
            { href: "/docs/examples", label: "examples" },
            { href: "/docs", label: "library" },
            { href: "/comark", label: "comark" },
            { href: "/knap", label: "knap" },
          ]}
        />
      </LandingSection>
    </main>
  )
}
