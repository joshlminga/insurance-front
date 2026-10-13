import { EROUTES } from '@/utils/enums'
import { Navigate } from 'react-router-dom'

/**
 * Old /claims/new URL. Motor search now lives at /claims.
 */
export function ClaimsNewPage() {
  return <Navigate to={EROUTES.CLAIMS} replace />
}
