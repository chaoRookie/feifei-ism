import Link from "next/link"

import { AgentsFlowDemo } from "@/components/site/agents-flow-demo"
import { SiteContainer } from "@/components/site/container"
import {
  InlineCode,
  ProseMuted,
  ProseP,
  TextLink,
} from "@/components/site/prose"
import { COMARK_URL } from "@/lib/docs/comark"
import { KNAP_URL } from "@/lib/docs/knap"

function AgentsSection() {
  return (
    <section>
      <SiteContainer className="flex flex-col gap-8">
        <div className="grid gap-8 lg:grid-cols-[1.5fr_2fr] lg:items-start">
          <div className="flex flex-col items-start gap-6">
            <div className="flex flex-col gap-4">
              <h2 className="text-2xl font-semibold tracking-tight text-balance">
                give your agent the same library
              </h2>
              <ProseP>
                Install the skill and your agent picks a graph that fits the
                content, fills it with real values, and puts it next to the
                paragraph it supports. It writes JSX in MDX files,{" "}
                <InlineCode>::graph-*</InlineCode> blocks for{" "}
                <TextLink href={COMARK_URL}>Comark</TextLink>, and filters for{" "}
                <TextLink href={KNAP_URL}>Knap</TextLink>.
              </ProseP>
              <ProseMuted>
                In plain Markdown it pastes the same text figure the docs give
                you, rather than inventing a one-off diagram.
              </ProseMuted>
            </div>
            <Link
              className="text-foreground underline-offset-4 hover:text-foreground/80 hover:underline"
              href="/agents"
            >
              install the agent skill
            </Link>
          </div>

          <AgentsFlowDemo />
        </div>
      </SiteContainer>
    </section>
  )
}

export { AgentsSection }
