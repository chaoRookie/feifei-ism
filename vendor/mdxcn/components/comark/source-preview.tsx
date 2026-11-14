"use client"

import { useState, type ReactNode } from "react"

import { CopyButton } from "@/components/docs/copy-button"
import { SegmentedTabs } from "@/components/docs/segmented-tabs"
import { FrameBox } from "@/components/site/corners"

const TABS = [
  ["rendered", "Rendered"],
  ["source", "Source"],
] as const

function SourcePreview({
  source,
  children,
}: {
  source: string
  children: ReactNode
}) {
  const [tab, setTab] = useState<"rendered" | "source">("rendered")

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <SegmentedTabs
        label="Rendered or source"
        onValueChange={setTab}
        tabs={TABS}
        value={tab}
      />
      {tab === "rendered" ? (
        <div className="flex min-w-0 flex-col gap-8" role="tabpanel">
          {children}
        </div>
      ) : (
        <FrameBox className="min-w-0" role="tabpanel">
          <div className="absolute top-2 right-2 z-20">
            <CopyButton label="Copy source" text={source} />
          </div>
          <pre className="scrollbar-graph max-h-96 overflow-auto p-4 pr-12 text-muted-foreground">
            <code>{source}</code>
          </pre>
        </FrameBox>
      )}
    </div>
  )
}

export { SourcePreview }
