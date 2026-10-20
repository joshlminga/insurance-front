/**
 * Shared helpers for sidebar active/open state.
 * Prefix matching uses `${url}/` so /products/motor does not match /products/motor-rates.
 */

export function isPathActive(
  pathname: string,
  url?: string,
  matchPrefixes?: string[]
): boolean {
  if (url) {
    if (pathname === url || pathname.startsWith(`${url}/`)) {
      return true
    }
  }
  if (matchPrefixes?.length) {
    return matchPrefixes.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    )
  }
  return false
}

export function isSubItemActive(
  pathname: string,
  subItem: {
    url?: string
    matchPrefixes?: string[]
    items?: Array<{ url?: string; matchPrefixes?: string[]; items?: unknown[] }>
  }
): boolean {
  if (isPathActive(pathname, subItem.url, subItem.matchPrefixes)) {
    return true
  }
  return (
    subItem.items?.some((child) =>
      isSubItemActive(
        pathname,
        child as {
          url?: string
          matchPrefixes?: string[]
          items?: Array<{ url?: string; matchPrefixes?: string[]; items?: unknown[] }>
        }
      )
    ) ?? false
  )
}

export function isNavItemActive(
  pathname: string,
  item: {
    url?: string
    matchPrefixes?: string[]
    items?: Array<{
      url?: string
      matchPrefixes?: string[]
      items?: Array<{ url?: string; matchPrefixes?: string[]; items?: unknown[] }>
    }>
  }
): boolean {
  if (isPathActive(pathname, item.url, item.matchPrefixes)) {
    return true
  }
  return item.items?.some((subItem) => isSubItemActive(pathname, subItem)) ?? false
}
