import { useCallback, useEffect, useMemo, useState } from 'react'
import { useCan } from '@/auth/useCan'
import { ORG_LOCATION_HEADER } from '@/auth/constants'

/** Credit-setup only — not written to global auth session (avoids leaking into every API call). */
export const CREDIT_SETUP_ORG_STORAGE_KEY = 'credit-setup-organization-location-id'

/**
 * Super admins / is_general users have no org in session.
 * This hook keeps a per-page credit-setup location choice and builds the
 * same X-Organization-Location-Id header org finance users get from auth.
 */
export function useCreditSetupOrg() {
  const { isBypass } = useCan()
  const [selectedLocationId, setSelectedLocationId] = useState('')

  useEffect(() => {
    if (!isBypass) {
      return
    }

    const stored = localStorage.getItem(CREDIT_SETUP_ORG_STORAGE_KEY)
    if (stored) {
      setSelectedLocationId(stored)
    }
  }, [isBypass])

  const setLocationId = useCallback(
    (id: string) => {
      setSelectedLocationId(id)

      if (!isBypass) {
        return
      }

      if (id) {
        localStorage.setItem(CREDIT_SETUP_ORG_STORAGE_KEY, id)
      } else {
        localStorage.removeItem(CREDIT_SETUP_ORG_STORAGE_KEY)
      }
    },
    [isBypass],
  )

  const orgContextHeaders = useMemo((): Record<string, string> | undefined => {
    if (!isBypass || !selectedLocationId) {
      return undefined
    }

    return { [ORG_LOCATION_HEADER]: selectedLocationId }
  }, [isBypass, selectedLocationId])

  /** Org users always fetch; bypass users must pick a location first. */
  const canFetchCreditSetup = !isBypass || Boolean(selectedLocationId)

  return {
    isBypass,
    selectedLocationId,
    setLocationId,
    orgContextHeaders,
    canFetchCreditSetup,
  }
}
