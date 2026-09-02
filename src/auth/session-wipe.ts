import { AUTH_LOCAL_WIPE_KEY, AUTH_STORAGE_KEY, ORG_LOCATION_STORAGE_KEY } from '@/auth/constants'

/** This tab logged out — do not resurrect a JWT from localStorage or another tab. */
export function markAuthWiped(): void {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(AUTH_LOCAL_WIPE_KEY, String(Date.now()))
}

export function clearAuthWiped(): void {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(AUTH_LOCAL_WIPE_KEY)
}

export function isAuthWiped(): boolean {
  if (typeof window === 'undefined') return false
  return sessionStorage.getItem(AUTH_LOCAL_WIPE_KEY) != null
}

/** Drop every stored JWT / auth blob in this browser profile for this origin. */
export function wipeStoredAuth(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    sessionStorage.removeItem(AUTH_STORAGE_KEY)
    localStorage.removeItem(ORG_LOCATION_STORAGE_KEY)
    sessionStorage.removeItem(ORG_LOCATION_STORAGE_KEY)
  } catch {
    /* ignore quota / private mode */
  }
}
