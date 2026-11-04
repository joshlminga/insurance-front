import type { ReactNode } from 'react'
import { ModuleRoute } from './ModuleRoute'

interface AdminModulePageProps {
  module?: string
  modules?: string[]
  permission?: string
  /** Any-of permissions for shared URLs (e.g. credit transactions + recharge) */
  permissions?: string[]
  productLine?: string
  /** Passed through to ModuleRoute. Redirects unless the role is super_admin. */
  requireSuperAdmin?: boolean
  children: ReactNode
}

/**
 * Wraps a lazy-loaded admin page with ModuleRoute - use inside App.tsx <S> blocks.
 * Like Laravel route middleware: `->middleware('module:product-motor')`
 */
export function AdminModulePage({
  module,
  modules,
  permission,
  permissions,
  productLine,
  requireSuperAdmin,
  children,
}: AdminModulePageProps) {
  return (
    <ModuleRoute
      module={module}
      modules={modules}
      permission={permission}
      permissions={permissions}
      productLine={productLine}
      requireSuperAdmin={requireSuperAdmin}
    >
      {children}
    </ModuleRoute>
  )
}
