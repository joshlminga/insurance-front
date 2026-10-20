import { useCallback, useEffect, useMemo, useState } from 'react'
import { ORG_LOCATION_HEADER } from '@/auth/constants'
import {
  allowedOrgLocationIds,
  shouldShowOrgLocationPicker,
  singleScopedLocationId,
} from '@/auth/org-context'
import { useAuthStore } from '@/stores/auth-store'

/**
 * Org-scoped screens (finance, claims, credit) need X-Organization-Location-Id.
 *
 * - Super admin: pick any location (page-local storage).
 * - One unique role-scope location: hide picker and always send that id.
 * - Several unique locations: pick among those only.
 * - General public (is_general, no scopes): no staff picker.
 */
export function useBypassOrgLocation(storageKey: string) {
  const abilities = useAuthStore((s) => s.abilities)
  const showPicker = shouldShowOrgLocationPicker(abilities)
  const allowedLocationIds = allowedOrgLocationIds(abilities)
  const singleLocationId = singleScopedLocationId(abilities)

  const [selectedLocationId, setSelectedLocationId] = useState('')

  useEffect(() => {
    if (singleLocationId != null) {
      setSelectedLocationId(String(singleLocationId))
      return
    }

    if (!showPicker) {
      return
    }

    const stored = localStorage.getItem(storageKey)
    if (!stored) {
      return
    }

    const storedNum = Number(stored)
    const isAllowed =
      allowedLocationIds === null || allowedLocationIds.includes(storedNum)

    if (isAllowed) {
      setSelectedLocationId(stored)
    }
  }, [showPicker, storageKey, singleLocationId, allowedLocationIds])

  const setLocationId = useCallback(
    (id: string) => {
      setSelectedLocationId(id)

      if (!showPicker) {
        return
      }

      if (id) {
        localStorage.setItem(storageKey, id)
      } else {
        localStorage.removeItem(storageKey)
      }
    },
    [showPicker, storageKey],
  )

  const effectiveLocationId =
    selectedLocationId ||
    (singleLocationId != null ? String(singleLocationId) : '')

  const orgContextHeaders = useMemo((): Record<string, string> | undefined => {
    // Super admin and multi-location staff send a page-local header.
    // Single-location staff also attach it so lists work before session sync.
    if (!effectiveLocationId) {
      return undefined
    }

    if (!showPicker && singleLocationId == null) {
      return undefined
    }

    return { [ORG_LOCATION_HEADER]: effectiveLocationId }
  }, [showPicker, singleLocationId, effectiveLocationId])

  /** Org users / single location always fetch; multi / super admin must pick first. */
  const canFetch = !showPicker || Boolean(effectiveLocationId)

  return {
    /** true when the screen should render BypassOrgLocationPicker */
    isBypass: showPicker,
    selectedLocationId: effectiveLocationId,
    setLocationId,
    orgContextHeaders,
    canFetch,
    /** null = all locations (super admin); otherwise only these ids */
    allowedLocationIds,
  }
}
