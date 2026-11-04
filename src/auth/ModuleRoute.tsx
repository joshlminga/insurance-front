import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { UseAuth, useAuthStore } from '@/stores/auth-store'
import { EROUTES } from '@/utils/enums'
import { isPlatformSuperAdmin } from './org-context'
import { hasOrgProductLineAccess } from '@/navigation/quotation-product-line-nav'
import { hasModuleRouteAccess } from './module-route-access'
import { useCan } from './useCan'

interface ModuleRouteProps {
  /** Single RBAC module key required to view this route */
  module?: string
  /** User needs any of these module keys (alternative to module) */
  modules?: string[]
  /** Optional finer permission e.g. quotation-motor.read */
  permission?: string
  /** Optional any-of finer permissions (e.g. transactions OR recharge on a shared URL) */
  permissions?: string[]
  /** When set, require this product line on abilities.context.products (when context exists). */
  productLine?: string
  /**
   * Direct URL still redirects unless the user has the super_admin role.
   * is_general is not enough, even though it bypasses module checks.
   */
  requireSuperAdmin?: boolean
  children: ReactNode
  redirectTo?: string
}

/**
 * Route guard for direct URL access - like Laravel middleware on a route group.
 * Requires `{module}.menu` (same as the sidebar), plus any finer permission.
 * Redirects to dashboard when the user lacks access.
 */
export function ModuleRoute({
  module,
  modules,
  permission,
  permissions,
  productLine,
  requireSuperAdmin = false,
  children,
  redirectTo = EROUTES.DASHBOARD,
}: ModuleRouteProps) {
  const { isLoading } = UseAuth()
  const abilities = useAuthStore((s) => s.abilities)
  const { can, canModuleMenu } = useCan()

  // No module/modules means RBAC module check is skipped (product-line-only routes).
  const skipModuleCheck = !module && !modules?.length
  const hasMenuAccess = module
    ? canModuleMenu(module)
    : modules?.length
      ? modules.some((key) => canModuleMenu(key))
      : true

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

  if (
    !hasModuleRouteAccess({
      skipModuleCheck,
      hasMenuAccess,
      permission,
      permissions,
      can,
    })
  ) {
    return <Navigate to={redirectTo} replace />
  }

  if (
    productLine &&
    !hasOrgProductLineAccess(productLine, abilities?.context?.products)
  ) {
    return <Navigate to={redirectTo} replace />
  }

  return <>{children}</>
}
