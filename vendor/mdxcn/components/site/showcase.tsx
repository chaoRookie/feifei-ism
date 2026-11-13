"use client"

import { useState, type ReactNode } from "react"

import { CopyButton } from "@/components/docs/copy-button"
import { SegmentedTabs } from "@/components/docs/segmented-tabs"
import { FrameBox } from "@/components/site/corners"
import { SiteContainer } from "@/components/site/container"
import {
  GraphCheck,
  GraphCompare,
  GraphKpi,
  GraphMatrix,
  GraphSheet,
  GraphStat,
  GraphTable,
  GraphTimeline,
  GraphWaterfall,
} from "@/components/graphs"
import {
  getShowcaseItem,
  showcaseCount,
  showcaseLayout,
  type ShowcaseItem,
} from "@/lib/site/showcase"

type ShowcaseTab = "tsx" | "markdown"

const SHOWCASE_TABS = [
  ["tsx", "tsx"],
  ["markdown", "markdown"],
] as const

const previews: Record<string, ReactNode> = {
  "graph-table": (
    <GraphTable
      align={["left", "right", "right", "right"]}
      footer={["Total", "437,141", "396", "~50m"]}
      headers={["Agent", "Tokens", "Tool calls", "Time"]}
      rows={[
        ["Inks and paper", "115,207", "120", "16m"],
        ["Overprint and drift", "135,218", "164", "16m"],
        ["Naming the patterns", "186,716", "112", "18m"],
      ]}
      title="WHAT THE RESEARCH COST"
    />
  ),
  "graph-sheet": (
    <GraphSheet
      align={["left", "left", "left"]}
      headers={["Item", "Owner", "Status"]}
      sections={[
        {
          title: "Scope",
          rows: [
            ["CLI copies files", "priya", "done"],
            ["Docs previews", "jon", "now"],
          ],
        },
        {
          title: "Out of scope",
          rows: [
            ["npm package", "—", "later"],
            ["Figma kit", "—", "later"],
          ],
        },
      ]}
      title="RFC"
    />
  ),
  "graph-check": (
    <GraphCheck
      items={[
        { label: "freeze tokens", done: true },
        { label: "ship registry json", done: true },
        { label: "write the postmortem", note: "still open" },
      ]}
      title="LAUNCH"
    />
  ),
  "graph-matrix": (
    <GraphMatrix
      accent="Pos"
      columns={["Pos", "Neg"]}
      rows={[
        { label: "Pos", values: [41, 3] },
        { label: "Neg", values: [2, 54] },
      ]}
      title="DETECT"
    />
  ),
  "graph-waterfall": (
    <GraphWaterfall
      items={[
        { label: "Revenue", value: 48 },
        { label: "Refunds", value: -6 },
        { label: "Hosting", value: -4 },
        { label: "Profit", value: 38 },
      ]}
      title="MARGIN"
    />
  ),
  "graph-timeline": (
    <GraphTimeline
      events={[
        { date: "Mar 12", label: "CLI copies the files" },
        { date: "Mar 18", label: "Docs, live previews", state: "now" },
        { date: "Apr 02", label: "Registry listed", state: "next" },
      ]}
      title="SHIPPED"
    />
  ),
  "graph-compare": (
    <GraphCompare
      columns={["Solo", "Studio"]}
      rows={[
        { label: "Registry", values: [true, true] },
        { label: "Accent picker", values: [true, true] },
        { label: "Private source", values: [false, true] },
        { label: "Price", values: ["$0", "$24"] },
      ]}
      title="PLANS"
    />
  ),
  "graph-kpi": (
    <GraphKpi
      data={[4, 5, 5, 6, 8, 7, 9, 8, 11, 10, 12, 14]}
      hint="+18%"
      label="this week"
      title="READS"
      value="12,400"
    />
  ),
  "graph-stat": (
    <GraphStat
      items={[
        { value: "12,400", label: "docs" },
        { value: "4,100", label: "copies" },
        { value: "860", label: "shipped", accent: true },
      ]}
      title="THIS WEEK"
    />
  ),
}

function ShowcaseBlock({ slug }: { slug: string }) {
  const item = getShowcaseItem(slug)
  const [tab, setTab] = useState<ShowcaseTab>("tsx")

  if (!item) {
    return null
  }

  return (
    <ShowcaseFigure
      item={item}
      preview={previews[slug]}
      tab={tab}
      setTab={setTab}
    />
  )
}

function ShowcaseFigure({
  item,
  preview,
  tab,
  setTab,
}: {
  item: ShowcaseItem
  preview: ReactNode
  tab: ShowcaseTab
  setTab: (tab: ShowcaseTab) => void
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <SegmentedTabs
        label={`${item.title} view`}
        onValueChange={setTab}
        tabClassName="text-sm"
        tabs={SHOWCASE_TABS}
        value={tab}
      />
      {tab === "tsx" ? (
        <div className="min-w-0">{preview}</div>
      ) : (
        <FrameBox className="min-w-0">
          <div className="absolute top-2 right-2 z-20">
            <CopyButton label="copy markdown" text={item.markdown} />
          </div>
          <pre className="scrollbar-graph max-h-72 overflow-auto p-4 pr-12 font-mono text-sm text-muted-foreground sm:p-6">
            <code>{item.markdown}</code>
          </pre>
        </FrameBox>
      )}
    </div>
  )
}

function ShowcaseSection() {
  return (
    <section>
      <SiteContainer className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <h2 className="max-w-[35ch] text-2xl font-semibold tracking-tight text-balance">
            one figure, two formats
          </h2>
          <p className="max-w-[56ch] leading-relaxed text-pretty text-foreground/88">
            Flip a figure between the live React component and its plain-text
            version. The text version is what you paste into a README, an issue,
            or a pull request, where MDX doesn&apos;t render. {showcaseCount}{" "}
            graphs have both.
          </p>
        </div>
        <ShowcaseBlock slug={showcaseLayout.full} />
        {showcaseLayout.pairs.map((pair) => (
          <div className="grid gap-8 lg:grid-cols-2" key={pair.join("-")}>
            {pair.map((slug) => (
              <ShowcaseBlock key={slug} slug={slug} />
            ))}
          </div>
        ))}
      </SiteContainer>
    </section>
  )
}

export { ShowcaseSection }
