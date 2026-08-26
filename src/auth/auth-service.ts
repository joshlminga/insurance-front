import apiClient from '@/lib/api-client'
import { UseApiMutation, UseApiQuery } from '@/hooks/hooks'
import { ORG_LOCATION_HEADER } from './constants'
import type {
  Abilities,
  AbilitiesData,
  ApiSuccess,
  AuthSessionPayload,
  CheckAuthData,
  OrgResolveData,
} from './types'

function authHeaders(token: string, organizationLocationId?: number | null) {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  }
  if (organizationLocationId != null) {
    headers[ORG_LOCATION_HEADER] = String(organizationLocationId)
  }
  return headers
}

/**
 * Resolves tenant branding and location from the browser Origin.
 * This is the React Query version for use inside React components.
 */
export function useResolveOrganization() {
  return UseApiQuery<ApiSuccess<OrgResolveData>>({
    url: 'auth/org',
    queryKey: ['auth', 'organization'],
    queryOptions: {
      enabled: true,
    },
  })
}

/**
 * Fetches the current user's abilities for an organization location.
 * The token and location are included in the cache key to avoid stale permissions.
 */
export function useFetchAbilities(
  token: string | null | undefined,
  organizationLocationId?: number | null,
) {
  return UseApiQuery<ApiSuccess<AbilitiesData>>({
    url: 'auth/abilities',
    queryKey: ['auth', 'abilities', token ?? null, organizationLocationId ?? null],
    config: token
      ? { headers: authHeaders(token, organizationLocationId) }
      : undefined,
    queryOptions: {
      enabled: Boolean(token),
    },
  })
}

/** Validates a stored session token. Call `mutate()` to run the check. */
export function useCheckAuth(token: string | null | undefined) {
  return UseApiMutation<ApiSuccess<CheckAuthData>, void>({
    url: 'auth/check-auth',
    config: token ? { headers: authHeaders(token) } : undefined,
  })
}

/** Refreshes the full session and rotates the access token. */
export function useRefreshSession(
  token: string | null | undefined,
  organizationLocationId?: number | null,
) {
  return UseApiMutation<AuthSessionPayload, void>({
    url: 'auth/refresh',
    config: token
      ? { headers: authHeaders(token, organizationLocationId) }
      : undefined,
  })
}

/** Ends the current server session. */
export function useLogoutOnServer(token: string | null | undefined) {
  return UseApiMutation<void, void>({
    url: 'auth/logout',
    config: token ? { headers: authHeaders(token) } : undefined,
  })
}

/**
 * Resolve tenant org location from the browser Origin header (API reads Origin).
 * Imperative counterpart used by the non-React auth-store bootstrap.
 * Call only when organizationLocationId is not yet stored.
 */
export async function resolveOrganization(): Promise<OrgResolveData> {
  const { data } = await apiClient.get<ApiSuccess<OrgResolveData>>('auth/org')
  return data.data
}

/** Validate stored token and fetch fresh user + abilities on app boot */
export async function checkAuth(token: string): Promise<CheckAuthData> {
  const { data } = await apiClient.post<ApiSuccess<CheckAuthData>>(
    'auth/check-auth',
    {},
    { headers: authHeaders(token) },
  )
  return data.data
}

/** Lightweight abilities refresh — no new token (after role change or location switch) */
export async function fetchAbilities(
  token: string,
  organizationLocationId?: number | null,
): Promise<Abilities> {
  const { data } = await apiClient.get<ApiSuccess<AbilitiesData>>('auth/abilities', {
    headers: authHeaders(token, organizationLocationId),
  })
  return data.data.abilities
}

/** Full session refresh — new token + fresh abilities */
export async function refreshSession(
  token: string,
  organizationLocationId?: number | null,
): Promise<AuthSessionPayload> {
  const { data } = await apiClient.post<AuthSessionPayload>(
    'auth/refresh',
    {},
    { headers: authHeaders(token, organizationLocationId) },
  )
  return data
}

/** Server-side logout (best-effort; always clear local state in finally) */
export async function logoutOnServer(token: string): Promise<void> {
  await apiClient.post('auth/logout', {}, { headers: authHeaders(token) })
}
