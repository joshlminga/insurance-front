import type { NavItem } from './admin-nav-config'

function hasModuleWithMenu(
  key: string,
  hasModule: (key: string) => boolean,
  canMenu: (moduleKey: string) => boolean,
): boolean {
  return hasModule(key) && canMenu(key)
}

function hasAnyModuleWithMenu(
  keys: string[],
  hasModule: (key: string) => boolean,
  canMenu: (moduleKey: string) => boolean,
): boolean {
  return keys.some((key) => hasModuleWithMenu(key, hasModule, canMenu))
}

function isNavItemVisible(
  item: { module?: string; modules?: string[] },
  hasModule: (key: string) => boolean,
  canMenu: (moduleKey: string) => boolean,
): boolean {
  if (item.modules?.length) {
    return hasAnyModuleWithMenu(item.modules, hasModule, canMenu)
  }
  if (item.module) {
    return hasModuleWithMenu(item.module, hasModule, canMenu)
  }
  return true
}

/**
 * Filter sidebar nav by RBAC modules and `.menu` permissions.
 * - Sub-items: hidden when module(s) / menu permission missing or url is empty
 * - Parent with children: hidden when no visible children remain (case 1)
 * - Parent modules / module: checked before showing parent
 */
export function filterNavItems(
  items: NavItem[],
  hasModule: (key: string) => boolean,
  canMenu: (moduleKey: string) => boolean,
): NavItem[] {
  return items
    .map((item) => {
      if (item.items?.length) {
        const visibleChildren = item.items.filter((sub) => {
          if (!sub.url) return false
          return isNavItemVisible(sub, hasModule, canMenu)
        })

        if (visibleChildren.length === 0) return null

        if (!isNavItemVisible(item, hasModule, canMenu)) return null

        return { ...item, items: visibleChildren }
      }

      if (!isNavItemVisible(item, hasModule, canMenu)) return null

      return item
    })
    .filter((item): item is NavItem => item != null)
}
