import { ArrowUpRight } from 'lucide-react'

const REPO = 'https://github.com/sergushkincom/permission-rings'
const LINKS = [
  { label: 'GitHub', href: REPO },
  { label: 'README', href: `${REPO}#readme` },
]
const link =
  'rounded-sm underline-offset-2 outline-none hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-settled'

/** Who made this and where the code is. One thin row under the page, never over it. */
export function SiteFooter() {
  return (
    <footer className="flex h-8 shrink-0 items-center justify-between gap-3 border-t border-hairline bg-canvas px-4 text-xs leading-4 text-muted-foreground sm:px-8">
      <p className="truncate max-sm:hidden">MIT licensed · Design experiment</p>
      <nav aria-label="About this project" className="flex items-center gap-3 max-sm:w-full max-sm:justify-between">
        {LINKS.map((l) => (
          <a key={l.label} href={l.href} target="_blank" rel="noreferrer" className={link}>
            {l.label}
          </a>
        ))}
        <a href="https://sergushkin.com" target="_blank" rel="noreferrer" className={`${link} flex items-center gap-0.5`}>
          Built by <span className="text-foreground">Denys Sergushkin</span>
          <ArrowUpRight aria-hidden className="size-3" />
        </a>
      </nav>
    </footer>
  )
}
