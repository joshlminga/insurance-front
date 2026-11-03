/**
 * Pure access check for ModuleRoute / AdminModulePage.
 * Matches the sidebar: module pages need `{module}.menu`, plus any finer permission.
 */
export function hasModuleRouteAccess(options: {
  /** True when the route has no module/modules (product-line-only pages). */
  skipModuleCheck: boolean
  /** User has `{module}.menu` for the single module, or any of modules[].menu */
  hasMenuAccess: boolean
  /** Optional exact permission on the route */
  permission?: string
  /** Optional any-of permissions (e.g. credit transactions OR recharge) */
  permissions?: string[]
  can: (permission: string) => boolean
}): boolean {
  const { skipModuleCheck, hasMenuAccess, permission, permissions, can } = options

  if (!skipModuleCheck && !hasMenuAccess) {
    return false
  }

  if (permission && !can(permission)) {
    return false
  }

  if (permissions?.length && !permissions.some((p) => can(p))) {
    return false
  }

  return true
}
