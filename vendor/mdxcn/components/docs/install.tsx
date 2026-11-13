"use client"

import { useLayoutEffect, useRef, useState } from "react"

import { CopyMark, useCopied } from "@/components/docs/copy-button"
import { MonoLabel } from "@/components/docs/mono-label"
import { SegmentedTabs } from "@/components/docs/segmented-tabs"
import { FrameBox } from "@/components/site/corners"
import { HitArea } from "@/components/site/hit-area"
import { InlineCode, ProseP, TextLink } from "@/components/site/prose"
import { useAccent } from "@/hooks/use-accent"
import { useOrigin } from "@/lib/docs/origin"
import { accentCss } from "@/lib/accent"
import type { ComponentDoc } from "@/lib/docs/catalog"
import { graphUtilitiesCss, registryFiles } from "@/lib/docs/files"
import { mdxExample } from "@/lib/docs/ascii"
import { comarkExample, COMARK_URL } from "@/lib/docs/comark"
import { knapExample, KNAP_URL } from "@/lib/docs/knap"
import { agentPrompt } from "@/lib/docs/prompt"
import { GITHUB_TREE, GITHUB_URL } from "@/lib/github"
import { scopedRegistryInstall } from "@/lib/site"
import { addQueryParams } from "@/lib/url"
import { UTM_PARAMS } from "@/lib/site"

type InstallTab =
  "cli" | "mdx" | "manual" | "agent" | "markdown" | "comark" | "knap"

const COLLAPSED_HEIGHT = 256

type InstallCommandProps = {
  name: string
  doc?: Pick<
    ComponentDoc,
    | "title"
    | "name"
    | "description"
    | "dependencies"
    | "props"
    | "when"
    | "not"
    | "mdx"
  >
  /** MDX for the first example. Shown on the MDX tab and in the agent prompt. */
  example?: string
}

function InstallCommand({ name, doc, example }: InstallCommandProps) {
  const [tab, setTab] = useState<InstallTab>("cli")
  const origin = useOrigin()
  const prompt = agentPrompt({ origin, registry: name, doc, example })
  const ascii = mdxExample(name)
  const comark = comarkExample(name)
  const knap = knapExample(name)
  const tabs: [InstallTab, string][] = [["cli", "cli"]]

  if (doc) {
    tabs.push(["mdx", "mdx"])
  }

  tabs.push(["manual", "manual"], ["agent", "agent"])

  if (ascii) {
    tabs.push(["markdown", "markdown"])
  }

  if (comark) {
    tabs.push(["comark", "comark"])
  }

  if (knap) {
    tabs.push(["knap", "knap"])
  }

  return (
    <div className="flex flex-col gap-4">
      <SegmentedTabs
        label="install method"
        onValueChange={setTab}
        tabs={tabs}
        value={tab}
      />
      {tab === "cli" ? (
        <CliInstall name={name} />
      ) : tab === "mdx" && doc ? (
        <MdxInstall doc={doc} example={example} name={name} />
      ) : tab === "manual" ? (
        <ManualInstall name={name} />
      ) : tab === "markdown" && ascii ? (
        <MarkdownInstall markdown={ascii.markdown} />
      ) : tab === "comark" && comark ? (
        <ComarkInstall markdown={comark.markdown} />
      ) : tab === "knap" && knap ? (
        <KnapInstall
          data={JSON.stringify(knap.variables, null, 2)}
          markdown={knap.markdown}
          template={knap.template}
        />
      ) : (
        <CopyBlock label="prompt" value={prompt} />
      )}
    </div>
  )
}

function CliInstall({ name }: { name: string }) {
  return <Command label="command" value={scopedRegistryInstall(name)} />
}

function fileUrl(file: string) {
  if (file.endsWith(".ts") || file.endsWith(".tsx")) {
    return `${GITHUB_URL}/blob/main/${file}`
  }

  return `${GITHUB_TREE}/${file}`
}

