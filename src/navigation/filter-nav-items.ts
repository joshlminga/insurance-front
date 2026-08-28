import type { NavItem, NavSubItem } from './admin-nav-config'

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
  item: { module?: string; modules?: string[]; permission?: string },
  hasModule: (key: string) => boolean,
  canMenu: (moduleKey: string) => boolean,
  can?: (permission: string) => boolean,
): boolean {
  // Module + .menu gate first (same as before)
  if (item.modules?.length) {
    if (!hasAnyModuleWithMenu(item.modules, hasModule, canMenu)) return false
  } else if (item.module) {
    if (!hasModuleWithMenu(item.module, hasModule, canMenu)) return false
  }

  // Optional finer permission (e.g. finance-control.mine on Credit children)
  if (item.permission && can && !can(item.permission)) {
    return false
  }

  return true
}

function filterNavSubItems(
  items: NavSubItem[],
  hasModule: (key: string) => boolean,
  canMenu: (moduleKey: string) => boolean,
  can?: (permission: string) => boolean,
): NavSubItem[] {
  return items
    .map((sub) => {
      if (sub.items?.length) {
        const visibleChildren = filterNavSubItems(sub.items, hasModule, canMenu, can)
        if (visibleChildren.length === 0) return null
        if (!isNavItemVisible(sub, hasModule, canMenu, can)) return null
        return { ...sub, items: visibleChildren }
      }

      if (!sub.url) return null
      if (!isNavItemVisible(sub, hasModule, canMenu, can)) return null

      return sub
    })
    .filter((sub): sub is NavSubItem => sub != null)
}

/**
 * Filter sidebar nav by RBAC modules and `.menu` permissions.
 * - Sub-items: hidden when module(s) / menu permission missing or url is empty
 * - Sub-items with `permission`: also require that exact permission
 * - Nested sub-items: filtered recursively; group nodes hidden when no visible children remain
 * - Parent with children: hidden when no visible children remain (case 1)
 * - Parent modules / module: checked before showing parent
 */
export function filterNavItems(
  items: NavItem[],
  hasModule: (key: string) => boolean,
  canMenu: (moduleKey: string) => boolean,
  can?: (permission: string) => boolean,
): NavItem[] {
  return items
    .map((item) => {
      if (item.items?.length) {
        const visibleChildren = filterNavSubItems(item.items, hasModule, canMenu, can)

        if (visibleChildren.length === 0) return null

        if (!isNavItemVisible(item, hasModule, canMenu, can)) return null

        return { ...item, items: visibleChildren }
      }

      if (!isNavItemVisible(item, hasModule, canMenu, can)) return null

      return item
    })
    .filter((item): item is NavItem => item != null)
}
