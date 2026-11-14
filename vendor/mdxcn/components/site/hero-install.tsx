"use client"

import { useState } from "react"

import { CopyButton } from "@/components/docs/copy-button"
import { SegmentedTabs } from "@/components/docs/segmented-tabs"
import { FrameBox } from "@/components/site/corners"
import { REGISTRY_SCOPE } from "@/lib/site"
import { cn } from "@/lib/utils"

const RUNNERS = {
  pnpm: "pnpm dlx",
  npm: "npx",
  bun: "bunx --bun",
} as const

type Runner = keyof typeof RUNNERS

const RUNNER_TABS = Object.keys(RUNNERS).map(
  (id) => [id as Runner, id] as const
)

function HeroInstall({
  item,
  className,
}: {
  item: string
  className?: string
}) {
  const [runner, setRunner] = useState<Runner>("pnpm")
  const command = `${RUNNERS[runner]} shadcn@latest add ${REGISTRY_SCOPE}/${item}`

  return (
    <FrameBox className={cn("min-w-0 text-left", className)}>
      <div className="flex items-center justify-between gap-2 border-b border-dashed border-graph-frame px-2 py-1.5">
        <SegmentedTabs
          label="Package manager"
          onValueChange={setRunner}
          tabClassName="font-mono text-sm"
          tabs={RUNNER_TABS}
          value={runner}
        />
        <CopyButton label="Copy install command" text={command} />
      </div>
      <pre className="px-4 py-3 font-mono text-sm wrap-anywhere whitespace-pre-wrap text-muted-foreground">
        <code>{command}</code>
      </pre>
    </FrameBox>
  )
}

export { HeroInstall }
