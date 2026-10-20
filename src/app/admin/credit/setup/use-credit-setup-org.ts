import { useBypassOrgLocation } from '@/auth/use-bypass-org-location'

/** Credit-setup only - not written to global auth session (avoids leaking into every API call). */
export const CREDIT_SETUP_ORG_STORAGE_KEY = 'credit-setup-organization-location-id'

/**
 * Super admins / multi-location staff pick a location for credit setup.
 * Single-location staff use their scoped location automatically.
 */
export function useCreditSetupOrg() {
  const {
    isBypass,
    selectedLocationId,
    setLocationId,
    orgContextHeaders,
    canFetch,
    allowedLocationIds,
  } = useBypassOrgLocation(CREDIT_SETUP_ORG_STORAGE_KEY)

  return {
    isBypass,
    selectedLocationId,
    setLocationId,
    orgContextHeaders,
    canFetchCreditSetup: canFetch,
    allowedLocationIds,
  }
}
