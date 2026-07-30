import { LOCATION_CODE_HEADER } from '@/auth/constants'

/** localStorage key for custom request-context headers (country code, future tenant, etc.) */
export const REQUEST_CONTEXT_STORAGE_KEY = 'request-context-headers'

/**
 * Maps a field stored in localStorage → the HTTP header name sent on every API request.
 * To add a new custom header later: add one row here, then call setRequestContextValue(...).
 */
export const REQUEST_CONTEXT_HEADER_MAP = [
  { storageKey: 'locationCode', header: LOCATION_CODE_HEADER },
  // future: { storageKey: 'tenantId', header: 'X-Tenant-Id' },
] as const

export type RequestContextStorageKey =
  (typeof REQUEST_CONTEXT_HEADER_MAP)[number]['storageKey']

export type RequestContext = Partial<Record<RequestContextStorageKey, string>>

/** Read parsed JSON from localStorage (safe fallback `{}`) */
export function getRequestContext(): RequestContext {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(REQUEST_CONTEXT_STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as RequestContext
  } catch {
    return {}
  }
}

/** Write one field and save back to localStorage */
export function setRequestContextValue(
  storageKey: RequestContextStorageKey,
  value: string,
): void {
  if (typeof window === 'undefined') return
  try {
    const next: RequestContext = {
      ...getRequestContext(),
      [storageKey]: value,
    }
    localStorage.setItem(REQUEST_CONTEXT_STORAGE_KEY, JSON.stringify(next))
  } catch {
    /* ignore quota / private mode */
  }
}

/**
 * Loop the registry; return headers for non-empty values.
 * Example: { 'X-Location-Code': 'KE' }
 */
export function buildRequestContextHeaders(): Record<string, string> {
  const context = getRequestContext()
  const headers: Record<string, string> = {}

  for (const { storageKey, header } of REQUEST_CONTEXT_HEADER_MAP) {
    const value = context[storageKey]
    if (value != null && value !== '') {
      headers[header] = value
    }
  }

  return headers
}
