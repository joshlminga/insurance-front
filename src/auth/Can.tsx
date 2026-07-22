import type { ReactNode } from 'react'
import { useCan } from './useCan'

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
