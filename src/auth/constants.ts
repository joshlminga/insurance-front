/** localStorage key for the Zustand auth session */
export const AUTH_STORAGE_KEY = 'auth-storage'

/** Role slug that bypasses all module/permission checks in the UI */
export const SUPER_ADMIN_ROLE = 'super_admin'

/** HTTP header for scoped org-location context (see organization-context.php on API) */
export const ORG_LOCATION_HEADER = 'X-Organization-Location-Id'

/** HTTP header for selected country alpha2 code (e.g. KE, UG) */
export const LOCATION_CODE_HEADER = 'X-Location-Code'

/** localStorage key for selected org location (also stored in auth-storage) */
export const ORG_LOCATION_STORAGE_KEY = 'selected_org_location_id'

/** Refresh token this many seconds before expiry */
export const TOKEN_REFRESH_BUFFER_SECONDS = 300
