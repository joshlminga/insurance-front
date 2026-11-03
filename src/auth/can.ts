import { SUPER_ADMIN_ROLE } from './constants'
import type { Abilities } from './types'

/** Build a Set for O(1) permission lookups (avoids array.includes on every render) */
export function buildPermissionSet(permissions: string[]): Set<string> {
  return new Set(permissions)
}

/**
 * Bypass all permission checks only for:
 * - platform super_admin
 * - public general users with no org role scopes
 *
 * Org staff can still have is_general=true incorrectly; if they have role scopes,
 * enforce role permissions (same idea as ResolveOrganizationContextMiddleware).
 */
export function isBypassUser(abilities: Abilities | null | undefined): boolean {
  if (!abilities) return false
  if (abilities.roles.includes(SUPER_ADMIN_ROLE)) return true
  if (abilities.is_general && (abilities.scopes?.length ?? 0) === 0) return true
  return false
}

/**
 * Check a single permission - mirrors API AutoPermissionMiddleware bypass order:
 * 1. super_admin → allow
 * 2. public is_general (no role scopes) → allow
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
