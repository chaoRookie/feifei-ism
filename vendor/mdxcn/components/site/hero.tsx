import Link from "next/link"
import { ArrowRight02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { MonoLabel } from "@/components/docs/mono-label"
import { GraphTimeline } from "@/components/graphs"
import { SiteContainer } from "@/components/site/container"
import { FrameBox } from "@/components/site/corners"
import { ProseLead } from "@/components/site/prose"
import { Button } from "@/components/ui/button"

const SOURCE = `<GraphTimeline title="SHIPPED">

- Mar 12: CLI copies the files
- **Mar 18: Docs, live previews**
- *Apr 02: Registry listed*

</GraphTimeline>`

function Hero() {
  return (
    <section>
      <SiteContainer
        borderTop={false}
        className="flex flex-col items-center gap-12 py-12 sm:py-16 md:gap-16 md:py-24"
      >
        <div className="flex max-w-3xl min-w-0 flex-col items-center gap-5 text-center">
          <h1 className="text-4xl font-medium tracking-tighter text-balance sm:text-5xl md:text-6xl lg:text-7xl">
            markdown-friendly components for mdx
          </h1>
          <ProseLead>
            Callouts, timelines, tables and charts, drawn with text. In MDX you
            write a Markdown list inside a tag and get a live React component.
            In a README or a pull request, you paste the same figure as a code
            block.
          </ProseLead>
          <Button
            className="mt-2 h-10 gap-2 px-4 text-sm"
            nativeButton={false}
            render={<Link href="/docs" />}
          >
            browse components
            <HugeiconsIcon icon={ArrowRight02Icon} size={16} strokeWidth={2} />
          </Button>
        </div>

        <HeroExample />
      </SiteContainer>
    </section>
  )
}

function HeroExample() {
  return (
    <div className="flex w-full max-w-4xl min-w-0 flex-col gap-4">
      <div className="grid min-w-0 gap-8 md:grid-cols-2 md:gap-6">
        <div className="flex min-w-0 flex-col gap-2">
          <MonoLabel>you write</MonoLabel>
          <FrameBox className="min-w-0 flex-1" tone="rail">
            <pre className="scrollbar-graph overflow-x-auto p-4 font-mono text-sm text-muted-foreground">
              <code>{SOURCE}</code>
            </pre>
          </FrameBox>
        </div>
        <div className="flex min-w-0 flex-col gap-2">
          <MonoLabel>readers see</MonoLabel>
          <div className="flex min-w-0 flex-1 items-center">
            <GraphTimeline title="SHIPPED">
              <ul>
                <li>Mar 12: CLI copies the files</li>
                <li>
                  <strong>Mar 18: Docs, live previews</strong>
                </li>
                <li>
                  <em>Apr 02: Registry listed</em>
                </li>
              </ul>
            </GraphTimeline>
          </div>
        </div>
      </div>
      {/* <p className="max-w-[60ch] text-sm text-pretty text-muted-foreground">
        Bold marks where you are and italics mark what comes next. Start with
        one component:
      </p>
      <HeroInstall className="w-full max-w-xl" item="graph-timeline" /> */}
    </div>
  )
}

export { Hero }
