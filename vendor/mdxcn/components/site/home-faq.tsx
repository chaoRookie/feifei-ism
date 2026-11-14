"use client"

import { useState, type ReactNode } from "react"
import { Accordion } from "@base-ui/react/accordion"
import { Add01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { CopyButton } from "@/components/docs/copy-button"
import { FrameBox } from "@/components/site/corners"
import { SiteContainer } from "@/components/site/container"
import {
  InlineCode,
  ProseMuted,
  ProseP,
  TextLink,
} from "@/components/site/prose"
import { HOME_INSTALL } from "@/lib/agent/copy"
import { COMARK_URL } from "@/lib/docs/comark"
import { KNAP_URL } from "@/lib/docs/knap"
import { GITHUB_URL } from "@/lib/github"
import { cn } from "@/lib/utils"

type FaqItem = {
  id: string
  title: string
  content: ReactNode
}

const faqItems: FaqItem[] = [
  {
    id: "what",
    title: "what is mdxcn?",
    content: (
      <ProseP>
        A set of React components for docs and write-ups: callouts, steps,
        timelines, tables and small charts. They&apos;re drawn with text
        characters, so they sit naturally between paragraphs and still make
        sense as plain text. Each one has a screen-reader summary and uses your
        theme&apos;s colors.
      </ProseP>
    ),
  },
  {
    id: "formats",
    title: "where can i use them?",
    content: (
      <ProseP>
        Anywhere MDX or JSX renders, use the React component. In READMEs, issues
        and pull requests, paste the plain-text version from the .md tab. If
        your Markdown goes through <TextLink href={COMARK_URL}>Comark</TextLink>
        , write <InlineCode>::graph-*</InlineCode> blocks; with{" "}
        <TextLink href={KNAP_URL}>Knap</TextLink>, use the{" "}
        <InlineCode>graph_*</InlineCode> filters.
      </ProseP>
    ),
  },
  {
    id: "install",
    title: "how do i install a graph?",
    content: (
      <>
        <div className="flex items-start gap-2">
          <pre className="min-w-0 flex-1 font-mono text-sm wrap-anywhere whitespace-pre-wrap text-muted-foreground sm:graph-scroll-x sm:whitespace-pre">
            <code>{HOME_INSTALL}</code>
          </pre>
          <CopyButton label="copy install command" text={HOME_INSTALL} />
        </div>
        <ProseMuted>
          That command installs everything. For a single component, use its
          name, like <InlineCode>@mdxcn/graph-table</InlineCode>. The shadcn CLI
          copies the source into your project, so the files are yours to edit
          and there&apos;s no package to keep updated. The source is also{" "}
          <TextLink href={GITHUB_URL}>on GitHub</TextLink>.
        </ProseMuted>
      </>
    ),
  },
  {
    id: "agents",
    title: "how do agents know which graph to use?",
    content: (
      <ProseP>
        Install the <TextLink href="/docs/skill">agent skill</TextLink>. It
        tells the agent which graph suits the content, gives it a tested example
        to start from, and picks the right format for the file it&apos;s
        editing. Without the skill,{" "}
        <TextLink href="/llms.txt">/llms.txt</TextLink> has the same guide and
        examples.
      </ProseP>
    ),
  },
  {
    id: "read",
    title: "can agents edit the result later?",
    content: (
      <ProseP>
        Yes. Labels, values and structure stay in the file as JSX, YAML or plain
        text, so an agent can read and change them directly. There&apos;s no
        image or generated SVG to reverse-engineer.
      </ProseP>
    ),
  },
  {
    id: "api",
    title: "is there an api?",
    content: (
      <ProseP>
        Yes. The full catalog is JSON at{" "}
        <TextLink href="/api/v1/components">/api/v1/components</TextLink>, with
        an <TextLink href="/openapi.json">OpenAPI schema</TextLink> and a{" "}
        <TextLink href="/developers">developer guide</TextLink>.
      </ProseP>
    ),
  },
]

const defaultFaqId = faqItems[0]?.id ?? "what"

function HomeFaq() {
  const [open, setOpen] = useState(defaultFaqId)

  return (
    <section>
      <SiteContainer className="flex flex-col gap-8">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-semibold tracking-tight text-balance">
              questions
            </h2>
            <ProseMuted>
              Short answers on installing, where the figures work, and how
              agents use them. The <TextLink href="/docs">library</TextLink>{" "}
              lists every component.
            </ProseMuted>
          </div>

          <FrameBox className="min-w-0">
            <Accordion.Root
              className="flex min-w-0 flex-col"
              onValueChange={(next) => {
                if (next[0]) {
                  setOpen(next[0])
                }
              }}
              value={[open]}
            >
              {faqItems.map((item, index) => (
                <Accordion.Item
                  className={cn(
                    index > 0 && "border-t border-dashed border-graph-frame"
                  )}
                  key={item.id}
                  value={item.id}
                >
                  <Accordion.Header>
                    <Accordion.Trigger
                      className={cn(
                        "relative flex w-full items-center justify-between gap-4 px-4 py-4 text-left sm:px-5",
                        "text-muted-foreground hover:text-foreground",
                        "data-panel-open:text-foreground",
                        "focus-visible:ring-1 focus-visible:ring-ring/50 focus-visible:outline-none",
                        "data-panel-open:[&_svg]:rotate-45"
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className="absolute top-1/2 left-1/2 size-[max(100%,2.75rem)] -translate-1/2 pointer-fine:hidden"
                      />
                      <span className="min-w-0 font-medium text-pretty">
                        {item.title}
                      </span>
                      <HugeiconsIcon
                        className="size-4 shrink-0 text-graph-muted transition-transform duration-200 ease-out"
                        icon={Add01Icon}
                        size={16}
                        strokeWidth={1.5}
                      />
                    </Accordion.Trigger>
                  </Accordion.Header>
                  <Accordion.Panel
                    className={cn(
                      "h-[var(--accordion-panel-height)] overflow-hidden",
                      "transition-[height] duration-200 ease-out",
                      "data-ending-style:h-0 data-starting-style:h-0"
                    )}
                  >
                    <div className="flex flex-col gap-3 px-4 pb-5 sm:px-5">
                      {item.content}
                    </div>
                  </Accordion.Panel>
                </Accordion.Item>
              ))}
            </Accordion.Root>
          </FrameBox>
        </div>
      </SiteContainer>
    </section>
  )
}

export { HomeFaq }
