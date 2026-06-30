import apiClient from '@/lib/api-client'
import { ORG_LOCATION_HEADER } from './constants'
import type {
  Abilities,
  AbilitiesData,
  ApiSuccess,
  AuthSessionPayload,
  CheckAuthData,
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
