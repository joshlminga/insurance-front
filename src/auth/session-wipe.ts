import {
  AUTH_LOGOUT_BROADCAST_KEY,
  AUTH_STORAGE_KEY,
  AUTH_TAB_SIGNED_OUT_KEY,
  ORG_LOCATION_STORAGE_KEY,
} from '@/auth/constants'

/** Drop stored JWT / auth blobs. Call only from the user Logout action. */
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

/** Tell every other tab on this origin to clear auth and go to sign-in. */
export function broadcastLogout(): void {
  if (typeof window === 'undefined') return
  wipeStoredAuth()
  try {
    localStorage.setItem(AUTH_LOGOUT_BROADCAST_KEY, String(Date.now()))
  } catch {
    /* ignore quota / private mode */
  }
}

/** This browser tab chose Log out — it must not silently become logged in again. */
export function markTabSignedOut(): void {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(AUTH_TAB_SIGNED_OUT_KEY, '1')
}

export function clearTabSignedOut(): void {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(AUTH_TAB_SIGNED_OUT_KEY)
}

export function isTabSignedOut(): boolean {
  if (typeof window === 'undefined') return false
  return sessionStorage.getItem(AUTH_TAB_SIGNED_OUT_KEY) === '1'
}
