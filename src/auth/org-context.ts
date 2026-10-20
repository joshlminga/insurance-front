import { buildPermissionSet, isBypassUser } from './can'
import { SUPER_ADMIN_ROLE } from './constants'
import type { Abilities, AbilityScope, LocationOption } from './types'

/**
 * Unique organization_location_id values from role scopes.
 * Many roles on the same branch still count as one location.
 */
export function uniqueScopedLocationIds(
  abilities: Abilities | null | undefined,
): number[] {
  if (!abilities?.scopes?.length) return []

  const ids = new Set<number>()
  for (const scope of abilities.scopes) {
    if (scope.organization_location_id != null) {
      ids.add(scope.organization_location_id)
    }
  }

  return [...ids]
}

/** Platform super_admin only — not org staff with is_general. */
export function isPlatformSuperAdmin(
  abilities: Abilities | null | undefined,
): boolean {
  return abilities?.roles.includes(SUPER_ADMIN_ROLE) ?? false
}

/** Exactly one unique scoped location, or null. */
export function singleScopedLocationId(
  abilities: Abilities | null | undefined,
): number | null {
  const ids = uniqueScopedLocationIds(abilities)
  return ids.length === 1 ? ids[0]! : null
}

/**
 * Location IDs the staff org picker may show.
 * null = no filter (super admin sees every location).
 */
export function allowedOrgLocationIds(
  abilities: Abilities | null | undefined,
): number[] | null {
  if (!abilities) return []
  if (isPlatformSuperAdmin(abilities)) return null
  return uniqueScopedLocationIds(abilities)
}

/**
 * Show the org-location picker on finance / claims / credit screens.
 * Super admin: yes. Multiple unique scopes: yes. One scope or none: no.
 */
export function shouldShowOrgLocationPicker(
  abilities: Abilities | null | undefined,
): boolean {
  if (!abilities) return false
  if (isPlatformSuperAdmin(abilities)) return true
  return uniqueScopedLocationIds(abilities).length > 1
}

/**
 * Convert API scopes into options for an org-location picker.
 * Dedupes by locationId so many roles on one branch = one option.
 */
export function scopesToLocationOptions(scopes: AbilityScope[]): LocationOption[] {
  const byLocation = new Map<number, LocationOption>()

  for (const s of scopes) {
    if (s.organization_location_id === null) continue

    const locationId = s.organization_location_id
    if (byLocation.has(locationId)) continue

    byLocation.set(locationId, {
      organizationId: s.organization_id,
      locationId,
      role: s.role,
      roleId: s.role_id,
      label: `Location #${locationId} (${s.role})`,
    })
  }

  return [...byLocation.values()]
}

/** Scoped users with non-empty scopes must pick a location before context permissions apply */
export function needsOrgLocation(abilities: Abilities | null | undefined): boolean {
  if (!abilities || isBypassUser(abilities)) return false
  return abilities.scopes.length > 0
}

/**
 * Pick the active permission set for can() checks:
 * - context.permissions when location is selected and non-empty
 * - otherwise global abilities.permissions
 */
export function getActivePermissionSet(
  abilities: Abilities | null | undefined,
): Set<string> {
  if (!abilities) return new Set()

  const contextPerms = abilities.context?.permissions
  if (contextPerms && contextPerms.length > 0) {
    return buildPermissionSet(contextPerms)
  }

  return buildPermissionSet(abilities.permissions)
}
