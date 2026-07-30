import { Loader2 } from 'lucide-react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { UseAuth } from '@/stores/auth-store'
import { EPREFIX, EROUTES } from '@/utils/enums'
import { isTenantSubdomain } from '@/lib/tenant-from-host'

const SIGNIN_PATH = `/${EPREFIX.AUTH}${EROUTES.SIGNIN}`

/**
 * Locks unauthenticated guests on tenant subdomains to /auth/* routes.
 * Root domain guests can browse landing and marketing pages as normal.
 */
export default function SubdomainGuestGate() {
  const { isAuthenticated, isLoading } = UseAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#C20C0C]" aria-label="Loading" />
      </div>
    )
  }

  const onSubdomain = isTenantSubdomain()
  const onAuthRoute = location.pathname.startsWith(`/${EPREFIX.AUTH}`)

  if (onSubdomain && !isAuthenticated && !onAuthRoute) {
    return <Navigate to={SIGNIN_PATH} replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
