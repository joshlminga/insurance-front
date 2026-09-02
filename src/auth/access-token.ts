import { AUTH_LOCAL_WIPE_KEY } from '@/auth/constants'

/**
 * In-memory JWT used by the API client.
 * localStorage can lag or stay on an old token after login/logout;
 * this value is updated in the same tick as setSession / logout.
 */
let accessToken: string | null = null
let hasSynced = false

export function syncAccessToken(token: string | null): void {
  accessToken = token
  hasSynced = true
}

/** Prefer the live session token; fall back to storage only before the store hydrates. */
export function getAccessToken(fallback?: string | null): string | null {
  if (typeof window !== 'undefined' && sessionStorage.getItem(AUTH_LOCAL_WIPE_KEY) && !accessToken) {
    return null
  }
  if (hasSynced) return accessToken
  return fallback ?? accessToken
}
