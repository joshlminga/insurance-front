import { buildPermissionSet, isBypassUser } from './can'
import type { Abilities, AbilityScope, LocationOption } from './types'

/** Convert API scopes into options for an org-location picker */
export function scopesToLocationOptions(scopes: AbilityScope[]): LocationOption[] {
  return scopes
    .filter((s) => s.organization_location_id !== null)
    .map((s) => ({
      organizationId: s.organization_id,
      locationId: s.organization_location_id as number,
      role: s.role,
      roleId: s.role_id,
      label: `Location #${s.organization_location_id} (${s.role})`,
    }))
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
