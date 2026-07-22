import type { NavItem } from './admin-nav-config'

/**
 * Filter sidebar nav by RBAC modules.
 * - Sub-items: hidden when module(s) missing or url is empty (placeholder links)
 * - Parent with children: hidden when no visible children remain (case 1)
 * - Parent modules / module: checked before showing parent
 */
export function filterNavItems(
  items: NavItem[],
  hasModule: (key: string) => boolean,
  hasAnyModule: (keys: string[]) => boolean,
): NavItem[] {
  return items
    .map((item) => {
      if (item.items?.length) {
        const visibleChildren = item.items.filter((sub) => {
          if (!sub.url) return false
          if (sub.modules?.length && !hasAnyModule(sub.modules)) return false
          if (sub.module && !hasModule(sub.module)) return false
          return true
        })

        if (visibleChildren.length === 0) return null

        if (item.modules?.length && !hasAnyModule(item.modules)) return null
        if (item.module && !hasModule(item.module)) return null

        return { ...item, items: visibleChildren }
      }

      if (item.modules?.length && !hasAnyModule(item.modules)) return null
      if (item.module && !hasModule(item.module)) return null

      return item
    })
    .filter((item): item is NavItem => item != null)
}
