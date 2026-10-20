import type { ReactNode } from 'react'
import { ModuleRoute } from './ModuleRoute'

interface AdminModulePageProps {
  module?: string
  modules?: string[]
  permission?: string
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
  requireSuperAdmin,
  children,
}: AdminModulePageProps) {
  return (
    <ModuleRoute
      module={module}
      modules={modules}
      permission={permission}
      requireSuperAdmin={requireSuperAdmin}
    >
      {children}
    </ModuleRoute>
  )
}
