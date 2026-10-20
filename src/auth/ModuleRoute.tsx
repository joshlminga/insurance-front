import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { UseAuth, useAuthStore } from '@/stores/auth-store'
import { EROUTES } from '@/utils/enums'
import { isPlatformSuperAdmin } from './org-context'
import { useCan } from './useCan'
import { useModules } from './useModules'

interface ModuleRouteProps {
  /** Single RBAC module key required to view this route */
  module?: string
  /** User needs any of these module keys (alternative to module) */
  modules?: string[]
  /** Optional finer permission e.g. quotation-motor.read */
  permission?: string
  /**
   * Direct URL still redirects unless the user has the super_admin role.
   * is_general is not enough, even though it bypasses module checks.
   */
  requireSuperAdmin?: boolean
  children: ReactNode
  redirectTo?: string
}

/**
 * Route guard for direct URL access (case 3) - like Laravel middleware on a route group.
 * Redirects to dashboard when the user lacks the required module or permission.
 */
export function ModuleRoute({
  module,
  modules,
  permission,
  requireSuperAdmin = false,
  children,
  redirectTo = EROUTES.DASHBOARD,
}: ModuleRouteProps) {
  const { isLoading } = UseAuth()
  const abilities = useAuthStore((s) => s.abilities)
  const { hasModule, hasAnyModule } = useModules()
  const { can } = useCan()

  const hasModuleAccess = module
    ? hasModule(module)
    : modules?.length
      ? hasAnyModule(modules)
      : false

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-dotted border-4 border-[#C20C0C] border-t-[#C20C0C] animation-duration-[4s]" />
      </div>
    )
  }

  // Same check as the sidebar. Runs before the module check so is_general cannot slip in.
  if (requireSuperAdmin && !isPlatformSuperAdmin(abilities)) {
    return <Navigate to={redirectTo} replace />
  }

  if (!hasModuleAccess) {
    return <Navigate to={redirectTo} replace />
  }

  if (permission && !can(permission)) {
    return <Navigate to={redirectTo} replace />
  }

  return <>{children}</>
}
