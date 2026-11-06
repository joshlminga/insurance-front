import { Link } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import type { SureProcessLink } from './sure-message-sync'

type Props = {
  links: SureProcessLink[]
}

/** Build a full browser URL from the current origin + app path (?term= supported). */
export function sureAbsoluteProcessUrl(path: string): string {
  const origin =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : ''
  const normalized = path.startsWith('/') ? path : `/${path}`

  return `${origin}${normalized}`
}

/** Split path + query for react-router Link. */
export function sureProcessLinkTarget(path: string): {
  pathname: string
  search?: string
} {
  const [pathname, query = ''] = path.split('?')
  return {
    pathname: pathname.startsWith('/') ? pathname : `/${pathname}`,
    ...(query ? { search: `?${query}` } : {}),
  }
}

/**
 * Manual quotation process links (results / filtered resume) from Sure AI.
 * Uses the current site origin so the href is a real absolute URL.
 */
export function SureProcessLinks({ links }: Props) {
  if (!links.length) {
    return null
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="border-b border-border bg-muted/40 px-3.5 py-2.5">
        <p className="text-sm font-medium text-foreground">
          Continue in quotation screens
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Links use this site&apos;s address. Resume opens with your quote already
          searched — click Resume on the row.
        </p>
      </div>
      <ul className="divide-y divide-border">
        {links.map((link) => {
          const absolute = sureAbsoluteProcessUrl(link.path)
          const target = sureProcessLinkTarget(link.path)

          return (
            <li
              key={link.path}
              className="grid grid-cols-1 items-center gap-2 px-3.5 py-3 sm:grid-cols-[1fr_auto]"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{link.label}</p>
                {link.hint ? (
                  <p className="mt-0.5 text-xs text-muted-foreground">{link.hint}</p>
                ) : null}
                <a
                  href={absolute}
                  className="mt-1 block truncate text-xs font-medium text-[#C20C0C] underline-offset-2 hover:underline"
                  title={absolute}
                >
                  {absolute}
                </a>
              </div>
              <Link
                to={target}
                className="inline-flex items-center justify-center gap-1.5 rounded-md bg-[#C20C0C] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#a40a0a]"
              >
                Open
                <ExternalLink className="size-3.5" />
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
