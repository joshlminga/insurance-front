import { useMemo } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { can, canAny, canModuleAction, isBypassUser } from './can'
import { hasModule, hasAnyModule } from './modules'
import {
  getActivePermissionSet,
  needsOrgLocation,
  scopesToLocationOptions,
} from './org-context'
import type { CanAccessOptions } from './types'

/**
 * Combined RBAC hook — permissions, modules, roles, and org context in one place.
 */
export function useAbilities() {
  const abilities = useAuthStore((s) => s.abilities)
  const organizationLocationId = useAuthStore((s) => s.organizationLocationId)

  const activeSet = useMemo(
    () => getActivePermissionSet(abilities),
    [abilities],
  )

  const locationOptions = useMemo(
    () => (abilities ? scopesToLocationOptions(abilities.scopes) : []),
    [abilities],
  )

  const canAccess = (options: CanAccessOptions): boolean => {
    if (!abilities) return false
    if (isBypassUser(abilities)) return true

    const { module, permission, requireAll = true } = options
    let moduleCheck = true
    let permissionCheck = true

    if (module) {
      moduleCheck = hasModule(abilities, module)
    }
    if (permission) {
      permissionCheck = can(abilities, permission, activeSet)
    }

    return requireAll ? moduleCheck && permissionCheck : moduleCheck || permissionCheck
  }

  return {
    abilities,
    organizationLocationId,
    locationOptions,
    needsOrgLocation: needsOrgLocation(abilities),
    isBypass: isBypassUser(abilities),

    hasModule: (module: string) => hasModule(abilities, module),
    hasAnyModule: (modules: string[]) => hasAnyModule(abilities, modules),

    can: (permission: string) => can(abilities, permission, activeSet),
    canAny: (permissions: string[]) => canAny(abilities, permissions, activeSet),
    canModuleAction: (module: string, action: string) =>
      canModuleAction(abilities, module, action, activeSet),

    canAccess,
  }
}
