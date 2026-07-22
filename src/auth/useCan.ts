import { useMemo } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import {
  buildPermissionSet,
  can,
  canAny,
  canModuleAction,
  hasAnyRole,
  hasRole,
  isBypassUser,
} from './can'
import { SUPER_ADMIN_ROLE } from './constants'
import { getActivePermissionSet } from './org-context'

/**
 * Permission-check hook — like $user->can() in Laravel.
 * Builds permission Sets once per abilities change for fast lookups.
 */
export function useCan() {
  const abilities = useAuthStore((s) => s.abilities)

  const globalPermissions = useMemo(
    () => (abilities ? buildPermissionSet(abilities.permissions) : new Set<string>()),
    [abilities],
  )

  const contextPermissions = useMemo(() => {
    if (!abilities?.context?.permissions?.length) return null
    return buildPermissionSet(abilities.context.permissions)
  }, [abilities])

  const activeSet = useMemo(
    () => getActivePermissionSet(abilities),
    [abilities],
  )

  return {
    can: (permission: string) => can(abilities, permission, activeSet),
    canAny: (permissions: string[]) => canAny(abilities, permissions, activeSet),
    canModuleAction: (module: string, action: string) =>
      canModuleAction(abilities, module, action, activeSet),
    hasRole: (role: string) => hasRole(abilities, role),
    hasAnyRole: (roles: string[]) => hasAnyRole(abilities, roles),
    isSuperAdmin: abilities?.roles.includes(SUPER_ADMIN_ROLE) ?? false,
    isGeneral: abilities?.is_general ?? false,
    isBypass: isBypassUser(abilities),
    globalPermissions,
    contextPermissions,
    activeSet,
  }
}
