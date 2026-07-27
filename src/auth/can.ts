import { SUPER_ADMIN_ROLE } from './constants'
import type { Abilities } from './types'

/** Build a Set for O(1) permission lookups (avoids array.includes on every render) */
export function buildPermissionSet(permissions: string[]): Set<string> {
  return new Set(permissions)
}

/** Platform admin or general user — bypass all permission checks */
export function isBypassUser(abilities: Abilities | null | undefined): boolean {
  if (!abilities) return false
  if (abilities.is_general) return true
  return abilities.roles.includes(SUPER_ADMIN_ROLE)
}

/**
 * Check a single permission — mirrors API AutoPermissionMiddleware bypass order:
 * 1. is_general → allow
 * 2. super_admin role → allow
 * 3. permission in active set → allow
 */
export function can(
  abilities: Abilities | null | undefined,
  permission: string,
  activeSet?: Set<string> | null,
): boolean {
  if (!abilities) return false
  if (isBypassUser(abilities)) return true

  const set =
    activeSet && activeSet.size > 0
      ? activeSet
      : buildPermissionSet(abilities.permissions)

  return set.has(permission)
}

export function canAny(
  abilities: Abilities | null | undefined,
  permissions: string[],
  activeSet?: Set<string> | null,
): boolean {
  return permissions.some((p) => can(abilities, p, activeSet))
}

export function canModuleAction(
  abilities: Abilities | null | undefined,
  module: string,
  action: string,
  activeSet?: Set<string> | null,
): boolean {
  return can(abilities, `${module}.${action}`, activeSet)
}

/** Check whether the user can see a module's sidebar nav item */
export function canModuleMenu(
  abilities: Abilities | null | undefined,
  moduleKey: string,
  activeSet?: Set<string> | null,
): boolean {
  return can(abilities, `${moduleKey}.menu`, activeSet)
}

export function hasRole(
  abilities: Abilities | null | undefined,
  role: string,
): boolean {
  if (!abilities) return false
  return abilities.roles.includes(role)
}

export function hasAnyRole(
  abilities: Abilities | null | undefined,
  roles: string[],
): boolean {
  if (!abilities) return false
  return roles.some((r) => abilities.roles.includes(r))
}
