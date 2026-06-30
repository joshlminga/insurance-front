import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { UseAuth } from '@/stores/auth-store'
import { EROUTES } from '@/utils/enums'
import { useCan } from './useCan'
import { useModules } from './useModules'

interface ModuleRouteProps {
  /** RBAC module key required to view this route */
  module: string
  /** Optional finer permission e.g. quotation-motor.read */
  permission?: string
  children: ReactNode
  redirectTo?: string
}

/**
 * Route guard for direct URL access (case 3) — like Laravel middleware on a route group.
 * Redirects to dashboard when the user lacks the required module or permission.
 */
export function ModuleRoute({
  module,
  permission,
  children,
  redirectTo = EROUTES.DASHBOARD,
}: ModuleRouteProps) {
  const { isLoading } = UseAuth()
  const { hasModule } = useModules()
  const { can } = useCan()

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-dotted border-4 border-[#C20C0C] border-t-[#C20C0C] animation-duration-[4s]" />
      </div>
    )
  }

  if (!hasModule(module)) {
    return <Navigate to={redirectTo} replace />
  }

  if (permission && !can(permission)) {
    return <Navigate to={redirectTo} replace />
  }

  return <>{children}</>
}
