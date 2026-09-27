import type { Abilities } from '@/auth/types'
import { EROUTES } from '@/utils/enums'

/**
 * Decide public app vs org backend from roles.
 * - No roles, or only "member" → public landing
 * - Any other role → organization dashboard
 */
export function isPublicAppUser(abilities: Abilities | null | undefined): boolean {
  const fromScopes = (abilities?.scopes ?? [])
    .map((scope) => scope.role)
    .filter((role): role is string => typeof role === 'string' && role !== '')

  const names = [
    ...new Set(
      fromScopes.length > 0 ? fromScopes : (abilities?.roles ?? []).filter(Boolean),
    ),
  ]

  if (names.length === 0) {
    return true
  }

  return names.length === 1 && names[0] === 'member'
}

/** Post-login / post-verify home path (ignores returnTo — caller handles that). */
export function homePathForAbilities(abilities: Abilities | null | undefined): string {
  return isPublicAppUser(abilities) ? EROUTES.LANDING : EROUTES.DASHBOARD
}