function ManualInstall({ name }: { name: string }) {
  const accent = useAccent()
  const files = registryFiles[name] ?? registryFiles["graph-table"]
  const css = `${accentCss(accent.id)}\n\n${graphUtilitiesCss}`
  const source = files[files.length - 1] ?? "registry/default"

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-pretty text-muted-foreground">
          Install <code className="font-mono">motion</code>, add the CSS to your
          global stylesheet, then copy these files from the repo.
        </p>
        <Command label="dependency" value="pnpm add motion" />
      </div>

      <CopyBlock label="css" value={css} />

      <div className="flex flex-col gap-2">
        <MonoLabel>files</MonoLabel>
        <ul
          className="flex flex-col gap-1 font-mono text-muted-foreground"
          role="list"
        >
          {files.map((file) => (
            <li key={file}>
              <a
                className="hover:text-foreground hover:underline"
                href={addQueryParams(fileUrl(file), UTM_PARAMS)}
                rel="noreferrer"
              >
                {file}
              </a>
            </li>
          ))}
        </ul>
        <p>
          <a
            className="text-foreground underline-offset-4 hover:underline"
            href={addQueryParams(fileUrl(source), UTM_PARAMS)}
            rel="noreferrer"
          >
            open on github
          </a>
        </p>
      </div>
    </div>
  )
}

function mdxExports(doc: NonNullable<InstallCommandProps["doc"]>) {
  const names = new Set<string>([doc.name])
  for (const match of (doc.mdx ?? "").matchAll(/<([A-Z][A-Za-z]*)/g)) {
    if (match[1]) {
      names.add(match[1])
    }
  }
  return [...names]
}

function MdxInstall({
  doc,
  example,
  name,
}: {
  doc: NonNullable<InstallCommandProps["doc"]>
  example?: string
  name: string
}) {
  const names = mdxExports(doc)
  const register = `// mdx-components.tsx
import type { MDXComponents } from "mdx/types"
import { ${names.join(", ")} } from "@/registry/default/${name}/${name}"

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return { ...components, ${names.join(", ")} }
}`

  return (
    <div className="flex flex-col gap-6">
      <ProseP>
        Register the component once in{" "}
        <InlineCode>mdx-components.tsx</InlineCode>
        {names.length > 1 ? (
          <>
            , along with <InlineCode>{names.slice(1).join(", ")}</InlineCode>
          </>
        ) : null}
        . Lists and tables inside the tag don&apos;t need imports of their own.
        For Notion or a README, paste the .md tab from the example instead.
      </ProseP>
      <CopyBlock label="mdx-components.tsx" value={register} />
      {example ? <CopyBlock label="page.mdx" value={example} /> : null}
    </div>
  )
}

function MarkdownInstall({ markdown }: { markdown: string }) {
  return (
    <div className="flex flex-col gap-6">
      <ProseP>
        Paste this code block anywhere that can&apos;t import the component: a
        README, a GitHub or Linear comment, a pull request, or a plain{" "}
        <InlineCode>.md</InlineCode> file. The code block&apos;s monospace font
        keeps the frame lined up. Edit the labels and values, but keep the frame
        as it is.
      </ProseP>
      <CopyBlock label="markdown" value={markdown} />
    </div>
  )
}

function ComarkInstall({ markdown }: { markdown: string }) {
  return (
    <div className="flex flex-col gap-6">
      <ProseP>
        Paste this into a <InlineCode>.md</InlineCode> file rendered by a{" "}
        <TextLink href={COMARK_URL}>Comark</TextLink> app. The YAML props are
        the same as the React props. GitHub and Linear don&apos;t run comark, so
        they still need the code block from the .md tab. Setup is covered in{" "}
        <TextLink href="/docs/comark">/docs/comark</TextLink>.
      </ProseP>
      <CopyBlock label="comark" value={markdown} />
    </div>
  )
}

