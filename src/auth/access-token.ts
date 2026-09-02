/**
 * In-memory JWT used by the API client.
 * Updated in the same tick as setSession / logout so requests do not keep an old token.
 */
let accessToken: string | null = null
let hasSynced = false

export function syncAccessToken(token: string | null): void {
  accessToken = token
  hasSynced = true
}

/** Prefer the live session token; fall back to storage only before the store hydrates. */
export function getAccessToken(fallback?: string | null): string | null {
  if (hasSynced) return accessToken
  return fallback ?? accessToken
}
