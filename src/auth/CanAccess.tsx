import type { ReactNode } from 'react'
import { useAbilities } from './useAbilities'
import { useCan } from './useCan'
import type { CanAccessOptions } from './types'

interface CanAccessProps {
  requires: CanAccessOptions
  children: ReactNode
  fallback?: ReactNode
  className?: string
}

/** Conditional render by module and/or permission — ready for when you gate UI */
export function CanAccess({
  requires,
  children,
  fallback = null,
  className,
}: CanAccessProps) {
  const { canAccess } = useAbilities()

  if (!canAccess(requires)) {
    return fallback ? <div className={className}>{fallback}</div> : null
  }

  return <div className={className}>{children}</div>
}

/** Headless variant — no wrapper div */
export function CanAccessHeadless({
  requires,
  children,
  fallback = null,
}: Omit<CanAccessProps, 'className'>) {
  const { canAccess } = useAbilities()
  return canAccess(requires) ? children : fallback
}

interface CanProps {
  permission: string
  children: ReactNode
  fallback?: ReactNode
}

/** Conditionally render children when the user has a permission — like @can in Blade */
export function Can({ permission, children, fallback = null }: CanProps) {
  const { can } = useCan()
  return can(permission) ? <>{children}</> : <>{fallback}</>
}
