import { useBypassOrgLocation } from '@/auth/use-bypass-org-location'

/** Credit-setup only — not written to global auth session (avoids leaking into every API call). */
export const CREDIT_SETUP_ORG_STORAGE_KEY = 'credit-setup-organization-location-id'

/**
 * Super admins / is_general users have no org in session.
 * This hook keeps a per-page credit-setup location choice and builds the
 * same X-Organization-Location-Id header org finance users get from auth.
 */
export function useCreditSetupOrg() {
  const {
    isBypass,
    selectedLocationId,
    setLocationId,
    orgContextHeaders,
    canFetch,
  } = useBypassOrgLocation(CREDIT_SETUP_ORG_STORAGE_KEY)

  return {
    isBypass,
    selectedLocationId,
    setLocationId,
    orgContextHeaders,
    canFetchCreditSetup: canFetch,
  }
}
