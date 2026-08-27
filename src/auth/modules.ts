import { isBypassUser } from './can'
import type { Abilities } from './types'

function activePermissionList(abilities: Abilities): string[] {
  const contextPerms = abilities.context?.permissions
  if (contextPerms && contextPerms.length > 0) {
    return contextPerms
  }
  return abilities.permissions
}

/** Show a nav section / route only when the user has this module key */
export function hasModule(
  abilities: Abilities | null | undefined,
  moduleKey: string,
): boolean {
  if (!abilities) return false
  if (isBypassUser(abilities)) return true
  if (abilities.modules.includes(moduleKey)) return true

  // Role.module CSV can lag behind permission checkboxes (select-all / resync).
  // Any granted `{module}.*` permission implies module access for SPA gates.
  const prefix = `${moduleKey}.`
  return activePermissionList(abilities).some((permission) =>
    permission.startsWith(prefix),
  )
}

export function hasAnyModule(
  abilities: Abilities | null | undefined,
  moduleKeys: string[],
): boolean {
  return moduleKeys.some((key) => hasModule(abilities, key))
}

export function buildModuleSet(abilities: Abilities | null | undefined): Set<string> {
  if (!abilities) return new Set()
  return new Set(abilities.modules)
}
