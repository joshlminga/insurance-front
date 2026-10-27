import type { NavItem, NavSubItem } from './admin-nav-config'
import {
  hasOrgProductLineAccess,
  requiredProductLineForNavItem,
} from './quotation-product-line-nav'

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
  item: { module?: string; modules?: string[]; permission?: string; requireSuperAdmin?: boolean },
  hasModule: (key: string) => boolean,
  canMenu: (moduleKey: string) => boolean,
  can?: (permission: string) => boolean,
  isPlatformSuperAdmin = false,
  contextProducts?: string[],
): boolean {
  // Checked before can()/hasModule(). Those helpers return true for is_general,
  // and is_general is not a platform super admin.
  if (item.requireSuperAdmin && !isPlatformSuperAdmin) {
    return false
  }

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

  const productLine = requiredProductLineForNavItem(item)
  if (productLine !== null && !hasOrgProductLineAccess(productLine, contextProducts)) {
    return false
  }

  return true
}

function filterNavSubItems(
  items: NavSubItem[],
  hasModule: (key: string) => boolean,
  canMenu: (moduleKey: string) => boolean,
  can?: (permission: string) => boolean,
  isPlatformSuperAdmin = false,
  contextProducts?: string[],
): NavSubItem[] {
  return items
    .map((sub) => {
      if (sub.items?.length) {
        const visibleChildren = filterNavSubItems(
          sub.items,
          hasModule,
          canMenu,
          can,
          isPlatformSuperAdmin,
          contextProducts,
        )
        if (visibleChildren.length === 0) return null
        if (!isNavItemVisible(sub, hasModule, canMenu, can, isPlatformSuperAdmin, contextProducts)) {
          return null
        }
        return { ...sub, items: visibleChildren }
      }

      if (!sub.url) return null
      if (!isNavItemVisible(sub, hasModule, canMenu, can, isPlatformSuperAdmin, contextProducts)) {
        return null
      }

      return sub
    })
    .filter((sub): sub is NavSubItem => sub != null)
}

/**
 * Filter sidebar nav by RBAC modules and `.menu` permissions.
 * - Sub-items: hidden when module(s) / menu permission missing or url is empty
 * - Sub-items with `permission`: also require that exact permission
 * - Items with `requireSuperAdmin`: hidden unless isPlatformSuperAdmin is true
 * - Nested sub-items: filtered recursively; group nodes hidden when no visible children remain
 * - Parent with children: hidden when no visible children remain (case 1)
 * - Parent modules / module: checked before showing parent
 */
export function filterNavItems(
  items: NavItem[],
  hasModule: (key: string) => boolean,
  canMenu: (moduleKey: string) => boolean,
  can?: (permission: string) => boolean,
  isPlatformSuperAdmin = false,
  contextProducts?: string[],
): NavItem[] {
  return items
    .map((item) => {
      if (item.items?.length) {
        const visibleChildren = filterNavSubItems(
          item.items,
          hasModule,
          canMenu,
          can,
          isPlatformSuperAdmin,
          contextProducts,
        )

        if (visibleChildren.length === 0) return null

        if (!isNavItemVisible(item, hasModule, canMenu, can, isPlatformSuperAdmin, contextProducts)) {
          return null
        }

        return { ...item, items: visibleChildren }
      }

      if (!isNavItemVisible(item, hasModule, canMenu, can, isPlatformSuperAdmin, contextProducts)) {
        return null
      }

      return item
    })
    .filter((item): item is NavItem => item != null)
}