function KnapInstall({
  data,
  markdown,
  template,
}: {
  data: string
  markdown: string
  template: string
}) {
  return (
    <div className="flex flex-col gap-6">
      <ProseP>
        Pass your data through a <TextLink href={KNAP_URL}>Knap</TextLink>{" "}
        filter and it prints the plain-text figure, or a{" "}
        <InlineCode>::graph-*</InlineCode> block for graphs that have no text
        version. Register <InlineCode>graphFilters</InlineCode> as shown in{" "}
        <TextLink href="/docs/knap">/docs/knap</TextLink>; the knap CLI
        doesn&apos;t load them on its own.
      </ProseP>
      <CopyBlock label="template" value={template} />
      <CopyBlock label="data" value={data} />
      <CopyBlock label="markdown" value={markdown} />
    </div>
  )
}

function CopyToggle({
  label,
  onClick,
}: {
  label: string
  onClick: () => void
}) {
  return (
    <div className="flex justify-center site-rail py-2">
      <button
        className="relative w-full px-2 py-1 font-mono tracking-wide text-muted-foreground hover:text-foreground"
        onClick={onClick}
        type="button"
      >
        <HitArea />
        {label}
      </button>
    </div>
  )
}

function CopyBlock({ label, value }: { label: string; value: string }) {
  const { copied, copy } = useCopied()
  const [open, setOpen] = useState(false)
  const [full, setFull] = useState(0)
  const preRef = useRef<HTMLPreElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const likelyLong = value.length > 400 || value.split("\n").length > 8
  const overflows = full > COLLAPSED_HEIGHT
  const collapsed = !open && (overflows || (full === 0 && likelyLong))
  const maxHeight = collapsed ? COLLAPSED_HEIGHT : full || undefined

  useLayoutEffect(() => {
    const el = preRef.current
    if (!el) {
      return
    }

    const measure = () => setFull(el.scrollHeight)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [value])

  function collapse() {
    setOpen(false)
    boxRef.current?.scrollIntoView({ block: "nearest" })
  }

  return (
    <div className="flex min-w-0 flex-col gap-2" ref={boxRef}>
      <MonoLabel>{label}</MonoLabel>
      <FrameBox className="min-w-0" tone="rail">
        <button
          aria-label={copied ? "Copied" : `Copy ${label}`}
          className="w-full min-w-0 text-left hover:bg-muted/40"
          onClick={() => copy(value)}
          type="button"
        >
          <div
            className="graph-motion overflow-hidden transition-[max-height] duration-300 ease-out-cubic"
            style={{ maxHeight }}
          >
            <pre
              className="scrollbar-graph max-h-72 overflow-auto p-4 pr-12 text-pretty whitespace-pre-wrap text-muted-foreground"
              ref={preRef}
            >
              <code>{value}</code>
            </pre>
          </div>
        </button>
        <span className="pointer-events-none absolute top-2 right-2 z-20 text-muted-foreground">
          <CopyMark copied={copied} />
        </span>
        {collapsed ? (
          <CopyToggle label="show all" onClick={() => setOpen(true)} />
        ) : null}
        {open && (overflows || likelyLong) ? (
          <CopyToggle label="show less" onClick={collapse} />
        ) : null}
      </FrameBox>
    </div>
  )
}

function Command({ label, value }: { label: string; value: string }) {
  const { copied, copy } = useCopied()

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <MonoLabel>{label}</MonoLabel>
      <FrameBox
        aria-label={copied ? "Copied" : `Copy ${label} command`}
        as="button"
        className="flex w-full min-w-0 items-center gap-2 px-3 py-2 text-left text-muted-foreground hover:bg-muted/40"
        onClick={() => copy(value)}
        tone="rail"
        type="button"
      >
        <pre className="min-w-0 flex-1 wrap-anywhere whitespace-pre-wrap text-muted-foreground sm:graph-scroll-x sm:whitespace-pre">
          <code>{value}</code>
        </pre>
        <CopyMark copied={copied} />
      </FrameBox>
    </div>
  )
}

export { Command, CopyBlock, InstallCommand, ManualInstall }
