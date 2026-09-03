import { useCallback, useEffect, useMemo, useState } from 'react'
import { useCan } from '@/auth/useCan'
import { ORG_LOCATION_HEADER } from '@/auth/constants'

/**
 * Super admins / is_general users have no org in session, and the axios
 * interceptor does not send X-Organization-Location-Id for them.
 * This hook keeps a page-local location choice and builds that header.
 */
export function useBypassOrgLocation(storageKey: string) {
  const { isBypass } = useCan()
  const [selectedLocationId, setSelectedLocationId] = useState('')

  useEffect(() => {
    if (!isBypass) {
      return
    }

    const stored = localStorage.getItem(storageKey)
    if (stored) {
      setSelectedLocationId(stored)
    }
  }, [isBypass, storageKey])

  const setLocationId = useCallback(
    (id: string) => {
      setSelectedLocationId(id)

      if (!isBypass) {
        return
      }

      if (id) {
        localStorage.setItem(storageKey, id)
      } else {
        localStorage.removeItem(storageKey)
      }
    },
    [isBypass, storageKey],
  )

  const orgContextHeaders = useMemo((): Record<string, string> | undefined => {
    if (!isBypass || !selectedLocationId) {
      return undefined
    }

    return { [ORG_LOCATION_HEADER]: selectedLocationId }
  }, [isBypass, selectedLocationId])

  /** Org users always fetch; bypass users must pick a location first. */
  const canFetch = !isBypass || Boolean(selectedLocationId)

  return {
    isBypass,
    selectedLocationId,
    setLocationId,
    orgContextHeaders,
    canFetch,
  }
}
