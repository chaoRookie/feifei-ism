import type { ReactNode } from "react"
import Link from "next/link"
import { SiteContainer } from "@/components/site/container"
import { SiteCorners, SiteRule } from "@/components/site/corners"
import { cn } from "@/lib/utils"
import { LabsDirectory, LabsLogo } from "@/components/site/labs"
import { Mark, MARK_THEME } from "@/lib/og/mark"
import { GITHUB_URL } from "@/lib/github"
import { addQueryParams } from "@/lib/url"
import { UTM_PARAMS } from "@/lib/site"
import {
  SHADCN_LABS_NOTE,
  SHADCN_LABS_URL,
  SHADCN_LABS_X,
  SHADCN_URL,
} from "@/lib/shadcn-labs"

const footerLinkClass =
  "inline-block py-1 text-muted-foreground hover:text-foreground"

const FOOTER_LINKS = [
  { href: "/developers", label: "developer api" },
  { href: "/agents", label: "for agents" },
  { href: "/comark", label: "comark" },
  { href: "/knap", label: "knap" },
  { href: "/docs", label: "docs" },
  { href: "/docs/examples", label: "examples" },
  { href: "/docs/installation", label: "installation" },
  { href: "/docs/skill", label: "skill" },
  { href: "/about", label: "about" },
  { href: SHADCN_LABS_NOTE, label: "shadcn labs" },
  { href: "/contact", label: "contact" },
  { href: "/privacy", label: "privacy" },
  { href: "/llms.txt", label: "llms.txt" },
  { href: "/openapi.json", label: "openapi" },
  { href: GITHUB_URL, label: "source", external: true },
  { href: `${GITHUB_URL}/blob/main/LICENSE`, label: "MIT", external: true },
]

function FooterBlock({
  children,
  className,
  id,
}: {
  children: ReactNode
  className?: string
  id?: string
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8 lg:py-16",
        className
      )}
      id={id}
    >
      <SiteRule className="top-0" />
      <SiteRule className="bottom-0" />
      <SiteCorners />
      {children}
    </div>
  )
}

function SiteFooter() {
  return (
    <footer>
      <SiteContainer
        className="py-0 sm:py-0"
        containerClassName="px-0 sm:px-0 lg:px-0"
        corners={[]}
      >
        <FooterBlock>
          <Link
            aria-label="Homepage"
            className="flex items-center gap-2.5 text-foreground"
            href="/"
          >
            <Mark className="size-4" palette={MARK_THEME} size={16} />
            mdxcn
          </Link>
          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-6 gap-y-1" role="list">
              {FOOTER_LINKS.map((item) => (
                <li key={item.label}>
                  {item.external ? (
                    <a
                      className={footerLinkClass}
                      href={addQueryParams(item.href, UTM_PARAMS)}
                      rel="noreferrer"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      className={footerLinkClass}
                      href={item.href}
                      prefetch={false}
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </FooterBlock>

        <FooterBlock id="shadcn-labs">
          <div className="flex flex-col gap-4">
            <a
              href={addQueryParams(SHADCN_LABS_URL, UTM_PARAMS)}
              rel="noreferrer"
              target="_blank"
            >
              <LabsLogo />
            </a>
            <p className="max-w-[62ch] text-pretty text-muted-foreground">
              mdxcn is part of Shadcn Labs.{" "}
              <Link className="text-foreground" href={SHADCN_LABS_NOTE}>
                Read the announcement
              </Link>
              .
            </p>
            <p className="text-pretty text-muted-foreground">
              Not affiliated with or endorsed by{" "}
              <a
                className="text-foreground"
                href={addQueryParams(SHADCN_URL, UTM_PARAMS)}
                rel="noreferrer"
                target="_blank"
              >
                shadcn
              </a>
              .
            </p>
          </div>
          <LabsDirectory />
        </FooterBlock>

        <FooterBlock>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-pretty text-muted-foreground">
              © {new Date().getFullYear()}{" "}
              <a
                className="text-foreground"
                href={addQueryParams(SHADCN_LABS_URL, UTM_PARAMS)}
                rel="noreferrer"
                target="_blank"
              >
                Shadcn Labs
              </a>
              . MIT license.
            </p>
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-pretty text-muted-foreground">
              <a
                className="text-foreground"
                href={addQueryParams(SHADCN_LABS_X, UTM_PARAMS)}
                rel="noreferrer"
                target="_blank"
              >
                @shadcnlabs
              </a>
              <a
                className="text-foreground"
                href={addQueryParams("https://x.com/kshvbgde", UTM_PARAMS)}
                rel="noreferrer"
                target="_blank"
              >
                @kshvbgde
              </a>
            </p>
          </div>
        </FooterBlock>
      </SiteContainer>
    </footer>
  )
}

export { SiteFooter }
