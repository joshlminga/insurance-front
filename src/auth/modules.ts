import { isBypassUser } from './can'
import type { Abilities } from './types'

/** Show a nav section / route only when the user has this module key */
export function hasModule(
  abilities: Abilities | null | undefined,
  moduleKey: string,
): boolean {
  if (!abilities) return false
  if (isBypassUser(abilities)) return true
  return abilities.modules.includes(moduleKey)
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
